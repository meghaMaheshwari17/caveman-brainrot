"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "caveman_gemini_key";

interface SettingsModalProps {
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || "";
    setApiKey(stored);
  }, []);

  const saveKey = (key: string) => {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setApiKey(key.trim());
  };

  return { apiKey, saveKey };
}

export default function SettingsModal({ onClose, onKeySaved }: SettingsModalProps) {
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || "";
    setInput(stored);
    requestAnimationFrame(() => setShow(true));
  }, []);

  const handleSave = () => {
    if (input.trim()) {
      localStorage.setItem(STORAGE_KEY, input.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    onKeySaved(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInput("");
    onKeySaved("");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl transition-all duration-200 ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-stone-100 font-bold text-lg">Settings</h2>
            <p className="text-stone-500 text-xs mt-0.5">Configure your API key</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* API Key input */}
        <div className="space-y-3">
          <label className="block text-stone-300 text-sm font-medium">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="AIza..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-sm font-mono pr-20"
            />
            {input && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Info box */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
            <p className="text-stone-400 text-xs leading-relaxed">
              <span className="text-amber-400 font-semibold">Where to get one:</span>{" "}
              Go to <span className="font-mono text-stone-300">aistudio.google.com</span> → Get API Key → Create API Key. It&apos;s free.
            </p>
            <p className="text-stone-500 text-xs leading-relaxed">
              Your key is stored in your browser&apos;s local storage and sent only to this app&apos;s server to make Gemini API requests. It is never logged or stored on our end.
            </p>
            <p className="text-stone-500 text-xs leading-relaxed">
              If no key is set here, the app uses the server&apos;s default key (if configured).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm transition-colors"
          >
            {saved ? "✓ Saved!" : "Save Key"}
          </button>
        </div>
      </div>
    </div>
  );
}
