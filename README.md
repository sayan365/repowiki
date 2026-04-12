<div align="center">

  <h1>📚 RepoWiki</h1>
  
  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
    <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" />
    <img alt="Google Gemini" src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google" />
    <img alt="Vercel AI SDK" src="https://img.shields.io/badge/Vercel_AI_SDK-3.0-000000?style=flat-square&logo=vercel" />
  </p>

  <p><strong>Turn any GitHub repository codebase into a beautiful, beginner-friendly documentation site instantly.</strong></p>
  <br/>
  
  <img alt="RepoWiki Screenshot" src="./public/screenshot.png" width="800" style="border-radius: 8px;" />
</div>

---

**RepoWiki** is a modern, AI-powered web application that takes any GitHub repository URL (public or private) and instantly generates beautiful, understandable documentation wikis.

Instead of just parsing a standard `README.md`, RepoWiki acts as an intelligent codebase reader. It scans the repository file tree, extracts core structural files (`package.json`, `docker-compose.yml`, `schema.prisma`), and feeds them into the **Google Gemini 2.5 Flash** model using a deeply-optimized XML "Mega-Prompt." 

The result? A hyper-accurate, streaming HTML wiki complete with real-world analogies and embedded Mermaid.js architecture diagrams.

## 📋 Table of Contents
- [✨ Features](#-features)
- [🏗️ How it Works](#-how-it-works-under-the-hood)
- [🔐 Security & Architecture (BYOK)](#-security--architecture-bring-your-own-keys)
- [🚀 Getting Started](#-getting-started-local-development)
- [🔑 GitHub Token Guide](#-how-to-create-a-safe-github-token)
- [🎯 Contributing](#-contributing)

---

## ✨ Features

- ⚡ **Instant Documentation:** Just paste a GitHub URL and watch the docs write themselves.
- 🧠 **Codebase Deep-Scan:** Intelligently identifies and reads your tech-stack DNA files and logical entry points.
- 🔒 **Private Repo Support:** Bring your own GitHub token to analyze proprietary codebases securely.
- 🌊 **Streamed Responses:** Watch the documentation generate smoothly in real-time via the Vercel AI SDK.
- 🎨 **Premium Aesthetic:** Clean UI, smooth scrolling, sidebar navigation, and Notion-style formatting.
- 💾 **Static Export:** Download the generated HTML as a standalone, styled file to drop directly into your own project.

---

## 🏗️ How it Works under the Hood

RepoWiki isn't just a standard LLM wrapper. It utilizes a specialized parsing pipeline:

1. **Tree Extraction:** Fetches the full Git File Tree via the GitHub REST API.
2. **Intelligent DNA Parsing:** Automatically identifies your core infrastructure (e.g., `docker-compose.yml`), entry points (`main.ts`), and dependencies (`package.json`).
3. **XML Mega-Prompting:** Feeds the extracted code to Gemini wrapped in strict XML tags (`<role>`, `<website_structure>`, `<mermaid_critical_rules>`) ensuring no hallucinated syntax or broken UI.
4. **Resilient Output:** Safely streams the raw HTML/CSS/JS output into a sandboxed `iframe`, catching invalid outputs gracefully.

---

## 🔐 Security & Architecture: Bring Your Own Keys

RepoWiki is designed to be fully serverless, database-free, and incredibly easy to self-host.

Because GitHub's unauthenticated API is incredibly strict (60 limits/hour per IP), the application enforces a **Bring Your Own Key (BYOK)** model directly in the browser.

By clicking the **Settings (Gear Icon)** in the UI:
1. Users can enter their own **GitHub Token** (bypassing rate limits and enabling Private Repository scanning).
2. Users can provide their own **Gemini API Key**.
3. **Privacy First:** Keys are saved **locally in the browser (`localStorage`)** and are sent directly to the API handler during generation. They *never* touch a database.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- A [Google AI Studio API Key](https://aistudio.google.com/app/apikey)
- A [GitHub Fine-Grained Personal Access Token](https://github.com/settings/tokens?type=beta)

### 1. Clone the repository
```bash
git clone https://github.com/sayan365/repowiki.git
cd repowiki
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in your `.env.local` file. These serve as the ultimate fallback keys if a user does not provide their own in the UI:

```env
# Optional Fallbacks for the API Route:
GITHUB_TOKEN=your_fine_grained_github_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## 🔑 How to Create a Safe GitHub Token

When setting up RepoWiki, you will need a Fine-Grained Personal Access Token (PAT) from GitHub to fetch repository data without hitting rate limits.

1. Go to your GitHub account: **Settings** > **Developer Settings** > **Personal access tokens** > **Fine-grained tokens**.
2. Click **Generate new token**.
3. **Repository access:** Select `Public Repositories (read-only)`. (If you are scanning a private repo, grant access to `All repositories` or `Only select repositories`).
4. **Permissions:** 
   - Under **Repository permissions**, ensure `Contents` and `Metadata` are set to **Read-only**.
5. Save and copy the token. Paste it into your RepoWiki browser Settings modal!

---

## 🎯 Contributing
Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](https://github.com/sayan365/repowiki/issues) if you want to contribute.

## 📄 License
This project is licensed under the MIT License.
