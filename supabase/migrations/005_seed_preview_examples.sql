-- Seed data for Preview Examples
-- User ID: dddbcd9e-87d4-4ba1-a402-62d2470022d2
-- This script inserts all preview examples as projects with steps

-- React useState Hook
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'React useState Hook', 'react-usestate-hook', 'Learn how to manage component state with useState', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 0, 'Step 1: Static component', NULL, 'typescript', $code$function Counter() {
  return <div>Count: 0</div>
}$code$),
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 1, 'Step 2: Add useState hook', NULL, 'typescript', $code$import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return <div>Count: 0</div>
}$code$),
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, 'Step 3: Use state in JSX', NULL, 'typescript', $code$import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)
  return <div>Count: {count}</div>
}$code$),
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 3, 'Step 4: Add increment button', NULL, 'typescript', $code$import { useState } from "react"

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
}$code$);

-- React useEffect Hook
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'React useEffect Hook', 'react-useeffect-hook', 'Handle side effects and lifecycle events', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 0, 'Step 1: Component with state', NULL, 'typescript', $code$import { useState } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  return <div>Loading...</div>
}$code$),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 1, 'Step 2: Add useEffect import', NULL, 'typescript', $code$import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  return <div>Loading...</div>
}$code$),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 2, 'Step 3: Fetch data on mount', NULL, 'typescript', $code$import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  return <div>Loading...</div>
}$code$),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 3, 'Step 4: Display user data', NULL, 'typescript', $code$import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>Hello, {user.name}!</div>
}$code$);

-- Custom React Hook
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Custom React Hook', 'custom-react-hook', 'Extract reusable logic into custom hooks', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 0, 'Step 1: Component with API logic', NULL, 'typescript', $code$function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  return <div>{products.length} products</div>
}$code$),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 1, 'Step 2: Extract to custom hook', NULL, 'typescript', $code$function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url])
  
  return { data, loading }
}

function ProductList() {
  const { data: products, loading } = useFetch("/api/products")
  
  if (loading) return <div>Loading...</div>
  return <div>{products.length} products</div>
}$code$);

-- React Context API
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'React Context API', 'react-context-api', 'Share state across components with Context', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 0, 'Step 1: Prop drilling', NULL, 'typescript', $code$function App() {
  const [theme, setTheme] = useState("light")
  return <Header theme={theme} />
}

function Header({ theme }) {
  return <Button theme={theme} />
}

function Button({ theme }) {
  return <button className={theme}>Click me</button>
}$code$),
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 1, 'Step 2: Create context', NULL, 'typescript', $code$import { createContext, useContext } from "react"

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
}$code$);

-- useState with Arrays
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'useState with Arrays', 'usestate-with-arrays', 'Adding and removing items from arrays in state', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 0, 'Step 1: Static list', NULL, 'typescript', $code$function TodoList() {
  return (
    <ul>
      <li>Buy groceries</li>
    </ul>
  )
}$code$),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 1, 'Step 2: Add state for todos', NULL, 'typescript', $code$import { useState } from "react"

function TodoList() {
  const [todos, setTodos] = useState(["Buy groceries"])
  
  return (
    <ul>
      {todos.map(todo => <li key={todo}>{todo}</li>)}
    </ul>
  )
}$code$),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 2, 'Step 3: Add function to add todos', NULL, 'typescript', $code$import { useState } from "react"

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
}$code$),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 3, 'Step 4: Add remove function', NULL, 'typescript', $code$import { useState } from "react"

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
}$code$);

-- useReducer Hook
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'useReducer Hook', 'usereducer-hook', 'Replacing useState with reducer pattern for complex state', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 0, 'Step 1: Component with multiple useState', NULL, 'typescript', $code$import { useState } from "react"

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
}$code$),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 1, 'Step 2: Import useReducer', NULL, 'typescript', $code$import { useReducer } from "react"

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
}$code$),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 2, 'Step 3: Create reducer function', NULL, 'typescript', $code$import { useReducer } from "react"

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
}$code$),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 3, 'Step 4: Replace useState with useReducer', NULL, 'typescript', $code$import { useReducer } from "react"

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
}$code$);

-- useState Lazy Initialization
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'useState Lazy Initialization', 'usestate-lazy-initialization', 'Using function initializer to compute initial state', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 0, 'Step 1: Expensive computation in component', NULL, 'typescript', $code$function ExpensiveComponent() {
  const expensiveValue = computeExpensiveValue()
  const [value, setValue] = useState(expensiveValue)
  
  return <div>Value: {value}</div>
}$code$),
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 1, 'Step 2: Move computation to useState', NULL, 'typescript', $code$function ExpensiveComponent() {
  const [value, setValue] = useState(() => {
    return computeExpensiveValue()
  })
  
  return <div>Value: {value}</div>
}$code$),
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 2, 'Step 3: Add example with localStorage', NULL, 'typescript', $code$function UserPreferences() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme")
    return saved || "light"
  })
  
  return <div>Theme: {theme}</div>
}$code$);

-- useEffect Dependencies
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'useEffect Dependencies', 'useeffect-dependencies', 'Understanding dependency array behavior', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 0, 'Step 1: useEffect without dependencies', NULL, 'typescript', $code$function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  })
  
  return <div>Count: {count}</div>
}$code$),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 1, 'Step 2: Add empty dependency array', NULL, 'typescript', $code$function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }, [])
  
  return <div>Count: {count}</div>
}$code$),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 2, 'Step 3: Add cleanup function', NULL, 'typescript', $code$function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return <div>Count: {count}</div>
}$code$),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 3, 'Step 4: Effect with dependencies', NULL, 'typescript', $code$function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}$code$);

-- Form Validation
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Form Validation', 'form-validation', 'Real-time validation for form inputs', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 0, 'Step 1: Basic form', NULL, 'typescript', $code$function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ email, password })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}$code$),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 1, 'Step 2: Add validation state', NULL, 'typescript', $code$function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ email, password })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}$code$),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 2, 'Step 3: Add validation functions', NULL, 'typescript', $code$function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  
  const validateEmail = (email) => {
    return email.includes("@")
  }
  
  const validatePassword = (password) => {
    return password.length >= 8
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!validateEmail(email)) {
      newErrors.email = "Invalid email"
    }
    if (!validatePassword(password)) {
      newErrors.password = "Password must be 8+ characters"
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      console.log({ email, password })
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}
      <button type="submit">Login</button>
    </form>
  )
}$code$),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 3, 'Step 4: Add real-time validation', NULL, 'typescript', $code$function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  
  const validateEmail = (email) => {
    return email.includes("@")
  }
  
  const validatePassword = (password) => {
    return password.length >= 8
  }
  
  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setErrors({ ...errors, email: "Invalid email" })
    } else {
      const { email, ...rest } = errors
      setErrors(rest)
    }
  }
  
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (value && !validatePassword(value)) {
      setErrors({ ...errors, password: "Password must be 8+ characters" })
    } else {
      const { password, ...rest } = errors
      setErrors(rest)
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.keys(errors).length === 0) {
      console.log({ email, password })
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={handleEmailChange}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}
      <button type="submit">Login</button>
    </form>
  )
}$code$);

-- Custom Form Hook
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Custom Form Hook', 'custom-form-hook', 'Reusable form logic with custom hook', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 0, 'Step 1: Form with inline logic', NULL, 'typescript', $code$function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // validation and submit logic
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  )
}$code$),
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 1, 'Step 2: Create useForm hook structure', NULL, 'typescript', $code$function useForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  
  return { values, errors }
}

function ContactForm() {
  const { values, errors } = useForm({ name: "", email: "" })
  
  return (
    <form>
      <input />
      <input />
      <button type="submit">Submit</button>
    </form>
  )
}$code$),
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 2, 'Step 3: Add change handler', NULL, 'typescript', $code$function useForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }
  
  return { values, errors, handleChange }
}

function ContactForm() {
  const { values, errors, handleChange } = useForm({ name: "", email: "" })
  
  return (
    <form>
      <input
        name="name"
        value={values.name}
        onChange={handleChange}
      />
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  )
}$code$),
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 3, 'Step 4: Add validation and submit', NULL, 'typescript', $code$function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate ? validate(values) : {}
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      console.log("Submit:", values)
    }
  }
  
  return { values, errors, handleChange, handleSubmit }
}

function ContactForm() {
  const validate = (values) => {
    const errors = {}
    if (!values.name) errors.name = "Name required"
    if (!values.email.includes("@")) errors.email = "Invalid email"
    return errors
  }
  
  const { values, errors, handleChange, handleSubmit } = useForm(
    { name: "", email: "" },
    validate
  )
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={values.name}
        onChange={handleChange}
      />
      {errors.name && <span>{errors.name}</span>}
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}$code$);

-- Fetch with Loading States
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Fetch with Loading States', 'fetch-with-loading-states', 'Handling loading, error, and success states', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 0, 'Step 1: Basic fetch', NULL, 'typescript', $code$function UserList() {
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
}$code$),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 1, 'Step 2: Add loading state', NULL, 'typescript', $code$function UserList() {
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
}$code$),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 2, 'Step 3: Add error state', NULL, 'typescript', $code$function UserList() {
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
}$code$),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 3, 'Step 4: Add retry functionality', NULL, 'typescript', $code$function UserList() {
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
}$code$);

-- Fetch with Abort Controller
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Fetch with Abort Controller', 'fetch-with-abort-controller', 'Canceling requests to prevent race conditions', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 0, 'Step 1: Fetch without cancellation', NULL, 'typescript', $code$function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])
  
  if (!user) return <div>Loading...</div>
  return <div>{user.name}</div>
}$code$),
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 1, 'Step 2: Create AbortController', NULL, 'typescript', $code$function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const controller = new AbortController()
    
    fetch(`/api/users/${userId}`, {
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
}$code$),
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 2, 'Step 3: Handle abort errors', NULL, 'typescript', $code$function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const controller = new AbortController()
    
    fetch(`/api/users/${userId}`, {
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
}$code$),
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 3, 'Step 4: Add manual cancel button', NULL, 'typescript', $code$function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [controller, setController] = useState(null)
  
  useEffect(() => {
    const abortController = new AbortController()
    setController(abortController)
    
    fetch(`/api/users/${userId}`, {
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
}$code$);

-- Express.js Route Handler
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Express.js Route Handler', 'expressjs-route-handler', 'Create RESTful API endpoints with Express', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 0, 'Step 1: Basic Express setup', NULL, 'javascript', $code$const express = require("express")
const app = express()

app.listen(3000, () => {
  console.log("Server running on port 3000")
})$code$),
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 1, 'Step 2: Add GET route', NULL, 'javascript', $code$const express = require("express")
const app = express()

app.get("/api/users", (req, res) => {
  res.json({ users: [] })
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})$code$),
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 2, 'Step 3: Return actual data', NULL, 'javascript', $code$const express = require("express")
const app = express()

app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ]
  res.json({ users })
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})$code$);

-- Async/Await in Node.js
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Async/Await in Node.js', 'asyncawait-in-nodejs', 'Handle asynchronous operations with async/await', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 0, 'Step 1: Promise-based function', NULL, 'javascript', $code$function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(data => {
      console.log("User:", data)
      return data
    })
    .catch(err => {
      console.error("Error:", err)
    })
}$code$),
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 1, 'Step 2: Convert to async function', NULL, 'javascript', $code$async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`)
    const data = await res.json()
    console.log("User:", data)
    return data
  } catch (err) {
    console.error("Error:", err)
  }
}$code$);

-- Error Handling Middleware
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Error Handling Middleware', 'error-handling-middleware', 'Centralized error handling in Express', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 0, 'Step 1: Route with try-catch', NULL, 'javascript', $code$app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})$code$),
('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 1, 'Step 2: Extract error handler', NULL, 'javascript', $code$app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id)
    res.json(user)
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message })
})$code$);

-- Express Middleware
INSERT INTO projects (id, user_id, name, slug, description, visibility) VALUES
('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', 'dddbcd9e-87d4-4ba1-a402-62d2470022d2', 'Express Middleware', 'express-middleware', 'Add authentication middleware to routes', 'public');

INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', 0, 'Step 1: Route without auth', NULL, 'javascript', $code$app.get("/api/profile", (req, res) => {
  const user = getUserFromRequest(req)
  res.json({ profile: user })
})$code$),
('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', 1, 'Step 2: Create auth middleware', NULL, 'javascript', $code$function requireAuth(req, res, next) {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  req.user = verifyToken(token)
  next()
}

app.get("/api/profile", requireAuth, (req, res) => {
  res.json({ profile: req.user })
})$code$);

