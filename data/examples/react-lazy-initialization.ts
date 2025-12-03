import type { CodeExample } from "./types";

export const reactLazyInitialization: CodeExample = {
  id: "react-lazy-initialization",
  title: "useState Lazy Initialization",
  description: "Using function initializer to compute initial state",
  steps: [
    {
      title: "Step 1: Expensive computation in component",
      previousCode: "",
      currentCode: `function ExpensiveComponent() {
  const expensiveValue = computeExpensiveValue()
  const [value, setValue] = useState(expensiveValue)
  
  return <div>Value: {value}</div>
}`,
      language: "typescript",
      fileName: "ExpensiveComponent.tsx",
    },
    {
      title: "Step 2: Move computation to useState",
      previousCode: `function ExpensiveComponent() {
  const expensiveValue = computeExpensiveValue()
  const [value, setValue] = useState(expensiveValue)
  
  return <div>Value: {value}</div>
}`,
      currentCode: `function ExpensiveComponent() {
  const [value, setValue] = useState(() => {
    return computeExpensiveValue()
  })
  
  return <div>Value: {value}</div>
}`,
      language: "typescript",
      fileName: "ExpensiveComponent.tsx",
    },
    {
      title: "Step 3: Add example with localStorage",
      previousCode: `function ExpensiveComponent() {
  const [value, setValue] = useState(() => {
    return computeExpensiveValue()
  })
  
  return <div>Value: {value}</div>
}`,
      currentCode: `function UserPreferences() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme")
    return saved || "light"
  })
  
  return <div>Theme: {theme}</div>
}`,
      language: "typescript",
      fileName: "UserPreferences.tsx",
    },
  ],
};

