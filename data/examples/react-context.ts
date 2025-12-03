import type { CodeExample } from "./types";

export const reactContext: CodeExample = {
  id: "react-context",
  title: "React Context API",
  description: "Share state across components with Context",
  steps: [
    {
      title: "Step 1: Prop drilling",
      previousCode: "",
      currentCode: `function App() {
  const [theme, setTheme] = useState("light")
  return <Header theme={theme} />
}

function Header({ theme }) {
  return <Button theme={theme} />
}

function Button({ theme }) {
  return <button className={theme}>Click me</button>
}`,
      language: "typescript",
      fileName: "App.tsx",
    },
    {
      title: "Step 2: Create context",
      previousCode: `function App() {
  const [theme, setTheme] = useState("light")
  return <Header theme={theme} />
}

function Header({ theme }) {
  return <Button theme={theme} />
}

function Button({ theme }) {
  return <button className={theme}>Click me</button>
}`,
      currentCode: `import { createContext, useContext } from "react"

const ThemeContext = createContext()

function App() {
  const [theme, setTheme] = useState("light")
  return (
    <ThemeContext.Provider value={theme}>
      <Header />
    </ThemeContext.Provider>
  )
}

function Header() {
  return <Button />
}

function Button() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Click me</button>
}`,
      language: "typescript",
      fileName: "App.tsx",
    },
  ],
};

