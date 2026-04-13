import Link from "next/link";
import { Terminal, ArrowLeft, ShieldCheck, Key, BookOpen, Zap } from "lucide-react";

export const metadata = {
  title: "Documentation - RepoWiki",
  description: "Learn how to use RepoWiki to generate documentation from GitHub repositories.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-100 pb-20">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <header className="flex justify-between items-center mb-16 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:-translate-x-1 transition-transform" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
                 <Terminal className="w-4 h-4 text-white dark:text-zinc-900" />
              </div>
              <span className="font-black text-lg tracking-tighter">REPOWIKI</span>
            </div>
          </Link>
          <a href="https://github.com/sayan365/repowiki" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 relative">
          <main className="flex-1 space-y-16 lg:pr-8">
            <section className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight" id="introduction">Documentation</h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">
                Welcome to RepoWiki! This guide will help you understand how to use the generator, configure API keys, and analyze private repositories.
              </p>
            </section>

            <section className="space-y-8" id="how-it-works">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
              </div>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-loose">
                <p>
                  RepoWiki uses the <strong>Vercel AI SDK</strong> to orchestrate a resilient multi-model pipeline. When you paste a URL:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mt-4">
                  <li>We fetch the repository&apos;s file tree, core infrastructure files (e.g. <code className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">docker-compose.yml</code>), and dependencies.</li>
                  <li>The context is sent to <strong>Google Gemini 2.5 Flash</strong> as the primary engine.</li>
                  <li>If Gemini is overloaded or fails during streaming, the system automatically falls back to <strong>OpenAI GPT-4o mini</strong>.</li>
                  <li>The AI streams down a styled, standalone HTML file complete with Mermaid.js architecture diagrams.</li>
                </ol>
              </div>
            </section>

            <section className="space-y-8" id="github-token">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">GitHub Token Configuration</h2>
              </div>
              <div className="bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-2xl p-8 space-y-6">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  RepoWiki features a completely serverless <em>&quot;Bring Your Own Key&quot; (BYOK)</em> architecture. To prevent strict API rate-limiting issues when scanning massive codebases, <strong>you must provide a GitHub Token</strong> snippet (even for public repositories).
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  This also allows you to seamlessly analyze <strong>Private Repositories</strong> by simply assigning the correct permissions to your token.
                </p>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Step-by-step Setup:</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">1</span>
                      <span className="text-zinc-600 dark:text-zinc-400">Go to your <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">GitHub Developer Settings</a> and create a <strong>Fine-grained Personal Access Token</strong>.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">2</span>
                      <span className="text-zinc-600 dark:text-zinc-400">Under <em>Repository access</em>, select <strong>Public Repositories (read-only)</strong>, or explicitly select your private repository.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">3</span>
                      <span className="text-zinc-600 dark:text-zinc-400">Under <em>Repository permissions</em>, grant <strong>Read-only</strong> access to <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Contents</code> and <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Metadata</code>.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">4</span>
                      <span className="text-zinc-600 dark:text-zinc-400">Return to RepoWiki, click the <strong>Settings (Gear Icon)</strong> in the top right, and paste your token.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-8" id="api-rate-limits">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Key className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">API Rate Limits</h2>
              </div>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-loose">
                <p>
                  RepoWiki covers the cost of AI generation for casual users using fallback API keys. If you are generating many wikis, or if the primary Gemini model is at capacity, you may encounter an error or high demand message.
                </p>
                <p className="mt-4">
                  To bypass these limits and ensure 100% uptime, you can provide your own API keys:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Gemini:</strong> Get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Google AI Studio</a>.</li>
                  <li><strong>OpenAI:</strong> Get an API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">OpenAI Dashboard</a> to enable the GPT-4o mini fallback.</li>
                  <li>Open the <strong>Settings</strong> modal in RepoWiki and paste your keys.</li>
                  <li>Your keys are stored securely in your browser&apos;s <code className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-sm">localStorage</code> and are never saved to a database.</li>
                </ul>
              </div>
            </section>
          </main>

          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-12">
              <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-6">On this page</h4>
              <nav className="flex flex-col space-y-3 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4">
                <a href="#how-it-works" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">How it works</a>
                <a href="#github-token" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub Token</a>
                <a href="#api-rate-limits" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">API Rate Limits</a>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
