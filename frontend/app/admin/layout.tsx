"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/components/admin/AuthProvider";

import styles from "./admin.module.css";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [loading, user, router]);

  if (loading) {
    return <div className={styles.centered}>Loading…</div>;
  }
  if (!user) {
    return <div className={styles.centered}>Redirecting…</div>;
  }

  const navItems = [
    { href: "/admin", label: "Posts" },
    { href: "/admin/media", label: "Media" },
  ];

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>lunador</div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? styles.navItemActive : styles.navItem}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.userBox}>
          <span>{user.name}</span>
          <button type="button" onClick={logout} className={styles.logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      {pathname === "/admin/login" ? children : <AdminShell>{children}</AdminShell>}
    </AuthProvider>
  );
}
