import React, { useState } from "react";
import {
  Copy,
  Check,
  TrendingDown,
  FileText,
  Zap,
  BarChart2,
  Download,
  Coins,
} from "lucide-react";
import { CompressionComparison } from "../utils/tokenCounter";
import { ApiUsage } from "../App";
import { PromptId } from "./PromptModal";

interface StatusBarProps {
  stats: CompressionComparison;
  compressedText: string;
  apiUsage?: ApiUsage | null;
  selectedPromptId?: PromptId;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stats,
  compressedText,
  apiUsage,
  selectedPromptId = "caveman",
}) => {
  const [copied, setCopied] = useState(false);
  const promptName = selectedPromptId === "ponytail" ? "Ponytail" : "Caveman";

  const handleCopy = async () => {
    if (!compressedText) return;
    try {
      await navigator.clipboard.writeText(compressedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleDownload = () => {
    if (!compressedText) return;
    const blob = new Blob([compressedText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${promptName.toLowerCase()}-compression-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasCompressed = stats.compressed.tokens > 0;

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-2.5 text-slate-300 text-xs flex flex-wrap items-center justify-between gap-4 sticky bottom-0 z-20 shadow-2xl backdrop-blur-md">
      {/* Left: Raw Stats (Original vs Compressed) */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Original Text Stats */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-500" />
          <span className="text-slate-400 font-medium">Original:</span>
          <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-semibold">
              {stats.original.tokens.toLocaleString("en-US")} <span className="text-[10px] text-slate-500 font-sans">tokens</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              {stats.original.words.toLocaleString("en-US")} <span className="text-[10px] text-slate-500 font-sans">words</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {stats.original.characters.toLocaleString("en-US")} <span className="text-[10px] text-slate-500 font-sans">chars</span>
            </span>
          </div>
        </div>

        {/* Compressed Text Stats */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-400 font-medium">Compressed ({promptName}):</span>
          <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold">
              {stats.compressed.tokens.toLocaleString("en-US")} <span className="text-[10px] text-slate-500 font-sans">tokens</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-200">
              {stats.compressed.words.toLocaleString("en-US")} <span className="text-[10px] text-slate-500 font-sans">words</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              {stats.compressed.characters.toLocaleString("en-US")} <span className="text-[10px] text-slate-500 font-sans">chars</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right: Percentage Economy Badge, Gemini API Cost & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Gemini Token Cost Usage Badge */}
        {apiUsage && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <div className="flex items-baseline gap-1 text-[11px]">
              <span className="text-slate-400 font-medium hidden sm:inline">LLM Cost:</span>
              <span className="font-mono font-bold text-amber-400">
                {apiUsage.totalTokens.toLocaleString("en-US")} tokens
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                ({apiUsage.promptTokens} in / {apiUsage.candidatesTokens} out)
              </span>
              <span className="font-mono font-semibold text-emerald-400 ml-1">
                ~${apiUsage.estimatedCostUsd < 0.0001 ? "< 0.0001" : apiUsage.estimatedCostUsd.toFixed(5)}
              </span>
            </div>
          </div>
        )}

        {hasCompressed && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-emerald-300 font-medium">Savings:</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                -{stats.tokenSavingsPercent}%
              </span>
              <span className="text-[10px] text-emerald-400/70 hidden sm:inline">
                ({stats.wordSavingsPercent}% words)
              </span>
            </div>
          </div>
        )}

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={!hasCompressed}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            hasCompressed
              ? copied
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
              : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
          }`}
          title="Copy compressed text"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy result</span>
            </>
          )}
        </button>

        {/* Export / Download Button */}
        {hasCompressed && (
          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            title="Download result as Markdown file"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </footer>
  );
};
