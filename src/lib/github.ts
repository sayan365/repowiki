import { Octokit } from "octokit";

export async function getRepoContext(url: string, customToken?: string) {
  const auth = customToken || process.env.GITHUB_TOKEN;
  const octokit = new Octokit(auth ? { auth } : {});

  // Clean URL: Remove .git suffix and trailing slashes
  const cleanUrl = url.replace(/\.git$/, "").replace(/\/$/, "");
  const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

  if (!match) {
    throw new Error("Invalid GitHub URL. Please provide a URL like https://github.com/owner/repo");
  }

  const [, owner, repo] = match;

  try {
    // 1. Fetch Repository Metadata
    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // 2. Attempt to fetch README
    let readme = "";
    try {
      const { data: readmeData } = await octokit.rest.repos.getReadme({
        owner,
        repo,
        headers: {
          accept: "application/vnd.github.raw",
        },
      });
      readme = readmeData as unknown as string;
    } catch (e) {
      console.log("README not found, falling back to heuristic scan");
    }

    let stackCode = "";
    let fileTree = "";
    let treeItems: any[] = [];

    // Fetch File Tree (First, so we know what exists)
    try {
      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: repository.default_branch,
        recursive: "true",
      });
      treeItems = treeData.tree || [];

      // Filter out common noise and limit size
      fileTree = treeItems
        .filter(item => !item.path?.includes('node_modules') && !item.path?.includes('.git/'))
        .map(item => `${item.type === 'tree' ? '[DIR] ' : '[FILE] '}${item.path}`)
        .slice(0, 300) // limit to avoid token limits
        .join("\n");
    } catch (e) {
      console.error("Failed to fetch tree", e);
    }

    // Super-charged "Front Door" logic: Find core files dynamically
    if (treeItems.length > 0) {
      const targetPaths = new Set([
        "package.json", "requirements.txt", "go.mod", "Cargo.toml", "pom.xml", // DNA Files
        "docker-compose.yml", "docker-compose.yaml", "Dockerfile",             // Infra
        "prisma/schema.prisma",                                                // DB
        "src/index.js", "src/index.ts", "src/main.ts", "src/main.tsx",         // Entry points
        "app/layout.tsx", "src/app/layout.tsx", "app/page.tsx",                // Next.js
        "main.py", "app.py", "manage.py"                                       // Python
      ]);

      const filesToFetch = treeItems
        .filter(item => item.type === 'blob' && item.path && targetPaths.has(item.path))
        .slice(0, 5); // Fetch at most 5 core files to avoid rate/context limits

      const fetchPromises = filesToFetch.map(async (fileNode) => {
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: fileNode.path as string,
            headers: { accept: "application/vnd.github.raw" },
          });
          // Slice file content to prevent massive files from eating context
          return `--- FILE: ${fileNode.path} ---\n${String(data).slice(0, 2500)}`;
        } catch {
          return "";
        }
      });

      const fileContents = await Promise.all(fetchPromises);
      stackCode = fileContents.filter(Boolean).join("\n\n");
    }

    return `
Repository: ${repository.full_name}
Description: ${repository.description || "No description provided"}
Stars: ${repository.stargazers_count}
Topics: ${repository.topics?.join(", ") || "None"}
Main Language: ${repository.language}

README CONTENT:
${readme || "N/A"}

CORE LOGIC & DNA FILES:
${stackCode || "N/A"}

FILE STRUCTURE:
${fileTree || "N/A"}
    `.trim();
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error("Repository not found. It might be private or the URL is incorrect.");
    }
    throw new Error(`GitHub API Error: ${error.message}`);
  }
}
