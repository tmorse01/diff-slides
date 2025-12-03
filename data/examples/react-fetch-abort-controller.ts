import type { CodeExample } from "./types";

export const reactFetchAbortController: CodeExample = {
  id: "react-fetch-abort-controller",
  title: "Fetch with Abort Controller",
  description: "Canceling requests to prevent race conditions",
  steps: [
    {
      title: "Step 1: Fetch without cancellation",
      previousCode: "",
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
    {
      title: "Step 2: Create AbortController",
      previousCode: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}`,
      currentCode: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const controller = new AbortController()
    
    fetch(\`/api/users/\${userId}\`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(setUser)
    
    return () => {
      controller.abort()
    }
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
    {
      title: "Step 3: Handle abort errors",
      previousCode: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const controller = new AbortController()
    
    fetch(\`/api/users/\${userId}\`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(setUser)
    
    return () => {
      controller.abort()
    }
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}`,
      currentCode: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const controller = new AbortController()
    
    fetch(\`/api/users/\${userId}\`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error(err)
        }
      })
    
    return () => {
      controller.abort()
    }
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
    {
      title: "Step 4: Add manual cancel button",
      previousCode: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const controller = new AbortController()
    
    fetch(\`/api/users/\${userId}\`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error(err)
        }
      })
    
    return () => {
      controller.abort()
    }
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}`,
      currentCode: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [controller, setController] = useState(null)
  
  useEffect(() => {
    const abortController = new AbortController()
    setController(abortController)
    
    fetch(\`/api/users/\${userId}\`, {
      signal: abortController.signal
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error(err)
        }
      })
    
    return () => {
      abortController.abort()
    }
  }, [userId])
  
  const handleCancel = () => {
    if (controller) {
      controller.abort()
    }
  }
  
  if (!user) {
    return (
      <div>
        <div>Loading...</div>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    )
  }
  return <div>{user.name}</div>
}`,
      language: "typescript",
      fileName: "UserProfile.tsx",
    },
  ],
};

