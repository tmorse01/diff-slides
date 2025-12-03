import type { CodeExample } from "./types";

export const reactFetchLoadingStates: CodeExample = {
  id: "react-fetch-loading-states",
  title: "Fetch with Loading States",
  description: "Handling loading, error, and success states",
  steps: [
    {
      title: "Step 1: Basic fetch",
      previousCode: "",
      currentCode: `function UserList() {
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers)
  }, [])
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}`,
      language: "typescript",
      fileName: "UserList.tsx",
    },
    {
      title: "Step 2: Add loading state",
      previousCode: `function UserList() {
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers)
  }, [])
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}`,
      currentCode: `function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setLoading(true)
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}`,
      language: "typescript",
      fileName: "UserList.tsx",
    },
    {
      title: "Step 3: Add error state",
      previousCode: `function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setLoading(true)
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}`,
      currentCode: `function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch("/api/users")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}`,
      language: "typescript",
      fileName: "UserList.tsx",
    },
    {
      title: "Step 4: Add retry functionality",
      previousCode: `function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch("/api/users")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}`,
      currentCode: `function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchUsers = () => {
    setLoading(true)
    setError(null)
    fetch("/api/users")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }
  
  useEffect(() => {
    fetchUsers()
  }, [])
  
  if (loading) return <div>Loading...</div>
  if (error) {
    return (
      <div>
        <div>Error: {error}</div>
        <button onClick={fetchUsers}>Retry</button>
      </div>
    )
  }
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}`,
      language: "typescript",
      fileName: "UserList.tsx",
    },
  ],
};

