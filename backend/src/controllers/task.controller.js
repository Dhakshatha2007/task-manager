const prisma = require("../utils/prisma");

const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

function getIO(req) {
  return req.app.get("io");
}

// GET /api/tasks - list the logged-in user's tasks (optional ?status=&priority= filters)
async function getTasks(req, res) {
  try {
    const { status, priority } = req.query;
    const where = { userId: req.user.id };
    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (priority && VALID_PRIORITIES.includes(priority)) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });
    return res.json({ tasks });
  } catch (err) {
    console.error("getTasks error:", err);
    return res.status(500).json({ message: "Failed to fetch tasks." });
  }
}

// GET /api/tasks/:id
async function getTask(req, res) {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!task) return res.status(404).json({ message: "Task not found." });
    return res.json({ task });
  } catch (err) {
    console.error("getTask error:", err);
    return res.status(500).json({ message: "Failed to fetch task." });
  }
}

// POST /api/tasks
async function createTask(req, res) {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        status: VALID_STATUSES.includes(status) ? status : "TODO",
        priority: VALID_PRIORITIES.includes(priority) ? priority : "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
    });

    getIO(req)?.to(`user:${req.user.id}`).emit("task:created", task);
    return res.status(201).json({ task });
  } catch (err) {
    console.error("createTask error:", err);
    return res.status(500).json({ message: "Failed to create task." });
  }
}

// PUT /api/tasks/:id
async function updateTask(req, res) {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ message: "Task not found." });

    const { title, description, status, priority, dueDate } = req.body;
    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (status !== undefined && VALID_STATUSES.includes(status)) data.status = status;
    if (priority !== undefined && VALID_PRIORITIES.includes(priority)) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({ where: { id: existing.id }, data });

    getIO(req)?.to(`user:${req.user.id}`).emit("task:updated", task);
    return res.json({ task });
  } catch (err) {
    console.error("updateTask error:", err);
    return res.status(500).json({ message: "Failed to update task." });
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ message: "Task not found." });

    await prisma.task.delete({ where: { id: existing.id } });

    getIO(req)?.to(`user:${req.user.id}`).emit("task:deleted", { id: existing.id });
    return res.json({ message: "Task deleted.", id: existing.id });
  } catch (err) {
    console.error("deleteTask error:", err);
    return res.status(500).json({ message: "Failed to delete task." });
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
