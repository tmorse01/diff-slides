import type { CodeExample } from "./types";

export const nodejsExpressRoute: CodeExample = {
  id: "nodejs-express-route",
  title: "Express.js Route Handler",
  description: "Create RESTful API endpoints with Express",
  steps: [
    {
      title: "Step 1: Basic Express setup",
      previousCode: "",
      currentCode: `const express = require("express")
const app = express()

app.listen(3000, () => {
  console.log("Server running on port 3000")
})`,
      language: "javascript",
      fileName: "server.js",
    },
    {
      title: "Step 2: Add GET route",
      previousCode: `const express = require("express")
const app = express()

app.listen(3000, () => {
  console.log("Server running on port 3000")
})`,
      currentCode: `const express = require("express")
const app = express()

app.get("/api/users", (req, res) => {
  res.json({ users: [] })
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})`,
      language: "javascript",
      fileName: "server.js",
    },
    {
      title: "Step 3: Return actual data",
      previousCode: `const express = require("express")
const app = express()

app.get("/api/users", (req, res) => {
  res.json({ users: [] })
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})`,
      currentCode: `const express = require("express")
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
})`,
      language: "javascript",
      fileName: "server.js",
    },
  ],
};

