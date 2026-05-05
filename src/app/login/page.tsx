"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login to your account to continue</p>
        
        {error && <div style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn">Login</button>
        </form>
        
        <div style={{ margin: "1.5rem 0", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, borderBottom: "1px solid var(--border)" }}></div>
          <span style={{ padding: "0 10px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>OR</span>
          <div style={{ flex: 1, borderBottom: "1px solid var(--border)" }}></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })} 
            className="btn" 
            style={{ backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
            type="button"
          >
            Sign in with Google
          </button>
          
          <button 
            onClick={() => signIn("email", { email, callbackUrl: "/dashboard" })} 
            className="btn" 
            style={{ backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
            type="button"
            disabled={!email}
          >
            Send Magic Link (Enter Email above)
          </button>
        </div>
        
        <p style={{marginTop: '1.5rem', marginBottom: 0}}>
          Don't have an account? <Link href="/signup" style={{color: 'var(--primary)'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
