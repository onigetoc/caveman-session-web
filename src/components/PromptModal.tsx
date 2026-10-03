import React, { useState } from "react";
import { RotateCcw, X, Check, FileCode, Info, Sparkles, CheckCircle2 } from "lucide-react";
import {
  DEFAULT_CAVEMAN_PROMPT,
  DEFAULT_PONYTAIL_PROMPT,
} from "../constants/cavemanPrompt";

export type PromptId = "caveman" | "ponytail";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPromptId: PromptId;
  setSelectedPromptId: (id: PromptId) => void;
  prompts: Record<PromptId, string>;
  setPrompts: React.Dispatch<React.SetStateAction<Record<PromptId, string>>>;
  onResetPrompt: (id: PromptId) => void;
}

const PROMPT_CONFIG: Record<
  PromptId,
  { name: string; tag: string; description: string; defaultPrompt: string }
> = {
  caveman: {
    name: "Caveman",
    tag: "Telegraphic",
    description: "Converts transcripts into loss-free telegraphic bullet points.",
    defaultPrompt: DEFAULT_CAVEMAN_PROMPT,
  },
  ponytail: {
    name: "Ponytail",
    tag: "YAGNI Code",
    description: "Channels a lazy senior dev who writes the simplest, shortest working code.",
    defaultPrompt: DEFAULT_PONYTAIL_PROMPT,
  },
};

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  selectedPromptId,
  setSelectedPromptId,
  prompts,
  setPrompts,
  onResetPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<PromptId>(selectedPromptId);

  if (!isOpen) return null;

  const currentConfig = PROMPT_CONFIG[activeTab];
  const currentPromptText = prompts[activeTab] || "";
  const isDefault =
    currentPromptText.trim() === currentConfig.defaultPrompt.trim();

  const handleTextChange = (newVal: string) => {
    setPrompts((prev) => ({
      ...prev,
      [activeTab]: newVal,
    }));
  };

  const handleSelectActive = () => {
    setSelectedPromptId(activeTab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
                System Prompts
              </h2>
              <p className="text-xs text-slate-400 hidden xs:block">
                Choose and customize system instructions for Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Prompt Selection Menu / Tabs */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-[11px] mr-1 hidden md:inline">
              Select:
            </span>
            <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(["caveman", "ponytail"] as const).map((id) => {
                const cfg = PROMPT_CONFIG[id];
                const isTabActive = activeTab === id;
                const isSelectedForApi = selectedPromptId === id;
                const isModified =
                  prompts[id].trim() !== cfg.defaultPrompt.trim();

                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isTabActive
                        ? "bg-slate-800 text-slate-100 border border-slate-700 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <span className="font-semibold">{cfg.name}</span>
                    {isSelectedForApi && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                    {isModified && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Tag: <span className="text-amber-300 font-semibold">{currentConfig.tag}</span>
            </span>

            {selectedPromptId !== activeTab ? (
              <button
                onClick={handleSelectActive}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors ml-auto sm:ml-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Use {currentConfig.name}
              </button>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg ml-auto sm:ml-0">
                <Check className="w-3.5 h-3.5" />
                Active for Gemini
              </span>
            )}
          </div>
        </div>

        {/* Description Banner */}
        <div className="bg-slate-800/30 px-4 sm:px-6 py-2 border-b border-slate-800/60 flex items-center gap-2 text-xs text-slate-300 flex-shrink-0">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{currentConfig.description}</span>
        </div>

        {/* Textarea Area */}
        <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-slate-400">
              {currentConfig.name} Instructions
            </label>
            {!isDefault && (
              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Customized
              </span>
            )}
          </div>
          <textarea
            value={currentPromptText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full flex-1 min-h-[200px] sm:min-h-[280px] p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-y"
            placeholder="Enter system prompt instructions..."
            spellCheck={false}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={() => onResetPrompt(activeTab)}
            disabled={isDefault}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors ${
              isDefault
                ? "border-slate-800 text-slate-600 bg-slate-900 cursor-not-allowed"
                : "border-slate-700 text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white"
            }`}
            title={`Restore default ${currentConfig.name} prompt`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset {currentConfig.name} Prompt
          </button>

          <div className="flex items-center gap-2 justify-end">
            {selectedPromptId !== activeTab ? (
              <button
                onClick={() => {
                  setSelectedPromptId(activeTab);
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all"
              >
                <Check className="w-4 h-4" />
                Use {currentConfig.name} & Close
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

