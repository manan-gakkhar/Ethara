"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setLoading(false);
    if (res.ok) {
      setShowModal(false);
      setName("");
      setDescription("");
      fetchProjects();
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const getTaskStats = (project: any) => {
    const tasks = project._count?.tasks ?? 0;
    return tasks;
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Projects</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <div className="dashboard-header-actions">
            <button className="btn" onClick={() => setShowModal(true)}>
              <Plus size={15} />
              New Project
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {projects.map((project: any) => (
          <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="card-link">
            <div className="card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--text-muted)",
                  }}
                >
                  <FolderOpen size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 className="card-title" style={{ marginBottom: 0 }}>{project.name}</h2>
                </div>
              </div>

              <p className="card-desc" style={{ marginBottom: 0 }}>
                {project.description}
              </p>

              <div className="card-meta">
                <span className="badge badge-neutral">
                  {getTaskStats(project)} task{getTaskStats(project) !== 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {project.owner.name}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {projects.length === 0 && (
          <div className="empty-state">
            <FolderOpen size={32} style={{ margin: "0 auto 0.75rem", color: "var(--text-muted)", display: "block" }} />
            <p>
              {isAdmin
                ? "No projects yet. Create one to get started."
                : "No projects yet. An admin will create one soon."}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New Project</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="proj-name">Project Name</label>
                <input
                  id="proj-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="proj-desc">Description</label>
                <textarea
                  id="proj-desc"
                  className="form-control"
                  placeholder="What is this project about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Creating…" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
