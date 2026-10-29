const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory sample data. This resets whenever the backend process restarts.
let nextId = 3;
let tasks = [
  { id: 1, title: "Learn Docker Compose", completed: true },
  { id: 2, title: "Connect frontend to backend", completed: false }
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const task = { id: nextId++, title, completed: false };
  tasks.push(task);
  return res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  if (typeof req.body.completed !== "boolean") {
    return res.status(400).json({ error: "'completed' must be true or false." });
  }

  task.completed = req.body.completed;
  return res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const originalLength = tasks.length;
  tasks = tasks.filter((item) => item.id !== id);

  if (tasks.length === originalLength) {
    return res.status(404).json({ error: "Task not found." });
  }

  return res.status(204).end();
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Task Manager API listening on port ${port}`);
});
