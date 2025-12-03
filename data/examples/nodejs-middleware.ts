import type { CodeExample } from "./types";

export const nodejsMiddleware: CodeExample = {
  id: "nodejs-middleware",
  title: "Express Middleware",
  description: "Add authentication middleware to routes",
  steps: [
    {
      title: "Step 1: Route without auth",
      previousCode: "",
      currentCode: `app.get("/api/profile", (req, res) => {
  const user = getUserFromRequest(req)
  res.json({ profile: user })
})`,
      language: "javascript",
      fileName: "routes.js",
    },
    {
      title: "Step 2: Create auth middleware",
      previousCode: `app.get("/api/profile", (req, res) => {
  const user = getUserFromRequest(req)
  res.json({ profile: user })
})`,
      currentCode: `function requireAuth(req, res, next) {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  req.user = verifyToken(token)
  next()
}

app.get("/api/profile", requireAuth, (req, res) => {
  res.json({ profile: req.user })
})`,
      language: "javascript",
      fileName: "routes.js",
    },
  ],
};

