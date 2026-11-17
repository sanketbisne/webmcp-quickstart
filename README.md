# WebMCP Quickstart — Pure Browser-Native AI Tools Demo

A zero-dependency, pure HTML/CSS/Vanilla JS starter project showing **what WebMCP is** and **how to test it live in Chrome** — no backend, no build step, and no agent framework (ADK/LangGraph) required.

- **Live Demo (GitHub Pages):** https://sanketbisne.github.io/webmcp-quickstart/
- **Chrome WebMCP Docs:** https://developer.chrome.com/docs/ai/webmcp

---

## What Is WebMCP?

Normally, browser AI agents guess where buttons are by taking screenshots or scraping fragile CSS selectors. **WebMCP** lets a web page publish structured tools natively through Chrome (`navigator.modelContext`) and standard HTML form attributes so agents call explicit, typed contracts cleanly.

This repo demonstrates **both WebMCP patterns** in ~250 lines of readable JavaScript:

| Pattern | How It Works | Tools Exposed Here |
|---|---|---|
| **Imperative API** (`app.js`) | `navigator.modelContext.registerTool({...})` with `AbortController` | `list_tasks`, `add_task`, `complete_task` |
| **Declarative API** (`index.html`) | Standard `<form toolname="..." tooldescription="..." toolautosubmit>` + `toolparamdescription` | `book_session` |

---

## Step-by-Step Live Demo Guide

### Step 1: Run Locally (or Open Live Pages)
No `npm install` needed — serve the static files with Python or any static server (WebMCP requires `localhost` or `https://`):

```bash
git clone https://github.com/sanketbisne/webmcp-quickstart.git
cd webmcp-quickstart
python3 -m http.server 8080
```

Open **http://localhost:8080** in Chrome.

> **Instant mode (no flags needed):** The built-in **WebMCP Tool Inspector** on the right works in any browser right out of the box so anyone can inspect JSON Schemas and simulate agent calls live.

### Step 2: Enable Native Chrome WebMCP
To test with Chrome's real browser-native WebMCP runtime:
1. Open **`chrome://flags/#enable-webmcp-testing`** in Google Chrome.
2. Set **WebMCP for testing** to **Enabled**.
3. Click **Relaunch**.
4. Reload **http://localhost:8080** (or **https://sanketbisne.github.io/webmcp-quickstart/**) — the top-right pill switches cleanly to **`Native Chrome WebMCP Active`**.

### Step 3: Inspect & Run Tools via Chrome
You can demo tool discovery & execution in two ways:

- **Option A — Built-in Chrome DevTools Panel:**
  Open **DevTools (`F12` / `Cmd+Opt+I`) → Application → WebMCP** to inspect live available tools, JSON Schemas, and invocation logs.
- **Option B — Model Context Tool Inspector Extension:**
  Install Google's **WebMCP - Model Context Tool Inspector** Chrome extension, open its side panel on the page, and test calling `add_task`, `list_tasks`, `complete_task`, or `book_session` manually or with an LLM.

### Step 4: Demo Dynamic Tool Mount / Unmount
Toggle **"Tools Registered"** in the **Live Task Board** card to show how single-page apps dynamically mount and unmount imperative tools with `AbortController` / `unregisterTool`.

---

## Project Structure

```text
webmcp-quickstart/
├── index.html   # Task Board UI + Declarative <form toolname="book_session">
├── style.css    # Clean responsive Light/Dark styling
├── app.js       # Imperative registerTool() + Declarative submit hook + Simulator
└── README.md    # Step-by-step live demo instructions
```
