const STATUS_LABEL = { TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done" };
const STATUS_STYLE = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
};
const PRIORITY_STYLE = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-red-100 text-red-700",
};

export default function TaskCard({ task, onEdit, onDelete, onCycleStatus }) {
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className={`font-medium ${task.status === "DONE" ? "line-through text-slate-400" : "text-slate-900"}`}>
          {task.title}
        </h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLE[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="text-sm text-slate-600">{task.description}</p>}

      <div className="flex items-center flex-wrap gap-2 mt-1">
        <button
          onClick={() => onCycleStatus(task)}
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[task.status]} hover:opacity-80 transition`}
          title="Click to advance status"
        >
          {STATUS_LABEL[task.status]}
        </button>
        {dueDate && <span className="text-xs text-slate-500">Due {dueDate}</span>}
      </div>

      <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
        <button onClick={() => onEdit(task)} className="text-xs text-brand-600 hover:underline">
          Edit
        </button>
        <button onClick={() => onDelete(task)} className="text-xs text-red-600 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}
