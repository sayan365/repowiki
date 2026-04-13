"use client";

import Link from "next/link";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Layout, Sparkles, Wand2, Loader2, BookOpen, Terminal, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WikiPreview } from "@/components/WikiPreview";
import { SettingsModal } from "@/components/SettingsModal";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customGithubToken, setCustomGithubToken] = useState("");
  const [customGeminiKey, setCustomGeminiKey] = useState("");
  const [customGptKey, setCustomGptKey] = useState("");
  
  const { complete, completion, isLoading, error, stop } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
    onFinish: () => {
      console.log("Wiki generation finished.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Enforce GitHub Token requirement
    if (!customGithubToken) {
      setIsSettingsOpen(true);
      return;
    }
    
    setIsStarted(true);
    complete(url, {
      headers: {
        ...(customGithubToken && { "x-github-token": customGithubToken }),
        ...(customGeminiKey && { "x-gemini-key": customGeminiKey }),
        ...(customGptKey && { "x-gpt-key": customGptKey }),
      },
    });
  };

  const getFriendlyErrorMessage = (errorObj: Error | undefined) => {
    if (!errorObj) return null;
    let text = errorObj.message || "";
    try {
      const parsed = JSON.parse(text);
      if (parsed.error) text = parsed.error;
    } catch(e) {}
    
    const lowerError = text.toLowerCase();
    
    if (lowerError.includes("high demand") || lowerError.includes("503") || lowerError.includes("overloaded") || lowerError.includes("retryerror") || lowerError.includes("unavailable") || lowerError.includes("demand is usually temporary")) {
      return "The AI service is currently experiencing high demand. Please try again in a few moments, or setup your own Gemini API key in settings.";
    }
    if (lowerError.includes("github token") || lowerError.includes("bad credentials") || lowerError.includes("401") || lowerError.includes("token is required")) {
      return "There is an issue with your GitHub Token. Make sure it's valid and has the correct permissions.";
    }
    if (lowerError.includes("rate limit") || lowerError.includes("429") || lowerError.includes("too many requests")) {
      return "API rate limit exceeded. Please wait a bit or add your own Gemini API key or OpenAI API key in settings.";
    }
    if (lowerError.includes("api key") || lowerError.includes("invalid_api_key") || lowerError.includes("api_key_invalid") || lowerError.includes("invalid api key")) {
      return "Your API Key (Gemini or OpenAI) seems to be invalid. Please check it in settings.";
    }
    if (lowerError.includes("not found") || lowerError.includes("404")) {
      return "The repository could not be found. Please check the URL and ensure your GitHub Token has access to it.";
    }
    
    return text || "An unexpected error occurred. Please check your API keys and the repository URL.";
  };

  // Detect the REPOWIKI_ERROR sentinel injected by the streaming pipeline on the server.
  // This catches in-stream errors (e.g. Gemini 503) that would otherwise be silently dropped.
  const sentinelIndex = completion ? completion.indexOf("\x00REPOWIKI_ERROR:") : -1;
  const streamErrorMsg = sentinelIndex !== -1 ? completion!.slice(sentinelIndex + 17) : null;
  const cleanCompletion = sentinelIndex !== -1 ? completion!.slice(0, sentinelIndex) : completion;

  const displayError: Error | null =
    error ||
    (streamErrorMsg ? new Error(streamErrorMsg) : null) ||
    (isStarted && !isLoading && !cleanCompletion ? new Error("The request returned empty. The AI may be overloaded or your API key may be missing.") : null);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Navigation / Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
               <Terminal className="w-6 h-6 text-white dark:text-zinc-900" />
            </div>
            <span className="font-black text-xl tracking-tighter">REPOWIKI</span>
          </div>
          <div className="flex gap-4 items-center">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setIsSettingsOpen(true)}
               className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
             >
               <Settings className="w-5 h-5" />
             </Button>
             <SettingsModal 
               isOpen={isSettingsOpen}
               setIsOpen={setIsSettingsOpen}
               onSave={(github, gemini, gpt) => {
                 setCustomGithubToken(github);
                 setCustomGeminiKey(gemini);
                 setCustomGptKey(gpt);
               }} 
             />
             <Link href="/docs" className="hidden sm:flex">
               <Button variant="ghost" size="sm" className="text-zinc-500 font-medium">Docs</Button>
             </Link>
             <a href="https://github.com/sayan365/repowiki" target="_blank" rel="noreferrer">
               <Button variant="outline" size="sm" className="rounded-full border-zinc-200 gap-2 font-semibold hover:bg-zinc-100">
                 <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                 Star on GitHub
               </Button>
             </a>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center space-y-12"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Now Powered by Gemini 2.5 Flash</span>
                </motion.div>
                
                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1] text-zinc-900 dark:text-white">
                  Turn Code into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient">Beautiful Wiki.</span>
                </h1>
                
                <p className="max-w-2xl mx-auto text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  The fastest way to generate high-quality, beginner-friendly documentation for your GitHub repositories. Just paste and generate.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group px-2">
                <div className="relative flex items-center p-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200 dark:ring-zinc-800 focus-within:ring-indigo-500 transition-all">
                  <div className="pl-6 text-zinc-400">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <Input
                    className="h-14 border-none bg-transparent shadow-none focus-visible:ring-0 text-lg placeholder:text-zinc-400"
                    placeholder="https://github.com/vercel/next.js"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                     type="button"
                     variant="ghost"
                     onClick={() => setUrl("")}
                     className={`mr-2 rounded-full w-10 h-10 p-0 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 ${!url ? 'hidden' : ''}`}
                     disabled={isLoading}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  </Button>
                  <Button
                    type="submit"
                    className="h-14 rounded-full bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-all font-bold px-10 gap-2 shrink-0 shadow-lg"
                    disabled={isLoading || !url}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Generate Wiki
                        <Wand2 className="w-4 h-4 text-indigo-400" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap justify-center gap-12 mt-16 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full border border-dashed border-zinc-400 flex items-center justify-center">
                     <BookOpen className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Auto-README</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full border border-dashed border-zinc-400 flex items-center justify-center">
                     <Wand2 className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Analysis</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full border border-dashed border-zinc-400 flex items-center justify-center">
                     <Download className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Static Export</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="generator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tight shrink-0">Wiki Generator</h2>
                  </div>
                  <p className="text-sm md:text-base text-zinc-500 font-medium truncate max-w-md">
                    Target: <span className="text-indigo-500">{url}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                       stop();
                       setUrl("");
                       setIsStarted(false);
                    }}
                    className="text-zinc-500 font-bold hover:bg-zinc-100 rounded-full px-6"
                  >
                    Reset
                  </Button>
                  <div className="h-4 w-px bg-zinc-200 mx-2" />
                  {isLoading && (
                    <div className="flex items-center gap-3 bg-zinc-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                       <Loader2 className="w-3 h-3 animate-spin" />
                       Generating
                    </div>
                  )}
                </div>
              </div>

              {isLoading && !cleanCompletion && (
                <div className="flex flex-col items-center justify-center py-40 space-y-6">
                   <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                      <Loader2 className="w-16 h-16 animate-[spin_2s_linear_infinite] text-indigo-500 relative" />
                   </div>
                   <div className="text-center space-y-2 relative z-10">
                      <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">
                        Sifting through files & folders...
                      </p>
                      <p className="text-sm text-zinc-400 font-medium tracking-wide">GEMINI IS CRAFTING THE DOCUMENTATION</p>
                   </div>
                </div>
              )}

              {cleanCompletion && !displayError && (
                <WikiPreview html={cleanCompletion} />
              )}
              
              {displayError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="p-8 md:p-12 bg-white dark:bg-zinc-950 border border-red-100 dark:border-red-900/40 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center ring-8 ring-red-50/50 dark:ring-red-900/10">
                      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Generation Halted</p>
                    <p className="text-base text-zinc-500 font-medium max-w-lg mx-auto leading-relaxed">
                      {getFriendlyErrorMessage(displayError)}
                    </p>
                  </div>
                  <div className="pt-6 flex items-center justify-center gap-4">
                    <Button 
                      onClick={() => setIsSettingsOpen(true)} 
                      className="rounded-full bg-zinc-900 dark:bg-white dark:text-zinc-950 font-bold px-8 hover:scale-105 transition-transform"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Check Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { setIsStarted(false); setUrl(""); }} 
                      className="rounded-full font-bold px-8"
                    >
                      Go Back
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Minimal Download icon import fix
function Download(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
