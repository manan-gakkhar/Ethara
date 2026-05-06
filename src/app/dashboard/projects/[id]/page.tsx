"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

const COLUMNS = [
  { key: "TODO",        label: "To Do",       dotColor: "#818cf8" },
  { key: "IN_PROGRESS", label: "In Progress",  dotColor: "#fbbf24" },
  { key: "DONE",        label: "Done",         dotColor: "#4ade80" },
] as const;

type Status = (typeof COLUMNS)[number]["key"];

export default function ProjectDetails() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${params.id}`);
    if (res.ok) setProject(await res.json());
    else router.push("/dashboard");
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    if (params.id) {
      fetchProject();
      fetchUsers();
    }
  }, [params.id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDesc,
        projectId: params.id,
        assigneeId: taskAssignee || null,
        dueDate: taskDueDate || null,
      }),
    });
    setCreating(false);
    if (res.ok) {
      setShowTaskModal(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskAssignee("");
      setTaskDueDate("");
      fetchProject();
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchProject();
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    fetchProject();
  };

  const deleteProject = async () => {
    if (!confirm("Delete this project and all its tasks? This cannot be undone.")) return;
    await fetch(`/api/projects/${params.id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (!project) {
    return <div className="loading-screen">Loading…</div>;
  }

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userId = (session?.user as any)?.id;

  const tasksByStatus = (status: Status) =>
    project.tasks.filter((t: any) => t.status === status);

  return (
    <div>
      <Link href="/dashboard" className="back-link">
        <ArrowLeft size={14} />
        Projects
      </Link>

      <div className="project-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h1>{project.name}</h1>
            {project.description && (
              <p className="card-desc" style={{ marginTop: "0.375rem", marginBottom: 0 }}>
                {project.description}
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="dashboard-header-actions">
              <button className="btn btn-danger btn-sm" onClick={deleteProject}>
                <Trash2 size={14} />
                Delete
              </button>
              <button className="btn btn-sm" onClick={() => setShowTaskModal(true)}>
                <Plus size={14} />
                New Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban board */}
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const tasks = tasksByStatus(col.key);
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className="kanban-dot" style={{ background: col.dotColor }} />
                  {col.label}
                </div>
                <span className="kanban-count">{tasks.length}</span>
              </div>

              <div className="kanban-tasks">
                {tasks.map((task: any) => {
                  const isAssignee = task.assigneeId === userId;
                  const canEdit = isAdmin || isAssignee;
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "DONE";

                  return (
                    <div key={task.id} className="task-card">
                      <div className="task-card-header">
                        <span className="task-card-title">
                          {task.title}
                          {isOverdue && (
                            <span className="overdue-badge">Overdue</span>
                          )}
                        </span>
                        {isAdmin && (
                          <button
                            className="btn-icon danger"
                            onClick={() => deleteTask(task.id)}
                            aria-label="Delete task"
                            style={{ flexShrink: 0 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {task.description && (
                        <p className="task-card-desc">{task.description}</p>
                      )}

                      <div className="task-card-meta">
                        <div className="task-card-meta-row">
                          <span className="task-card-meta-label">Assignee</span>
                          <span className="task-card-meta-value">
                            {task.assignee?.name ?? "Unassigned"}
                          </span>
                        </div>
                        {task.dueDate && (
                          <div className="task-card-meta-row">
                            <span className="task-card-meta-label">Due</span>
                            <span
                              className="task-card-meta-value"
                              style={{ color: isOverdue ? "var(--danger)" : undefined }}
                            >
                              {new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {canEdit && (
                        <select
                          className="form-control task-status-select"
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      )}
                    </div>
                  );
                })}

                {tasks.length === 0 && (
                  <div
                    style={{
                      padding: "1.5rem 1rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showTaskModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowTaskModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New Task</h2>
              <button
                className="btn-icon"
                onClick={() => setShowTaskModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="task-title">Title</label>
                <input
                  id="task-title"
                  type="text"
                  className="form-control"
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-desc">Description</label>
                <textarea
                  id="task-desc"
                  className="form-control"
                  placeholder="What needs to be done?"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-assignee">Assign To</label>
                <select
                  id="task-assignee"
                  className="form-control"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-due">Due Date</label>
                <input
                  id="task-due"
                  type="date"
                  className="form-control"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTaskModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={creating}>
                  {creating ? "Creating…" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
