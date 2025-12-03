import type { CodeExample } from "./types";

export const nodejsAsyncAwait: CodeExample = {
  id: "nodejs-async-await",
  title: "Async/Await in Node.js",
  description: "Handle asynchronous operations with async/await",
  steps: [
    {
      title: "Step 1: Promise-based function",
      previousCode: "",
      currentCode: `function fetchUser(id) {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json())
    .then(data => {
      console.log("User:", data)
      return data
    })
    .catch(err => {
      console.error("Error:", err)
    })
}`,
      language: "javascript",
      fileName: "userService.js",
    },
    {
      title: "Step 2: Convert to async function",
      previousCode: `function fetchUser(id) {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json())
    .then(data => {
      console.log("User:", data)
      return data
    })
    .catch(err => {
      console.error("Error:", err)
    })
}`,
      currentCode: `async function fetchUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`)
    const data = await res.json()
    console.log("User:", data)
    return data
  } catch (err) {
    console.error("Error:", err)
  }
}`,
      language: "javascript",
      fileName: "userService.js",
    },
  ],
};

