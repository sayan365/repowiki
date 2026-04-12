import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Lock, Key, ShieldCheck, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (githubToken: string, geminiKey: string) => void;
}

export function SettingsModal({ isOpen, setIsOpen, onSave }: SettingsModalProps) {
  const [githubToken, setGithubToken] = useState("");
  const [geminiKey, setGeminiKey] = useState("");

  useEffect(() => {
    // Load from local storage on mount
    const savedGithub = localStorage.getItem("repowiki_github_token") || "";
    const savedGemini = localStorage.getItem("repowiki_gemini_key") || "";
    setGithubToken(savedGithub);
    setGeminiKey(savedGemini);
    // Tell parent initially loaded keys
    if (savedGithub || savedGemini) {
      onSave(savedGithub, savedGemini);
    }
  }, [onSave]);

  const handleSave = () => {
    localStorage.setItem("repowiki_github_token", githubToken);
    localStorage.setItem("repowiki_gemini_key", geminiKey);
    onSave(githubToken, geminiKey);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 z-50 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">API Settings</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Lock className="w-4 h-4" /> GitHub Token
                    </label>
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Get Token
                    </a>
                  </div>
                  <Input
                    type="password"
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 focus-visible:ring-indigo-500"
                  />
                  <p className="text-xs text-zinc-500">Required if you want to analyze private repositories.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Key className="w-4 h-4" /> Gemini API Key <span className="text-xs font-normal text-zinc-500">(Optional)</span>
                    </label>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Get Key
                    </a>
                  </div>
                  <Input
                    type="password"
                    placeholder="AIza..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 focus-visible:ring-indigo-500"
                  />
                  <p className="text-xs text-zinc-500">Add your own key to avoid rate limits.</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Keys</Button>
              </div>

              <p className="text-[10px] text-center text-zinc-400">Keys are stored securely in your browser's local storage and are only sent directly to the API during generation.</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
}
