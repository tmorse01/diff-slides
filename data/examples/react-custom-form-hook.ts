import type { CodeExample } from "./types";

export const reactCustomFormHook: CodeExample = {
  id: "react-custom-form-hook",
  title: "Custom Form Hook",
  description: "Reusable form logic with custom hook",
  steps: [
    {
      title: "Step 1: Form with inline logic",
      previousCode: "",
      currentCode: `function ContactForm() {
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
}`,
      language: "typescript",
      fileName: "ContactForm.tsx",
    },
    {
      title: "Step 2: Create useForm hook structure",
      previousCode: `function ContactForm() {
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
}`,
      currentCode: `function useForm(initialValues) {
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
}`,
      language: "typescript",
      fileName: "ContactForm.tsx",
    },
    {
      title: "Step 3: Add change handler",
      previousCode: `function useForm(initialValues) {
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
}`,
      currentCode: `function useForm(initialValues) {
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
}`,
      language: "typescript",
      fileName: "ContactForm.tsx",
    },
    {
      title: "Step 4: Add validation and submit",
      previousCode: `function useForm(initialValues) {
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
}`,
      currentCode: `function useForm(initialValues, validate) {
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
}`,
      language: "typescript",
      fileName: "ContactForm.tsx",
    },
  ],
};

