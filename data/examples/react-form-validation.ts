import type { CodeExample } from "./types";

export const reactFormValidation: CodeExample = {
  id: "react-form-validation",
  title: "Form Validation",
  description: "Real-time validation for form inputs",
  steps: [
    {
      title: "Step 1: Basic form",
      previousCode: "",
      currentCode: `function LoginForm() {
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
}`,
      language: "typescript",
      fileName: "LoginForm.tsx",
    },
    {
      title: "Step 2: Add validation state",
      previousCode: `function LoginForm() {
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
}`,
      currentCode: `function LoginForm() {
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
}`,
      language: "typescript",
      fileName: "LoginForm.tsx",
    },
    {
      title: "Step 3: Add validation functions",
      previousCode: `function LoginForm() {
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
}`,
      currentCode: `function LoginForm() {
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
}`,
      language: "typescript",
      fileName: "LoginForm.tsx",
    },
    {
      title: "Step 4: Add real-time validation",
      previousCode: `function LoginForm() {
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
}`,
      currentCode: `function LoginForm() {
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
}`,
      language: "typescript",
      fileName: "LoginForm.tsx",
    },
  ],
};

