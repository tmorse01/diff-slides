import { Viewer } from "@/components/viewer/viewer";
import { Navbar } from "@/components/navbar";
import type { Step } from "@/types/database";

// Demo steps showing how to build a custom useForm hook
const demoSteps: Step[] = [
  {
    id: "demo-1",
    project_id: "demo-project",
    index: 0,
    title: "1. Basic Form with Manual State",
    notes:
      "We start with a simple form component using useState to manage each field manually.",
    language: "tsx",
    code: `import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
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
  );
}`,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "demo-2",
    project_id: "demo-project",
    index: 1,
    title: "2. Create Basic useForm Hook",
    notes:
      "We extract the form logic into a reusable custom hook that manages form state.",
    language: "tsx",
    code: `import { useState } from 'react';

function useForm(initialValues: Record<string, string>) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return { values, handleChange };
}

function LoginForm() {
  const { values, handleChange } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}`,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "demo-3",
    project_id: "demo-project",
    index: 2,
    title: "3. Add Validation to useForm",
    notes:
      "We add validation logic to the hook, allowing custom validation functions for each field.",
    language: "tsx",
    code: `import { useState } from 'react';

type ValidationRule = (value: string) => string | null;

function useForm(
  initialValues: Record<string, string>,
  validations?: Record<string, ValidationRule[]>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (name: string, value: string) => {
    if (!validations?.[name]) return null;
    
    for (const rule of validations[name]) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error || '' }));
  };

  return { values, errors, handleChange };
}

function LoginForm() {
  const { values, errors, handleChange } = useForm(
    { email: '', password: '' },
    {
      email: [
        (v) => (!v ? 'Email is required' : null),
        (v) => (!v.includes('@') ? 'Invalid email' : null),
      ],
      password: [
        (v) => (!v ? 'Password is required' : null),
        (v) => (v.length < 6 ? 'Password must be at least 6 characters' : null),
      ],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}
      <button type="submit">Login</button>
    </form>
  );
}`,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "demo-4",
    project_id: "demo-project",
    index: 3,
    title: "4. Add Form Reset and Submit Handler",
    notes:
      "We complete the hook by adding reset functionality and an integrated submit handler that validates all fields.",
    language: "tsx",
    code: `import { useState } from 'react';

type ValidationRule = (value: string) => string | null;

function useForm(
  initialValues: Record<string, string>,
  validations?: Record<string, ValidationRule[]>,
  onSubmit?: (values: Record<string, string>) => void
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (name: string, value: string) => {
    if (!validations?.[name]) return null;
    
    for (const rule of validations[name]) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(values).forEach((name) => {
      const error = validate(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAll() && onSubmit) {
      onSubmit(values);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, handleChange, handleSubmit, reset };
}

function LoginForm() {
  const { values, errors, handleChange, handleSubmit, reset } = useForm(
    { email: '', password: '' },
    {
      email: [
        (v) => (!v ? 'Email is required' : null),
        (v) => (!v.includes('@') ? 'Invalid email' : null),
      ],
      password: [
        (v) => (!v ? 'Password is required' : null),
        (v) => (v.length < 6 ? 'Password must be at least 6 characters' : null),
      ],
    },
    (values) => {
      console.log('Form submitted:', values);
      reset();
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}
      <button type="submit">Login</button>
      <button type="button" onClick={reset}>Reset</button>
    </form>
  );
}`,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }> | { step?: string };
}) {
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams;
  const { step: stepId } = resolvedSearchParams;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 min-h-0">
        <Viewer steps={demoSteps} initialStepId={stepId} />
      </div>
    </div>
  );
}
