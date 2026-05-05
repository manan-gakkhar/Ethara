"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      setShowModal(false);
      setName("");
      setDescription("");
      fetchProjects();
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div>
      <div className="dashboard-header">
        <h1>Projects</h1>
        {isAdmin && (
          <button className="btn" style={{width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        {projects.map((project: any) => (
          <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
            <div className="card">
              <h2 className="card-title">{project.name}</h2>
              <p className="card-desc">{project.description}</p>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem'}}>
                <span className="badge badge-todo">{project._count.tasks} Tasks</span>
                <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                  Created by {project.owner.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '1rem', border: '1px dashed var(--border)'}}>
            No projects found. {isAdmin ? "Create one to get started!" : "Wait for an admin to create a project."}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 style={{marginBottom: '1.5rem'}}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  required 
                />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
