"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

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

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${params.id}`);
    if (res.ok) {
      setProject(await res.json());
    } else {
      router.push("/dashboard");
    }
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
    if (confirm("Are you sure?")) {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      fetchProject();
    }
  };

  const deleteProject = async () => {
    if (confirm("Delete this project and all its tasks?")) {
      await fetch(`/api/projects/${params.id}`, { method: "DELETE" });
      router.push("/dashboard");
    }
  };

  if (!project) return <div className="container">Loading...</div>;

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userId = (session?.user as any)?.id;

  return (
    <div>
      <Link href="/dashboard" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)'}}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>
      
      <div className="dashboard-header">
        <div>
          <h1 style={{marginBottom: '0.5rem'}}>{project.name}</h1>
          <p className="card-desc">{project.description}</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          {isAdmin && (
            <>
              <button className="btn btn-secondary" style={{width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={deleteProject}>
                <Trash2 size={16} /> Delete Project
              </button>
              <button className="btn" style={{width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => setShowTaskModal(true)}>
                <Plus size={16} /> New Task
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem'}}>
        {project.tasks.map((task: any) => {
          const isAssignee = task.assigneeId === userId;
          const canEditStatus = isAdmin || isAssignee;

          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

          return (
            <div key={task.id} className="card" style={{borderLeft: `4px solid ${task.status === 'TODO' ? '#3b82f6' : task.status === 'IN_PROGRESS' ? '#f59e0b' : '#10b981'}`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <h3 className="card-title">
                  {task.title}
                  {isOverdue && <span style={{marginLeft: '0.5rem', fontSize: '0.75rem', background: 'var(--danger)', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '9999px'}}>Overdue</span>}
                </h3>
                {isAdmin && (
                  <button onClick={() => deleteTask(task.id)} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer'}}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="card-desc">{task.description}</p>
              
              <div style={{marginTop: '1rem', padding: '1rem', background: '#0f172a', borderRadius: '0.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                  <span style={{color: 'var(--text-muted)'}}>Assignee:</span>
                  <span>{task.assignee?.name || "Unassigned"}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem'}}>
                  <span style={{color: 'var(--text-muted)'}}>Due Date:</span>
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                </div>
              </div>

              {canEditStatus && (
                <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'flex-end'}}>
                  <select 
                    className="form-control" 
                    style={{width: 'auto', padding: '0.5rem'}}
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              )}
              {!canEditStatus && (
                <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'flex-end'}}>
                  <span className={`badge ${task.status === 'TODO' ? 'badge-todo' : task.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-done'}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          )
        })}
        {project.tasks.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '1rem', border: '1px dashed var(--border)'}}>
            No tasks yet. {isAdmin ? "Create a task and assign it to a team member." : ""}
          </div>
        )}
      </div>

      {showTaskModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 style={{marginBottom: '1.5rem'}}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  rows={3}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-control" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
