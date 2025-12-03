import type { CodeExample } from "./types";

export const reactUseReducer: CodeExample = {
  id: "react-usereducer",
  title: "useReducer Hook",
  description: "Replacing useState with reducer pattern for complex state",
  steps: [
    {
      title: "Step 1: Component with multiple useState",
      previousCode: "",
      currentCode: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  
  const increment = () => setCount(count + step)
  const decrement = () => setCount(count - step)
  const reset = () => setCount(0)
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={increment}>+{step}</button>
      <button onClick={decrement}>-{step}</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
    {
      title: "Step 2: Import useReducer",
      previousCode: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  
  const increment = () => setCount(count + step)
  const decrement = () => setCount(count - step)
  const reset = () => setCount(0)
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={increment}>+{step}</button>
      <button onClick={decrement}>-{step}</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}`,
      currentCode: `import { useReducer } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  
  const increment = () => setCount(count + step)
  const decrement = () => setCount(count - step)
  const reset = () => setCount(0)
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={increment}>+{step}</button>
      <button onClick={decrement}>-{step}</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
    {
      title: "Step 3: Create reducer function",
      previousCode: `import { useReducer } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  
  const increment = () => setCount(count + step)
  const decrement = () => setCount(count - step)
  const reset = () => setCount(0)
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={increment}>+{step}</button>
      <button onClick={decrement}>-{step}</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}`,
      currentCode: `import { useReducer } from "react"

function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step }
    case "decrement":
      return { ...state, count: state.count - state.step }
    case "reset":
      return { ...state, count: 0 }
    default:
      return state
  }
}

function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  
  return (
    <div>
      <div>Count: {count}</div>
    </div>
  )
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
    {
      title: "Step 4: Replace useState with useReducer",
      previousCode: `import { useReducer } from "react"

function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step }
    case "decrement":
      return { ...state, count: state.count - state.step }
    case "reset":
      return { ...state, count: 0 }
    default:
      return state
  }
}

function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  
  return (
    <div>
      <div>Count: {count}</div>
    </div>
  )
}`,
      currentCode: `import { useReducer } from "react"

function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step }
    case "decrement":
      return { ...state, count: state.count - state.step }
    case "reset":
      return { ...state, count: 0 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    step: 1
  })
  
  return (
    <div>
      <div>Count: {state.count}</div>
      <button onClick={() => dispatch({ type: "increment" })}>
        +{state.step}
      </button>
      <button onClick={() => dispatch({ type: "decrement" })}>
        -{state.step}
      </button>
      <button onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
    </div>
  )
}`,
      language: "typescript",
      fileName: "Counter.tsx",
    },
  ],
};

