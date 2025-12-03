import type { CodeExample } from "./types";

export const nodejsErrorHandling: CodeExample = {
  id: "nodejs-error-handling",
  title: "Error Handling Middleware",
  description: "Centralized error handling in Express",
  steps: [
    {
      title: "Step 1: Route with try-catch",
      previousCode: "",
      currentCode: `app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})`,
      language: "javascript",
      fileName: "routes.js",
    },
    {
      title: "Step 2: Extract error handler",
      previousCode: `app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})`,
      currentCode: `app.get("/api/users/:id", async (req, res, next) => {
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
})`,
      language: "javascript",
      fileName: "routes.js",
    },
  ],
};

