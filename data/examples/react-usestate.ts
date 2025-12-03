import type { CodeExample } from "./types";

export const reactUseState: CodeExample = {
  id: "react-usestate",
  title: "React useState Hook",
  description: "Learn how to manage component state with useState",
  steps: [
    {
      title: "Step 1: Static component",
      previousCode: "",
      currentCode: `function Counter() {
  return <div>Count: 0</div>
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
    {
      title: "Step 2: Add useState hook",
      previousCode: `function Counter() {
  return <div>Count: 0</div>
}`,
      currentCode: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return <div>Count: 0</div>
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
    {
      title: "Step 3: Use state in JSX",
      previousCode: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return <div>Count: 0</div>
}`,
      currentCode: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return <div>Count: {count}</div>
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
    {
      title: "Step 4: Add increment button",
      previousCode: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return <div>Count: {count}</div>
}`,
      currentCode: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
  ],
};

