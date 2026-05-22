"use client";

import { useState, useEffect, useRef } from "react";
import { UserProvider } from "@/lib/claude";

// ─── Storage ───────────────────────────────────────────────────────────────────

const KEYS = {
  provider: "caveman_provider",
  gemini: "caveman_gemini_key",
  openai: "caveman_openai_key",
  groq: "caveman_groq_key",
} as const;

export interface UserSettings {
  provider: UserProvider | null; // null = use server default (Devstral)
  apiKey: string;
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    provider: null,
    apiKey: "",
  });

  useEffect(() => {
    const provider = localStorage.getItem(KEYS.provider) as UserProvider | null;
    const storageKey = provider && provider in KEYS ? KEYS[provider as keyof typeof KEYS] : null;
    const apiKey = storageKey ? (localStorage.getItem(storageKey) || "") : "";
    setSettings({ provider, apiKey });
  }, []);

  const saveSettings = (next: UserSettings) => {
    if (next.provider) {
      localStorage.setItem(KEYS.provider, next.provider);
      const storageKey = KEYS[next.provider as keyof typeof KEYS];
      if (storageKey) {
        if (next.apiKey.trim()) localStorage.setItem(storageKey, next.apiKey.trim());
        else localStorage.removeItem(storageKey);
      }
    } else {
      localStorage.removeItem(KEYS.provider);
    }
    setSettings(next);
  };

  return { settings, saveSettings };
}

// ─── Provider config ──────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    id: "groq" as UserProvider,
    label: "Groq",
    emoji: "⚡",
    placeholder: "gsk_...",
    getKeyURL: "https://console.groq.com/keys",
    getKeyLabel: "console.groq.com",
    model: "llama-3.3-70b-versatile",
    freeNote: "Free & fast — recommended",
  },
  {
    id: "gemini" as UserProvider,
    label: "Gemini",
    emoji: "✦",
    placeholder: "AIza...",
    getKeyURL: "https://aistudio.google.com/apikey",
    getKeyLabel: "aistudio.google.com",
    model: "gemini-2.0-flash",
    freeNote: "Free tier available",
  },
  {
    id: "openai" as UserProvider,
    label: "OpenAI",
    emoji: "⬡",
    placeholder: "sk-...",
    getKeyURL: "https://platform.openai.com/api-keys",
    getKeyLabel: "platform.openai.com",
    model: "gpt-4o-mini",
  },
] as const;

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  currentSettings: UserSettings;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
}

export default function SettingsModal({ currentSettings, onClose, onSave }: Props) {
  const [provider, setProvider] = useState<UserProvider | null>(currentSettings.provider);
  const [keys, setKeys] = useState({ gemini: "", openai: "", groq: "" });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKeys({
      gemini: localStorage.getItem(KEYS.gemini) || "",
      openai: localStorage.getItem(KEYS.openai) || "",
      groq: localStorage.getItem(KEYS.groq) || "",
    });
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const activeConfig = PROVIDERS.find((p) => p.id === provider);
  const currentKey = provider ? keys[provider] : "";
  const canSave = !provider || !!currentKey.trim();

  const handleSave = () => {
    onSave({ provider, apiKey: provider ? keys[provider] : "" });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-stone-900 border border-stone-700/80 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 shadow-2xl transition-all duration-300 overflow-hidden ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        {/* Fun header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-stone-800/60 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚙️</span>
                <h2 className="text-stone-100 font-black text-lg tracking-tight">Brain Settings</h2>
              </div>
              <p className="text-stone-500 text-xs">
                Choose your AI oracle. Or let the cave server decide. 🪨
              </p>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Server default pill */}
          <button
            onClick={() => setProvider(null)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              provider === null
                ? "border-amber-500 bg-amber-500/10"
                : "border-stone-700 hover:border-stone-600"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
              provider === null ? "bg-amber-500/20" : "bg-stone-800"
            }`}>
              🦖
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-stone-100 font-bold text-sm">Server Default</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Devstral</span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5">
                On-prem model — no key needed. Fastest.
              </p>
            </div>
            {provider === null && (
              <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="text-stone-600 text-xs">or use your own key</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>

          {/* Provider buttons */}
          <div className="grid grid-cols-3 gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  provider === p.id
                    ? "border-stone-400 bg-stone-800"
                    : "border-stone-700 hover:border-stone-600"
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <div className="text-center">
                  <div className="text-stone-100 font-bold text-sm">{p.label}</div>
                  <div className="text-stone-500 text-[10px] mt-0.5">{p.model}</div>
                </div>
                {keys[p.id] && (
                  <div className="flex items-center gap-1 text-[10px] text-green-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Key saved
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Key input — only when a user provider is selected */}
          {activeConfig && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-stone-400 text-xs font-medium flex items-center justify-between">
                <span>{activeConfig.label} API Key</span>
                <a
                  href={activeConfig.getKeyURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Get key → {activeConfig.getKeyLabel} ↗
                </a>
              </label>
              <div className="relative">
                <input
                  key={provider}
                  type={showKey ? "text" : "password"}
                  value={keys[provider!]}
                  onChange={(e) => setKeys((k) => ({ ...k, [provider!]: e.target.value }))}
                  placeholder={activeConfig.placeholder}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-sm font-mono pr-16"
                />
                <button
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
              {"freeNote" in activeConfig && (
                <p className="text-green-600 text-xs">✓ {activeConfig.freeNote}</p>
              )}
            </div>
          )}

          {/* How LangGraph is used */}
          <details className="group">
            <summary className="text-xs text-stone-600 hover:text-stone-400 cursor-pointer list-none flex items-center gap-1.5 transition-colors">
              <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              How does the AI pipeline work?
            </summary>
            <div className="mt-2 bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
              <p className="text-stone-400 text-xs leading-relaxed">
                Under the hood, this uses <span className="text-amber-400 font-medium">LangGraph</span> — a graph-based AI pipeline. Each request runs through 3 nodes:
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                <span className="text-stone-300 bg-stone-800 px-2 py-1 rounded">invoke_model</span>
                <span>→</span>
                <span className="text-stone-300 bg-stone-800 px-2 py-1 rounded">parse_validate</span>
                <span>→</span>
                <span className="text-green-600 bg-stone-800 px-2 py-1 rounded">END</span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed">
                If the model returns bad JSON, the graph loops back and asks it to self-correct — up to 3 attempts. No crashes, no silent failures.
              </p>
            </div>
          </details>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-stone-900 font-black text-sm transition-all active:scale-95"
            >
              {saved ? "✓ Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
