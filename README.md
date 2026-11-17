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

### Step 3: Where to Click in Chrome DevTools
1. Open Chrome DevTools (`Cmd + Opt + I` on macOS, or `F12` / `Ctrl + Shift + I` on Windows/Linux).
2. Click **Application** in the top DevTools bar (click **`>>`** if hidden).
3. In the left sidebar under **Application**, click **WebMCP**.
4. Under **Available tools** (bottom pane), click `book_session`, `list_tasks`, `add_task`, or `complete_task` to inspect the JSON Schema and parameter descriptions Chrome derived from your page.
   *(Note: Without `#enable-webmcp-testing`, Chrome still shows declarative `book_session` here; with the flag enabled, all 4 tools appear.)*

### Step 4: Trigger Live `Tool activity` vs On-Page Simulator
- **On-page Simulator (Quick Offline Test):** Selecting a tool in the right-hand **WebMCP Tool Inspector** and clicking **"Execute as AI Agent →"** runs the local JS simulator and updates the page UI + **Live Invocation Log** (useful when presenting without Chrome flags).
- **Native Chrome `Tool activity` Trace:** Open Google's **WebMCP - Model Context Tool Inspector** Chrome extension side panel, select `book_session` or `add_task`, and click **Execute / Call Tool**. The live call, arguments, and `SubmitEvent.respondWith(...)` JSON payload appear in DevTools **Tool activity** while the page adds an entry tagged **`🤖 Invoked by AI Agent`** (and human clicks on **Book Demo Slot** log **`👤 Submitted by Human`** cleanly).

### Step 5: Demo Dynamic Tool Mount / Unmount
Toggle **"Tools Registered"** in the **1. Live Task Board** card off and back on to watch `list_tasks`, `add_task`, and `complete_task` disappear and reappear live in DevTools **Available tools** via `AbortController` / `unregisterTool`.

---

## Project Structure

```text
webmcp-quickstart/
├── index.html   # Task Board UI + Declarative <form toolname="book_session">
├── style.css    # Clean responsive Light/Dark styling
├── app.js       # Imperative registerTool() + Declarative submit hook + Simulator
└── README.md    # Step-by-step live demo instructions
```

