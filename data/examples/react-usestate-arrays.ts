import type { CodeExample } from "./types";

export const reactUseStateArrays: CodeExample = {
  id: "react-usestate-arrays",
  title: "useState with Arrays",
  description: "Adding and removing items from arrays in state",
  steps: [
    {
      title: "Step 1: Static list",
      previousCode: "",
      currentCode: `function TodoList() {
  return (
    <ul>
      <li>Buy groceries</li>
    </ul>
  )
}`,
      language: "typescript",
      fileName: "TodoList.tsx",
    },
    {
      title: "Step 2: Add state for todos",
      previousCode: `function TodoList() {
  return (
    <ul>
      <li>Buy groceries</li>
    </ul>
  )
}`,
      currentCode: `import { useState } from "react"

function TodoList() {
  const [todos, setTodos] = useState(["Buy groceries"])
  
  return (
    <ul>
      {todos.map(todo => <li key={todo}>{todo}</li>)}
    </ul>
  )
}`,
      language: "typescript",
      fileName: "TodoList.tsx",
    },
    {
      title: "Step 3: Add function to add todos",
      previousCode: `import { useState } from "react"

function TodoList() {
  const [todos, setTodos] = useState(["Buy groceries"])
  
  return (
    <ul>
      {todos.map(todo => <li key={todo}>{todo}</li>)}
    </ul>
  )
}`,
      currentCode: `import { useState } from "react"

function TodoList() {
  const [todos, setTodos] = useState(["Buy groceries"])
  
  const addTodo = (text) => {
    setTodos([...todos, text])
  }
  
  return (
    <ul>
      {todos.map(todo => <li key={todo}>{todo}</li>)}
    </ul>
  )
}`,
      language: "typescript",
      fileName: "TodoList.tsx",
    },
    {
      title: "Step 4: Add remove function",
      previousCode: `import { useState } from "react"

function TodoList() {
  const [todos, setTodos] = useState(["Buy groceries"])
  
  const addTodo = (text) => {
    setTodos([...todos, text])
  }
  
  return (
    <ul>
      {todos.map(todo => <li key={todo}>{todo}</li>)}
    </ul>
  )
}`,
      currentCode: `import { useState } from "react"

function TodoList() {
  const [todos, setTodos] = useState(["Buy groceries"])
  
  const addTodo = (text) => {
    setTodos([...todos, text])
  }
  
  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index))
  }
  
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          {todo}
          <button onClick={() => removeTodo(index)}>Remove</button>
        </li>
      ))}
    </ul>
  )
}`,
      language: "typescript",
      fileName: "TodoList.tsx",
    },
  ],
};

