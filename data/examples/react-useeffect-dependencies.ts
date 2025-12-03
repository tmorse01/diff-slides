import type { CodeExample } from "./types";

export const reactUseEffectDependencies: CodeExample = {
  id: "react-useeffect-dependencies",
  title: "useEffect Dependencies",
  description: "Understanding dependency array behavior",
  steps: [
    {
      title: "Step 1: useEffect without dependencies",
      previousCode: "",
      currentCode: `function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  })
  
  return <div>Count: {count}</div>
}`,
      language: "typescript",
      fileName: "Timer.tsx",
    },
    {
      title: "Step 2: Add empty dependency array",
      previousCode: `function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  })
  
  return <div>Count: {count}</div>
}`,
      currentCode: `function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }, [])
  
  return <div>Count: {count}</div>
}`,
      language: "typescript",
      fileName: "Timer.tsx",
    },
    {
      title: "Step 3: Add cleanup function",
      previousCode: `function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }, [])
  
  return <div>Count: {count}</div>
}`,
      currentCode: `function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return <div>Count: {count}</div>
}`,
      language: "typescript",
      fileName: "Timer.tsx",
    },
    {
      title: "Step 4: Effect with dependencies",
      previousCode: `function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return <div>Count: {count}</div>
}`,
      currentCode: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
  ],
};

