import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
    const geminiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY;

    if (!githubToken) {
      return new Response("GitHub Token is required. Please add it in the Settings.", { status: 400 });
    }

    const context = await getRepoContext(prompt, githubToken);

    const googleProvider = createGoogleGenerativeAI({
      apiKey: geminiKey,
    });

    const result = streamText({
      model: googleProvider("gemini-2.5-flash"),
      temperature: 0.4,
      system: `
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
</mermaid_critical_rules>`,
      prompt: `Analyze these repo pieces and generate the HTML website explaining the project:\n\n${context}`,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error during wiki generation:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate wiki" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
