"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Sign up to start tracking projects</p>
        
        {error && <div style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn">Sign Up</button>
        </form>
        
        <div style={{ margin: "1.5rem 0", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, borderBottom: "1px solid var(--border)" }}></div>
          <span style={{ padding: "0 10px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>OR</span>
          <div style={{ flex: 1, borderBottom: "1px solid var(--border)" }}></div>
        </div>

        <button 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })} 
          className="btn" 
          style={{ backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", width: "100%" }}
          type="button"
        >
          Sign up with Google
        </button>
        
        <p style={{marginTop: '1.5rem', marginBottom: 0}}>
          Already have an account? <Link href="/login" style={{color: 'var(--primary)'}}>Login</Link>
        </p>
      </div>
    </div>
  );
}
