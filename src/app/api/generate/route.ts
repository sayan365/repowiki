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
      system: `You are an expert full-stack developer and technical educator. Your job is to analyze the provided GitHub repository data (README, file tree, dependencies, or metadata) and deduce how the project works. 
Generate a clean, modern, beginner-friendly 'Wiki-style' HTML website that explains the project. 
Output ONLY valid, raw HTML code containing embedded CSS and JS. Do NOT wrap the output in markdown code blocks like \`\`\`html. 

The HTML must include:
1. Overview & Real-world analogy
2. How it works (step-by-step)
3. Architecture (Use Mermaid.js for diagrams where applicable)
4. Folder structure simplified
5. Setup guide.

CRITICAL Mermaid.js Rules (you MUST follow these strictly):
- Place diagrams inside: <pre class="mermaid">...</pre>
- ALWAYS quote node labels that contain special characters: A["My Label (info)"] not A[My Label (info)]
- NEVER use parentheses, brackets, or special chars in unquoted labels.
- Use simple arrow syntax: A --> B or A -->|label| B
- Keep diagrams simple: max 8-10 nodes. Prefer flowchart TD or graph TD.
- NEVER use HTML tags inside Mermaid labels.
- Example of a VALID diagram:
  <pre class="mermaid">
  graph TD
    A["User Input"] --> B["Process Data"]
    B --> C["Output Result"]
  </pre>

Design Requirements:
- Aesthetic: Notion or Stripe documentation (modern, clean, lots of whitespace).
- Sidebar: Persistent sidebar with a Table of Contents.
- Typography: Use Inter or system sans-serif.
- Code Blocks: Styled with a dark background.
- Diagrams: Include this Mermaid script in the HTML head: <script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({ startOnLoad: true, securityLevel: 'loose', theme: 'neutral' });</script>
- Responsiveness: Must work well on mobile and desktop.
- Interactivity: Smooth scrolling and hover states on links.`,
      prompt: `Analyze this repository and generate the wiki HTML:\n\n${context}`,
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
