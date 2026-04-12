import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getRepoContext(url: string) {
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

    // 3. Heuristic Scan Fallback
    let stack = "";
    let fileTree = "";

    // Fetch package.json or equivalent if README is missing or short
    if (!readme || readme.length < 200) {
      try {
        const { data: packageJsonData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: "package.json",
          headers: {
            accept: "application/vnd.github.raw",
          },
        });
        stack = `package.json content:\n${packageJsonData}`;
      } catch (e) {
        // Not a JS repo or no package.json
      }
    }

    // Fetch File Tree (Top-level)
    try {
      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: repository.default_branch,
        recursive: "true",
      });
      
      // Filter out common noise and limit size
      fileTree = treeData.tree
        .filter(item => !item.path?.includes('node_modules') && !item.path?.includes('.git/'))
        .map(item => `${item.type === 'tree' ? '[DIR] ' : '[FILE] '}${item.path}`)
        .slice(0, 150) // limit to avoid token limits
        .join("\n");
    } catch (e) {
      console.error("Failed to fetch tree", e);
    }

    return `
Repository: ${repository.full_name}
Description: ${repository.description || "No description provided"}
Stars: ${repository.stargazers_count}
Topics: ${repository.topics?.join(", ") || "None"}
Main Language: ${repository.language}

README CONTENT:
${readme || "N/A"}

STACK INFO (Heuristic):
${stack || "N/A"}

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
