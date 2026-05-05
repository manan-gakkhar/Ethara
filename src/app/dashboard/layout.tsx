"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, CheckSquare } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;
  }

  return (
    <div>
      <nav className="dashboard-nav">
        <Link href="/dashboard" className="nav-brand">ProjectTracker</Link>
        <div className="nav-links">
          <span>Hello, {session?.user?.name} ({(session?.user as any)?.role})</span>
          <button onClick={() => signOut()} className="btn btn-secondary" style={{width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>
      <main className="container">
        {children}
      </main>
    </div>
  );
}
