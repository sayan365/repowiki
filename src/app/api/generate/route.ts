import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getRepoContext } from "@/lib/github";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("URL is required", { status: 400 });
    }

    const githubToken = req.headers.get("x-github-token");
    const geminiKeyHeader = req.headers.get("x-gemini-key");
    const gptKeyHeader = req.headers.get("x-gpt-key");
    const geminiKey = geminiKeyHeader || process.env.GEMINI_API_KEY;
    const gptKey = gptKeyHeader || process.env.OPENAI_API_KEY;

    console.log(`[API] Generation request received. Gemini: ${geminiKeyHeader ? 'Custom' : 'Env'} | GPT: ${gptKeyHeader ? 'Custom' : gptKey ? 'Env' : 'None'}`);

    if (!githubToken) {
      return new Response("GitHub Token is required. Please add it in the Settings.", { status: 400 });
    }

    const context = await getRepoContext(prompt, githubToken);

    const systemPrompt = `
<role>
You are an expert full-stack developer, system designer, and technical educator. Your goal is to analyze provided GitHub repository data and generate a clean, modern, beginner-friendly "Wiki-style Website" that explains the entire project in a very simple and understandable way.
</role>

<task>
Read the provided codebase context. Generate a single-file HTML website (with embedded CSS and JS) that helps beginners easily understand the project and helps developers quickly grasp the architecture.
</task>

<output_rules>
- Output ONLY valid, raw HTML code.
- DO NOT wrap the output in markdown code blocks (e.g., no \`\`\`html).
- All CSS must be within <style> tags and JS within <script> tags inside the HTML file.
</output_rules>

<pedagogy_and_tone>
- Use very simple language, as if teaching a beginner.
- Avoid heavy jargon, OR explain it clearly if used.
- Whenever something is complex, you MUST explain it with a real-world analogy.
- Break down complex flows step-by-step like a story.
- Make it feel like a friendly guide, not dry documentation.
</pedagogy_and_tone>

<website_structure>
The HTML body MUST include these exact sections:
1. 🏠 Overview: What it does (2-3 lines), a real-world analogy, key features, and the tech stack.
2. 🧠 How It Works: Explain the flow like a story using numbered steps and an example scenario.
3. 🏗️ Architecture: Explain Frontend, Backend, and Database simply. Include a Mermaid diagram.
4. 📁 Folder Structure: Explain only the most important folders/files (what they do and why they exist).
5. 🔄 Data Flow: Show how data moves from user input to response.
6. ⚙️ Setup Guide: Beginner-friendly commands and common errors.
7. 🔍 Key Concepts: Pick important logic parts and explain them with analogies.
8. ⚡ Quick Summary: "Understand this project in 2 minutes."
9. 🚀 Improvements: Ideas to scale or beginner-friendly contribution suggestions.
</website_structure>

<design_requirements>
- Aesthetic: Clean, modern UI inspired by Notion or Stripe docs (lots of whitespace, soft borders).
- Layout: Persistent sidebar navigation with smooth scrolling to sections.
- Typography: Use 'Inter' or system sans-serif.
- Visuals: Use Cards for sections, styled code blocks with dark backgrounds, and emojis for clarity.
- Responsive: Must adapt gracefully to mobile and desktop.
</design_requirements>

<mermaid_critical_rules>
You must strictly follow these rules for architecture diagrams:
- Include this exact script in the <head>: <script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({ startOnLoad: true, securityLevel: 'loose', theme: 'neutral' });</script>
- Place diagrams inside: <pre class="mermaid">...</pre>
- ALWAYS quote node labels that contain special characters: A["My Label (info)"] not A[My Label (info)]
- NEVER use parentheses, brackets, or special chars in unquoted labels.
- Use simple arrow syntax: A --> B or A -->|label| B
- Keep diagrams simple: max 8-10 nodes. Prefer flowchart TD or graph TD.
- NEVER use HTML tags inside Mermaid labels.
</mermaid_critical_rules>`;

    const resultStream = await generateWiki(
      systemPrompt,
      context,
      prompt,
      geminiKey,
      gptKey
    );

    return resultStream;
  } catch (error: any) {
    console.error("Error during wiki generation:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate wiki" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function generateWiki(
  systemPrompt: string,
  context: string,
  prompt: string,
  geminiKey?: string | null,
  gptKey?: string | null
) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    let writerClosed = false;
    try {
      let usedGpt = false;

      // Try Gemini first
      if (geminiKey && !usedGpt) {
        try {
          console.log("[WIKI] Attempting to use Gemini...");
          const googleProvider = createGoogleGenerativeAI({
            apiKey: geminiKey,
          });

          const result = streamText({
            model: googleProvider("gemini-2.5-flash"),
            maxRetries: 0,
            temperature: 0.4,
            system: systemPrompt,
            prompt: `Analyze these repo pieces and generate the HTML website explaining the project:\n\n${context}`,
          });

          let successCount = 0;
          for await (const chunk of result.textStream) {
            successCount++;
            await writer.write(encoder.encode(chunk));
          }

          // If we successfully streamed content, we're done
          if (successCount > 0) {
            console.log("[WIKI] Successfully generated with Gemini");
            writerClosed = true;
            await writer.close();
            return;
          }
        } catch (geminiError: any) {
          console.log("[WIKI] Gemini error detected, switching to GPT fallback...", geminiError?.message || "Unknown error");
          // Continue to GPT fallback
        }
      }

      // Fallback to GPT
      if (gptKey) {
        try {
          console.log("[WIKI] Using GPT-4o mini as fallback...");
          const openaiProvider = createOpenAI({
            apiKey: gptKey,
          });

          const result = streamText({
            model: openaiProvider("gpt-4o-mini"),
            maxRetries: 0,
            temperature: 0.4,
            system: systemPrompt,
            prompt: `Analyze these repo pieces and generate the HTML website explaining the project:\n\n${context}`,
          });

          for await (const chunk of result.textStream) {
            await writer.write(encoder.encode(chunk));
          }

          console.log("[WIKI] Successfully generated with GPT-4o mini");
          usedGpt = true;
        } catch (gptError: any) {
          throw new Error(`GPT fallback also failed: ${gptError?.message || "Unknown error"}`);
        }
      } else if (!geminiKey) {
        throw new Error(
          "No AI model available. Please provide either a Gemini API key or an OpenAI API key in settings."
        );
      } else {
        throw new Error(
          "Gemini failed and no GPT API key provided. Please add an OpenAI API key in settings as a fallback."
        );
      }
    } catch (streamError: any) {
      const msg: string = streamError?.message || "Unknown streaming error";
      console.error("[WIKI] Fatal streaming error:", msg);
      // Write error as a special sentinel so the frontend can detect it
      if (!writerClosed) {
        await writer.write(encoder.encode(`\x00REPOWIKI_ERROR:${msg}`));
      }
    } finally {
      if (!writerClosed) {
        writerClosed = true;
        await writer.close();
      }
    }
  })();

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
