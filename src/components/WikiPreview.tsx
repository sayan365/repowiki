"use client";

import { useEffect, useRef } from "react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WikiPreviewProps {
  html: string;
}

export function WikiPreview({ html }: WikiPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Clean up HTML: Remove ```html or ``` wrappers if they exist
  const cleanHtml = html
    .replace(/^```html\n?/, "")
    .replace(/```$/, "")
    .trim();

  const handleDownload = () => {
    const blob = new Blob([cleanHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repository-wiki.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-zinc-950 border-x border-t rounded-t-2xl shadow-sm">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
            Generated Wiki
          </span>
          <span className="text-xs text-zinc-500">Live Preview & Download</span>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload} 
            className="gap-2 rounded-full border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Save HTML File
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-b-2xl border border-t-0 overflow-hidden shadow-2xl min-h-[75vh] relative ring-1 ring-zinc-200/50">
        <iframe
          ref={iframeRef}
          srcDoc={cleanHtml}
          className="w-full h-full min-h-[75vh] border-none"
          title="Wiki Preview"
          sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
          onLoad={() => {
            // Optional: inject some styles or logic if needed
          }}
        />
      </div>
    </div>
  );
}
