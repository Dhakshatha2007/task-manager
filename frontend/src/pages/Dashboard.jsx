import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import TaskForm from "../components/TaskForm.jsx";
import TaskCard from "../components/TaskCard.jsx";

const STATUS_CYCLE = { TODO: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: "TODO" };
const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE", label: "Done" },
];

export default function Dashboard() {
  const { socket } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.tasks);
      setError("");
    } catch (err) {
      setError("Could not load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Live updates: if this task list changes from another tab/device, reflect it here.
  useEffect(() => {
    if (!socket) return;

    const onCreated = (task) => setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
    const onUpdated = (task) => setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    const onDeleted = ({ id }) => setTasks((prev) => prev.filter((t) => t.id !== id));

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:deleted", onDeleted);

    return () => {
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:deleted", onDeleted);
    };
  }, [socket]);

  async function handleCreate(form) {
  const { data } = await api.post("/tasks", form);
  setTasks((prev) => [data.task, ...prev.filter((t) => t.id !== data.task.id)]);
  setShowForm(false);
}

  async function handleUpdate(form) {
    const { data } = await api.put(`/tasks/${editingTask.id}`, form);
    setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
    setEditingTask(null);
  }

  async function handleDelete(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await api.delete(`/tasks/${task.id}`);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  }

  async function handleCycleStatus(task) {
    const nextStatus = STATUS_CYCLE[task.status];
    const { data } = await api.put(`/tasks/${task.id}`, { status: nextStatus });
    setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
  }

  const visibleTasks = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-xl font-semibold">Your tasks</h1>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm((s) => !s);
            }}
            className="px-4 py-2 text-sm rounded-md bg-brand-500 text-white hover:bg-brand-600 transition"
          >
            {showForm && !editingTask ? "Close" : "+ New task"}
          </button>
        </div>

        {showForm && !editingTask && (
          <div className="mb-6">
            <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {editingTask && (
          <div className="mb-6">
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                filter === f.key
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-500">Loading tasks...</p>
        ) : visibleTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks here yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setShowForm(false);
                  setEditingTask(t);
                }}
                onDelete={handleDelete}
                onCycleStatus={handleCycleStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
