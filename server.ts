import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint for Caveman Conversation Compression
app.post("/api/compress", async (req, res) => {
  try {
    const { transcript, prompt, level = "full" } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcription text is required." });
    }

    const ai = getGeminiClient();

    const levelInstruction = `Intensity level: ${level} (lite, full, or ultra).`;
    const userMessage = `${levelInstruction}\n\nConversation to compress follows below:\n\n${transcript}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: userMessage,
      config: {
        systemInstruction: prompt || "You are a conversation compressor.",
        temperature: 0.2, // Low temperature for high precision & fidelity
      },
    });

    const compressedText = response.text || "";
    const usageMetadata = response.usageMetadata || {};
    const promptTokens = usageMetadata.promptTokenCount || 0;
    const candidatesTokens = usageMetadata.candidatesTokenCount || 0;
    const totalTokens = usageMetadata.totalTokenCount || (promptTokens + candidatesTokens);

    // Estimated Gemini 3.6 Flash pricing ($0.075 / 1M input tokens, $0.30 / 1M output tokens)
    const estimatedCostUsd = (promptTokens * 0.000000075) + (candidatesTokens * 0.0000003);

    return res.json({
      success: true,
      compressedText,
      apiUsage: {
        promptTokens,
        candidatesTokens,
        totalTokens,
        estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      },
    });
  } catch (error: any) {
    console.error("Compression API Error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to compress conversation transcript.",
    });
  }
});

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
