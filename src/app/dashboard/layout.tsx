"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="loading-screen">Loading…</div>;
  }

  const name = session?.user?.name ?? session?.user?.email ?? "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const role = (session?.user as any)?.role ?? "MEMBER";

  return (
    <div>
      <nav className="dashboard-nav">
        <Link href="/dashboard" className="nav-brand">
          ProjectTracker
        </Link>

        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-avatar">{initials}</div>
            <span style={{ color: "var(--text-subtle)", fontSize: "0.875rem" }}>{name}</span>
            <span className="nav-role-badge">{role}</span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn btn-ghost btn-sm"
            title="Sign out"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      <main className="container fade-in">{children}</main>
    </div>
  );
}
