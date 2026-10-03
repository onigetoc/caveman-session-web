import React, { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { MainArea } from "./components/MainArea";
import { StatusBar } from "./components/StatusBar";
import { PromptModal, PromptId } from "./components/PromptModal";
import {
  DEFAULT_CAVEMAN_PROMPT,
  DEFAULT_PONYTAIL_PROMPT,
  SAMPLE_CONVERSATIONS,
  SampleConversation,
} from "./constants/cavemanPrompt";
import { calculateComparison } from "./utils/tokenCounter";

export interface ApiUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export default function App() {
  const [transcript, setTranscript] = useState<string>(
    SAMPLE_CONVERSATIONS[0].transcript
  );
  const [compressedText, setCompressedText] = useState<string>("");
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null);
  
  const [selectedPromptId, setSelectedPromptId] = useState<PromptId>("caveman");
  const [lastCompressedPromptId, setLastCompressedPromptId] = useState<PromptId>("caveman");
  const [prompts, setPrompts] = useState<Record<PromptId, string>>({
    caveman: DEFAULT_CAVEMAN_PROMPT,
    ponytail: DEFAULT_PONYTAIL_PROMPT,
  });

  const [level, setLevel] = useState<"lite" | "full" | "ultra">("full");
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "input" | "output">(
    "split"
  );

  // Live Token & Word & Character Calculation
  const stats = useMemo(() => {
    return calculateComparison(transcript, compressedText);
  }, [transcript, compressedText]);

  const activePromptText = prompts[selectedPromptId];

  // Handler for compression request
  const handleCompress = async () => {
    if (!transcript || transcript.trim().length === 0) {
      setErrorMessage("Please enter or paste a conversation transcript.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/compress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          prompt: activePromptText,
          level,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error during Gemini compression.");
      }

      setCompressedText(data.compressedText);
      setLastCompressedPromptId(selectedPromptId);
      if (data.apiUsage) {
        setApiUsage(data.apiUsage);
      }
    } catch (err: any) {
      console.error("Compression error:", err);
      setErrorMessage(
        err.message || "An error occurred while calling the Gemini API."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: SampleConversation) => {
    setTranscript(preset.transcript);
    setCompressedText("");
    setApiUsage(null);
  };

  const handleClear = () => {
    setTranscript("");
    setCompressedText("");
    setApiUsage(null);
  };

  const handleResetPrompt = (id: PromptId) => {
    setPrompts((prev) => ({
      ...prev,
      [id]: id === "caveman" ? DEFAULT_CAVEMAN_PROMPT : DEFAULT_PONYTAIL_PROMPT,
    }));
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to launch compression
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCompress();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [transcript, activePromptText, level]);

  const isCustomPrompt =
    prompts.caveman.trim() !== DEFAULT_CAVEMAN_PROMPT.trim() ||
    prompts.ponytail.trim() !== DEFAULT_PONYTAIL_PROMPT.trim();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        level={level}
        setLevel={setLevel}
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
        onCompress={handleCompress}
        isLoading={isLoading}
        onSelectPreset={handleSelectPreset}
        onClear={handleClear}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isCustomPrompt={isCustomPrompt}
        transcriptLength={transcript.length}
        selectedPromptId={selectedPromptId}
      />

      {/* Main Split Section - Fills the entire right/center section */}
      <MainArea
        transcript={transcript}
        setTranscript={setTranscript}
        compressedText={compressedText}
        setCompressedText={setCompressedText}
        isLoading={isLoading}
        viewMode={viewMode}
        onCompress={handleCompress}
        errorMessage={errorMessage}
        selectedPromptId={compressedText ? lastCompressedPromptId : selectedPromptId}
      />

      {/* Bottom Status & Token Statistics Bar */}
      <StatusBar
        stats={stats}
        compressedText={compressedText}
        apiUsage={apiUsage}
        selectedPromptId={compressedText ? lastCompressedPromptId : selectedPromptId}
      />

      {/* System Prompt Customization Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        selectedPromptId={selectedPromptId}
        setSelectedPromptId={setSelectedPromptId}
        prompts={prompts}
        setPrompts={setPrompts}
        onResetPrompt={handleResetPrompt}
      />
    </div>
  );
}
