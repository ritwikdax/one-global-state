import "./App.css";
import { useGlobalState, setGlobalState } from "./useGlobalState";

// ─── Shared key constants ───────────────────────────────────────────────────
const KEYS = {
  counter: "counter",
  username: "username",
  theme: "theme",
  todos: "todos",
} as const;

// ─── Counter demo ────────────────────────────────────────────────────────────
// Two independent components share the same 'counter' key.

function CounterDisplay() {
  const [count] = useGlobalState(KEYS.counter, 0);
  return <span className="badge">{count}</span>;
}

function CounterControls() {
  const [, setCount] = useGlobalState(KEYS.counter, 0);
  return (
    <div className="btn-row">
      {/* functional updater — like useState */}
      <button onClick={() => setCount((n) => n - 1)}>−</button>
      <button onClick={() => setCount((n) => n + 1)}>+</button>
      {/* direct value */}
      <button onClick={() => setCount(0)}>Reset</button>
      {/* setGlobalState called outside a component */}
      <button
        onClick={() => setGlobalState(KEYS.counter, (n: number) => n * 2)}
      >
        ×2 (external)
      </button>
    </div>
  );
}

// ─── Username demo ───────────────────────────────────────────────────────────
// Shows direct string replacement.

function UsernameEditor() {
  const [name, setName] = useGlobalState(KEYS.username, "");
  return (
    <input
      className="text-input"
      placeholder="Type your name…"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}

function UsernameDisplay() {
  const [name] = useGlobalState(KEYS.username, "");
  return (
    <p className="display-text">
      {name ? (
        <>
          Hello, <strong>{name}</strong>!
        </>
      ) : (
        <em>No name set</em>
      )}
    </p>
  );
}

// ─── Theme toggle demo ───────────────────────────────────────────────────────
// Direct value swap between two string values.

function ThemeToggle() {
  const [theme, setTheme] = useGlobalState<"light" | "dark">(
    KEYS.theme,
    "light",
  );
  return (
    <button
      className={`theme-btn ${theme}`}
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
    >
      {theme === "light" ? "☀️ Light" : "🌙 Dark"} — click to toggle
    </button>
  );
}

function ThemeConsumer() {
  const [theme] = useGlobalState<"light" | "dark">(KEYS.theme, "light");
  return (
    <div className={`theme-box ${theme}`}>
      Current theme: <strong>{theme}</strong>
    </div>
  );
}

// ─── Todo list demo ──────────────────────────────────────────────────────────
// Demonstrates functional updater with arrays.

type Todo = { id: number; text: string; done: boolean };

function TodoInput() {
  const [, setTodos] = useGlobalState<Todo[]>(KEYS.todos, []);
  const [draft, setDraft] = useGlobalState("todo-draft", "");

  const add = () => {
    if (!draft.trim()) return;
    // functional updater to append to existing array
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: draft.trim(), done: false },
    ]);
    setDraft("");
  };

  return (
    <div className="btn-row">
      <input
        className="text-input"
        placeholder="New todo…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
      />
      <button onClick={add}>Add</button>
    </div>
  );
}

function TodoList() {
  console.log("TodoList render");
  const [todos, setTodos] = useGlobalState<Todo[]>(KEYS.todos, []);

  const toggle = (id: number) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  const remove = (id: number) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  if (todos.length === 0)
    return <p className="empty">No todos yet — add one above.</p>;

  return (
    <ul className="todo-list">
      {todos.map((t) => (
        <li key={t.id} className={t.done ? "done" : ""}>
          <span onClick={() => toggle(t.id)}>{t.text}</span>
          <button className="remove" onClick={() => remove(t.id)}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

function App() {
  return (
    <main className="demo">
      <h1>
        ous — <code>useGlobalState</code> demo
      </h1>
      <p className="subtitle">
        All components below share state via global keys — no context or prop
        drilling.
      </p>

      <section className="card">
        <h2>
          1. Counter <small>(functional updater + external setter)</small>
        </h2>
        <p className="hint">
          Two components share <code>'counter'</code>. The ×2 button calls{" "}
          <code>setGlobalState()</code> directly from outside React.
        </p>
        <div className="row">
          <CounterDisplay />
          <CounterControls />
        </div>
      </section>

      <section className="card">
        <h2>
          2. Username <small>(direct value)</small>
        </h2>
        <p className="hint">
          Editor and display are sibling components with no shared parent state.
        </p>
        <UsernameEditor />
        <UsernameDisplay />
      </section>

      <section className="card">
        <h2>
          3. Theme toggle <small>(functional string swap)</small>
        </h2>
        <p className="hint">
          Toggle and consumer share <code>'theme'</code> — independent
          components, no prop passing.
        </p>
        <ThemeToggle />
        <ThemeConsumer />
      </section>

      <section className="card">
        <h2>
          4. Todo list <small>(functional array update)</small>
        </h2>
        <p className="hint">
          Input and list share <code>'todos'</code> via functional updaters that
          operate on the previous array.
        </p>
        <TodoInput />
        <TodoList />
      </section>
    </main>
  );
}

export default App;
