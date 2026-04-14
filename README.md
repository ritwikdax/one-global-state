# one-global-state

A tiny React hook that gives you `useState`-style API with automatic global sync across all components — no Context, no Provider, no prop drilling.

[![npm](https://img.shields.io/npm/v/one-global-state)](https://www.npmjs.com/package/one-global-state)
[![license](https://img.shields.io/npm/l/one-global-state)](LICENSE)

## Installation

```bash
npm install one-global-state
```

## Quick start

```tsx
import { useGlobalState } from "one-global-state";

function Counter() {
  const [count, setCount] = useGlobalState("count", 0);
  return <button onClick={() => setCount((n) => n + 1)}>Count: {count}</button>;
}
```

Any component that calls `useGlobalState` with the same key will share the same value and re-render whenever it changes.

## API

### `useGlobalState<T>(key, initialValue)`

```ts
const [value, setValue] = useGlobalState<T>(key: string, initialValue: T)
```

| Param          | Type     | Description                                   |
| -------------- | -------- | --------------------------------------------- |
| `key`          | `string` | Unique identifier for the global state entry  |
| `initialValue` | `T`      | Used only if no value exists for this key yet |

Returns `[value, setValue]` — identical shape to `useState`.

`setValue` accepts both a direct value and a functional updater:

```ts
setValue(42); // direct value
setValue((prev) => prev + 1); // functional updater
```

---

### `setGlobalState<T>(key, value)` — standalone setter

Update global state from **outside** a React component (event handlers, utils, etc.):

```ts
import { setGlobalState } from "one-global-state";

setGlobalState("count", 0); // direct value
setGlobalState("count", (n) => n + 1); // functional updater
```

---

## Usage examples

### Multiple components sharing one key

```tsx
function CounterDisplay() {
  const [count] = useGlobalState("count", 0);
  return <span>{count}</span>;
}

function CounterControls() {
  const [, setCount] = useGlobalState("count", 0);
  return (
    <>
      <button onClick={() => setCount((n) => n - 1)}>−</button>
      <button onClick={() => setCount((n) => n + 1)}>+</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </>
  );
}
```

Both components stay in sync automatically — no shared parent state needed.

---

### Multiple independent keys

```tsx
function Profile() {
  const [name, setName] = useGlobalState("username", "");
  const [theme, setTheme] = useGlobalState<"light" | "dark">("theme", "light");

  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        Toggle theme
      </button>
    </>
  );
}
```

---

### Array state with functional updater

```tsx
type Todo = { id: number; text: string; done: boolean };

function useTodos() {
  return useGlobalState<Todo[]>("todos", []);
}

function AddTodo() {
  const [, setTodos] = useTodos();
  const add = (text: string) =>
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
  // ...
}

function TodoList() {
  const [todos, setTodos] = useTodos();
  const toggle = (id: number) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  // ...
}
```

---

### Calling `setGlobalState` outside React

```ts
// Reset all state on logout — no hook needed
function logout() {
  setGlobalState("username", "");
  setGlobalState("todos", []);
}
```

## How it works

- A module-level `Map` stores values keyed by string — shared across the entire app.
- Built on [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), React's purpose-built API for external stores, ensuring tear-free re-renders under concurrent mode.
- React is a peer dependency — the library ships zero runtime dependencies.

## Requirements

- React ≥ 17 (uses `useSyncExternalStore` via React 18+; for React 17 add the [shim](https://www.npmjs.com/package/use-sync-external-store))

## License

MIT
