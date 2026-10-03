import React, { useState } from "react";
import {
  Copy,
  Check,
  Zap,
  RotateCcw,
  Sparkles,
  Loader2,
  FileText,
  CheckCircle2,
  Code,
  Eye,
  Edit3,
} from "lucide-react";

import { PromptId } from "./PromptModal";

interface MainAreaProps {
  transcript: string;
  setTranscript: (text: string) => void;
  compressedText: string;
  setCompressedText: (text: string) => void;
  isLoading: boolean;
  viewMode: "split" | "input" | "output";
  onCompress: () => void;
  errorMessage: string | null;
  selectedPromptId?: PromptId;
}

export const MainArea: React.FC<MainAreaProps> = ({
  transcript,
  setTranscript,
  compressedText,
  setCompressedText,
  isLoading,
  viewMode,
  onCompress,
  errorMessage,
  selectedPromptId = "caveman",
}) => {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [renderMode, setRenderMode] = useState<"formatted" | "raw">("formatted");

  const promptName = selectedPromptId === "ponytail" ? "Ponytail" : "Caveman";

  const handleCopyInput = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const handleCopyOutput = async () => {
    if (!compressedText) return;
    await navigator.clipboard.writeText(compressedText);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <main className="flex-1 bg-slate-950 flex flex-col md:flex-row overflow-hidden relative">
      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* LEFT PANE: Transcript Input Area */}
      {(viewMode === "split" || viewMode === "input") && (
        <div
          className={`flex-1 flex flex-col border-r border-slate-800/80 bg-slate-950 p-4 min-w-0 transition-all ${
            viewMode === "input" ? "w-full" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                Original Transcript (Human ↔ LLM Exchange)
              </h2>
            </div>
            <div className="flex items-center gap-1">
              {transcript.length > 0 && (
                <button
                  onClick={handleCopyInput}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                  title="Copy input text"
                >
                  {copiedInput ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedInput ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative flex flex-col">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your full conversation transcript exchange between human and LLM here..."
              className="w-full flex-1 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 resize-none placeholder:text-slate-600 shadow-inner"
              spellCheck={false}
            />

            {/* Empty State Prompt */}
            {!transcript && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center text-slate-600">
                <Zap className="w-10 h-10 text-slate-700 mb-3 stroke-1" />
                <p className="text-sm font-medium text-slate-400 mb-1">
                  Paste a conversation transcript to compress
                </p>
                <p className="text-xs max-w-sm text-slate-500">
                  Or use the top menu to load a sample technical conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT PANE: Compressed Output Area */}
      {(viewMode === "split" || viewMode === "output") && (
        <div
          className={`flex-1 flex flex-col bg-slate-950 p-4 min-w-0 transition-all relative ${
            viewMode === "output" ? "w-full" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                Compressed Result ({promptName} Method)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Render Mode */}
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setRenderMode("formatted")}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                    renderMode === "formatted"
                      ? "bg-slate-800 text-amber-300 font-medium"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Formatted preview"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setRenderMode("raw")}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                    renderMode === "raw"
                      ? "bg-slate-800 text-amber-300 font-medium"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Raw editing"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Raw</span>
                </button>
              </div>

              {/* Copy Button */}
              {compressedText.length > 0 && (
                <button
                  onClick={handleCopyOutput}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  {copiedOutput ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{copiedOutput ? "Copied!" : "Copy"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative flex flex-col">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 border border-slate-800">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-200 mb-1">
                  {promptName} compression in progress with Gemini...
                </p>
                <p className="text-xs text-slate-400">
                  Applying compression prompt instructions with strict preservation of facts
                </p>
              </div>
            )}

            {renderMode === "raw" ? (
              <textarea
                value={compressedText}
                onChange={(e) => setCompressedText(e.target.value)}
                placeholder="Compressed output will appear here..."
                className="w-full flex-1 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-emerald-300 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 resize-none shadow-inner"
                spellCheck={false}
              />
            ) : (
              <div className="w-full flex-1 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed overflow-y-auto shadow-inner text-slate-200 select-text">
                {compressedText ? (
                  <FormattedCavemanOutput text={compressedText} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                    <Sparkles className="w-10 h-10 text-slate-700 mb-3 stroke-1" />
                    <p className="text-sm font-medium text-slate-400 mb-1">
                      {promptName} Compression Result
                    </p>
                    <p className="text-xs max-w-sm text-slate-500 mb-4">
                      Click the "Compress ({promptName})" button above to run Gemini LLM processing.
                    </p>
                    {transcript && (
                      <button
                        onClick={onCompress}
                        disabled={isLoading}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>Run Compression Now</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

/**
 * Renders structured Caveman output sections nicely (CONTEXT, FACTS, DECISIONS, CODE/TECH, STATE, OPEN)
 */
const FormattedCavemanOutput: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Highlight Section Headers
        if (
          trimmed.startsWith("CONTEXT:") ||
          trimmed.startsWith("FACTS:") ||
          trimmed.startsWith("DECISIONS:") ||
          trimmed.startsWith("CODE/TECH:") ||
          trimmed.startsWith("STATE:") ||
          trimmed.startsWith("OPEN:")
        ) {
          const parts = trimmed.split(":");
          const header = parts[0];
          const rest = parts.slice(1).join(":");

          return (
            <div key={idx} className="mt-4 first:mt-0 pt-2 border-t border-slate-800/60 first:border-none">
              <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider text-[11px] mr-2">
                {header}
              </span>
              <span className="text-slate-200">{rest}</span>
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="pl-4 border-l-2 border-amber-500/30 py-0.5 text-slate-300">
              {trimmed}
            </div>
          );
        }

        // Code block indicators
        if (trimmed.startsWith("```")) {
          return (
            <div key={idx} className="text-slate-500 font-semibold my-1">
              {trimmed}
            </div>
          );
        }

        return (
          <div key={idx} className={trimmed ? "text-slate-300" : "h-2"}>
            {line}
          </div>
        );
      })}
    </div>
  );
};
