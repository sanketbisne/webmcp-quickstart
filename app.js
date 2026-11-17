/**
 * WebMCP Quickstart — Pure Vanilla HTML/CSS/JS Demo (Zero Backend, Zero ADK)
 * Demonstrates:
 *  1) Imperative WebMCP: navigator.modelContext.registerTool() + AbortController lifecycle
 *  2) Declarative WebMCP: <form toolname="book_session" ...> + e.agentInvoked / e.respondWith
 */

const state = {
  nextTaskId: 3,
  tasks: [
    { id: 1, title: 'Enable chrome://flags/#enable-webmcp-testing', priority: 'high', done: false },
    { id: 2, title: 'Test declarative book_session HTML form', priority: 'medium', done: false }
  ],
  bookings: []
};

const EXAMPLE_ARGS = {
  list_tasks: { status: 'open' },
  add_task: { title: 'Inspect WebMCP in Chrome DevTools', priority: 'high' },
  complete_task: { id: 1 },
  book_session: {
    name: 'Alex Rivera',
    email: 'alex@example.com',
    topic: 'Browser-native WebMCP Live Demo',
    format: 'live_demo'
  }
};

// Local registry so the right-hand Inspector works identically in both
// Native Chrome WebMCP mode and standard browsers without flags enabled.
const localTools = new Map();
let imperativeAbortController = null;
const nativeWebMcp =
  typeof navigator !== 'undefined' &&
  'modelContext' in navigator &&
  typeof navigator.modelContext?.registerTool === 'function';

function appendLog(tag, detail) {
  const logEl = document.getElementById('invocation-log');
  if (!logEl) return;
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const body = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
  logEl.textContent = `[${ts}] ${tag}\n${body}\n\n` + logEl.textContent;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTasks() {
  const listEl = document.getElementById('task-list');
  if (!listEl) return;

  listEl.innerHTML = state.tasks
    .map(
      (t) => `
      <li class="task-item ${t.done ? 'done' : ''}">
        <div>
          <span class="task-title"><strong>#${t.id}</strong> ${escapeHtml(t.title)}</span>
        </div>
        <div class="task-meta">
          <span class="prio ${escapeHtml(t.priority)}">${escapeHtml(t.priority)}</span>
          <button type="button" class="btn-ghost btn-sm" data-toggle-task="${t.id}">
            ${t.done ? 'Undo' : 'Done'}
          </button>
        </div>
      </li>`
    )
    .join('');

  listEl.querySelectorAll('[data-toggle-task]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-toggle-task'));
      const task = state.tasks.find((item) => item.id === id);
      if (task) {
        task.done = !task.done;
        renderTasks();
      }
    });
  });
}

function renderBookings() {
  const listEl = document.getElementById('booking-list');
  if (!listEl) return;

  listEl.innerHTML = state.bookings
    .map(
      (b) => `
      <li class="booking-item">
        <span class="booking-source">${b.agentInvoked ? '🤖 Invoked by AI Agent' : '👤 Submitted by Human'} • ${escapeHtml(b.format)}</span>
        <strong>${escapeHtml(b.name)} (${escapeHtml(b.email)})</strong>
        <span>Topic: ${escapeHtml(b.topic)}</span>
      </li>`
    )
    .join('');
}

// ============================================================================
// 1. Imperative WebMCP Tool Definitions
// ============================================================================
function buildImperativeTools() {
  return [
    {
      name: 'list_tasks',
      description: 'List current tasks on the board with optional status filtering.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['all', 'open', 'done'],
            description: 'Filter tasks by completion status.'
          }
        }
      },
      annotations: { readOnlyHint: true },
      execute: async (input = {}) => {
        const filter = input.status || 'all';
        const filtered = state.tasks.filter((t) =>
          filter === 'all' ? true : filter === 'done' ? t.done : !t.done
        );
        const payload = { filter, count: filtered.length, tasks: filtered };
        appendLog('IMPERATIVE EXECUTE: list_tasks', payload);
        return { content: [{ type: 'text', text: JSON.stringify(payload) }] };
      }
    },
    {
      name: 'add_task',
      description: 'Create a new task item on the live task board.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short task title' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Task urgency level'
          }
        },
        required: ['title']
      },
      execute: async (input = {}) => {
        const title = String(input.title || '').trim();
        if (!title) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: 'title is required' }) }] };
        }
        const priority = ['low', 'medium', 'high'].includes(input.priority) ? input.priority : 'medium';
        const task = { id: state.nextTaskId++, title, priority, done: false };
        state.tasks.unshift(task);
        renderTasks();
        appendLog('IMPERATIVE EXECUTE: add_task', task);
        return { content: [{ type: 'text', text: JSON.stringify({ created: task }) }] };
      }
    },
    {
      name: 'complete_task',
      description: 'Mark an existing task as completed by numeric id or partial title match.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Numeric task ID (e.g. 1)' },
          title: { type: 'string', description: 'Fallback substring match if id is omitted' }
        }
      },
      execute: async (input = {}) => {
        let task = null;
        if (input.id !== undefined) {
          task = state.tasks.find((t) => t.id === Number(input.id));
        } else if (input.title) {
          const needle = String(input.title).toLowerCase();
          task = state.tasks.find((t) => t.title.toLowerCase().includes(needle));
        }
        if (!task) {
          const err = { error: 'No matching task found', input };
          appendLog('IMPERATIVE MISS: complete_task', err);
          return { content: [{ type: 'text', text: JSON.stringify(err) }] };
        }
        task.done = true;
        renderTasks();
        appendLog('IMPERATIVE EXECUTE: complete_task', task);
        return { content: [{ type: 'text', text: JSON.stringify({ completed: task }) }] };
      }
    }
  ];
}

function registerImperativeTools(enable) {
  // Unregister previous batch via AbortController or unregisterTool()
  if (imperativeAbortController) {
    imperativeAbortController.abort();
    imperativeAbortController = null;
  }
  ['list_tasks', 'add_task', 'complete_task'].forEach((name) => {
    localTools.delete(name);
    if (nativeWebMcp && typeof navigator.modelContext.unregisterTool === 'function') {
      try { navigator.modelContext.unregisterTool(name); } catch (_) {}
    }
  });

  if (!enable) {
    appendLog('LIFECYCLE', 'Unregistered imperative tools (list_tasks, add_task, complete_task)');
    refreshInspectorSelector();
    return;
  }

  imperativeAbortController = new AbortController();
  const tools = buildImperativeTools();

  tools.forEach((tool) => {
    localTools.set(tool.name, tool);
    if (nativeWebMcp) {
      try {
        navigator.modelContext.registerTool(tool, { signal: imperativeAbortController.signal });
      } catch (_) {
        // Older Chrome flag versions take registerTool(tool) with 1 argument
        try { navigator.modelContext.registerTool(tool); } catch (_) {}
      }
    }
  });

  appendLog(
    nativeWebMcp ? 'NATIVE registerTool()' : 'POLYFILL registerTool()',
    tools.map((t) => t.name)
  );
  refreshInspectorSelector();
}

// ============================================================================
// 2. Declarative WebMCP (<form toolname="book_session">)
// ============================================================================
function initDeclarativeBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  // Describe declarative schema for the visual Inspector panel (Chrome derives this automatically from HTML)
  localTools.set('book_session', {
    name: 'book_session',
    declarative: true,
    description: form.getAttribute('tooldescription'),
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: form.querySelector('[name="name"]').getAttribute('toolparamdescription') },
        email: { type: 'string', description: form.querySelector('[name="email"]').getAttribute('toolparamdescription') },
        topic: { type: 'string', description: form.querySelector('[name="topic"]').getAttribute('toolparamdescription') },
        format: {
          type: 'string',
          enum: ['live_demo', 'workshop', 'qa'],
          description: form.querySelector('[name="format"]').getAttribute('toolparamdescription')
        }
      },
      required: ['name', 'email', 'topic']
    },
    execute: async (input = {}, { fromSimulator = false } = {}) => {
      // Fill actual HTML form fields just like Chrome's Declarative WebMCP engine does
      if (input.name) form.elements.name.value = input.name;
      if (input.email) form.elements.email.value = input.email;
      if (input.topic) form.elements.topic.value = input.topic;
      if (input.format) form.elements.format.value = input.format;

      const evt = new Event('submit', { bubbles: true, cancelable: true });
      evt._simulatedAgent = fromSimulator;
      form.dispatchEvent(evt);
      return {
        content: [{ type: 'text', text: JSON.stringify({ status: 'submitted', latest: state.bookings[0] }) }]
      };
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const isAgent = Boolean(e.agentInvoked || e._simulatedAgent);
    const data = Object.fromEntries(new FormData(form).entries());
    const booking = {
      name: data.name,
      email: data.email,
      topic: data.topic,
      format: data.format || 'live_demo',
      agentInvoked: isAgent,
      createdAt: new Date().toISOString()
    };

    state.bookings.unshift(booking);
    renderBookings();
    appendLog(`DECLARATIVE SUBMIT (agentInvoked=${isAgent})`, booking);

    // Chrome WebMCP declarative hook: return structured JSON back to calling agent
    if (typeof e.respondWith === 'function') {
      e.respondWith(Promise.resolve(JSON.stringify({ status: 'booked', booking })));
    }
    form.reset();
  });
}

// ============================================================================
// 3. Visual Inspector & Simulator Panel
// ============================================================================
function refreshInspectorSelector() {
  const select = document.getElementById('tool-select');
  const schemaPreview = document.getElementById('schema-preview');
  const argsInput = document.getElementById('tool-args-input');
  if (!select) return;

  const previous = select.value;
  const entries = Array.from(localTools.values());
  select.innerHTML = entries
    .map((t) => `<option value="${t.name}">${t.name}${t.declarative ? ' (Declarative HTML)' : ' (Imperative JS)'}</option>`)
    .join('');

  if (previous && localTools.has(previous)) {
    select.value = previous;
  }

  const updateSelected = () => {
    const tool = localTools.get(select.value);
    if (!tool) {
      schemaPreview.textContent = '// No tool selected';
      argsInput.value = '{}';
      return;
    }
    schemaPreview.textContent = JSON.stringify(
      { name: tool.name, description: tool.description, inputSchema: tool.inputSchema },
      null,
      2
    );
    argsInput.value = JSON.stringify(EXAMPLE_ARGS[tool.name] || {}, null, 2);
  };

  select.onchange = updateSelected;
  updateSelected();
}

function initUI() {
  const badge = document.getElementById('webmcp-runtime-badge');
  if (badge) {
    badge.textContent = nativeWebMcp ? 'Native Chrome WebMCP Active' : 'Interactive Simulator (No Flag Needed)';
    if (nativeWebMcp) badge.classList.add('native');
  }

  document.getElementById('manual-task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('manual-task-input');
    const priority = document.getElementById('manual-task-priority')?.value || 'medium';
    const title = input.value.trim();
    if (!title) return;
    state.tasks.unshift({ id: state.nextTaskId++, title, priority, done: false });
    input.value = '';
    renderTasks();
  });

  document.getElementById('toggle-imperative')?.addEventListener('change', (e) => {
    registerImperativeTools(e.target.checked);
  });

  document.getElementById('reset-args-btn')?.addEventListener('click', () => {
    const toolName = document.getElementById('tool-select')?.value;
    document.getElementById('tool-args-input').value = JSON.stringify(EXAMPLE_ARGS[toolName] || {}, null, 2);
  });

  document.getElementById('run-tool-btn')?.addEventListener('click', async () => {
    const toolName = document.getElementById('tool-select')?.value;
    const tool = localTools.get(toolName);
    if (!tool) return;

    let parsedArgs = {};
    try {
      const raw = document.getElementById('tool-args-input').value.trim();
      parsedArgs = raw ? JSON.parse(raw) : {};
    } catch (err) {
      appendLog('JSON PARSE ERROR', String(err));
      return;
    }

    const res = await tool.execute(parsedArgs, { fromSimulator: true });
    appendLog(`SIMULATOR RESULT: ${toolName}`, res);
  });

  document.getElementById('clear-log-btn')?.addEventListener('click', () => {
    document.getElementById('invocation-log').textContent = '';
  });

  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      themeBtn.textContent = 'Dark Mode';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeBtn.textContent = 'Light Mode';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderBookings();
  initDeclarativeBookingForm();
  registerImperativeTools(true);
  initUI();
});
