import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getRepoContext } from "@/lib/github";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response("URL is required", { status: 400 });
    }

    const context = await getRepoContext(url);

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: `You are an expert full-stack developer and technical educator. Your job is to analyze the provided GitHub repository data (README, file tree, dependencies, or metadata) and deduce how the project works. 
Generate a clean, modern, beginner-friendly 'Wiki-style' HTML website that explains the project. 
Output ONLY valid, raw HTML code containing embedded CSS and JS. Do NOT wrap the output in markdown code blocks like \`\`\`html. 

The HTML must include:
1. Overview & Real-world analogy
2. How it works (step-by-step)
3. Architecture (Use Mermaid.js for diagrams where applicable)
4. Folder structure simplified
5. Setup guide.

Design Requirements:
- Aesthetic: Notion or Stripe documentation (modern, clean, lots of whitespace).
- Sidebar: Persistent sidebar with a Table of Contents.
- Typography: Use Inter or system sans-serif.
- Code Blocks: Styled with a dark background.
- Diagrams: Use Mermaid.js. Include this script: <script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({ startOnLoad: true });</script>
- Responsiveness: Must work well on mobile and desktop.
- Interactivity: Smooth scrolling and hover states on links.`,
      prompt: `Analyze this repository and generate the wiki HTML:\n\n${context}`,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error during wiki generation:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate wiki" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
