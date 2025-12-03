import type { CodeExample } from "./types";

export const reactUseEffect: CodeExample = {
  id: "react-useeffect",
  title: "React useEffect Hook",
  description: "Handle side effects and lifecycle events",
  steps: [
    {
      title: "Step 1: Component with state",
      previousCode: "",
      currentCode: `import { useState } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  return <div>Loading...</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
    {
      title: "Step 2: Add useEffect import",
      previousCode: `import { useState } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  return <div>Loading...</div>
}`,
      currentCode: `import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  return <div>Loading...</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
    {
      title: "Step 3: Fetch data on mount",
      previousCode: `import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  return <div>Loading...</div>
}`,
      currentCode: `import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  return <div>Loading...</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
    {
      title: "Step 4: Display user data",
      previousCode: `import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  return <div>Loading...</div>
}`,
      currentCode: `import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>Hello, {user.name}!</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
  ],
};

