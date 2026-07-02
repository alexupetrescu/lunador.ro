"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/components/admin/AuthProvider";
import Logo from "@/components/site/Logo";
import { CRM_BASE, crmPath } from "@/lib/crm";

import styles from "./crm.module.css";

function CrmShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(crmPath("/login"));
  }, [loading, user, router]);

  if (loading) {
    return <div className={styles.centered}>Loading…</div>;
  }
  if (!user) {
    return <div className={styles.centered}>Redirecting…</div>;
  }

  const navItems = [
    { href: CRM_BASE, label: "Posts" },
    { href: crmPath("/media"), label: "Media" },
    { href: crmPath("/taxonomy"), label: "Taxonomy" },
  ];

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo size="sm" dark href="/" />
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const active =
              item.href === CRM_BASE
                ? pathname === CRM_BASE
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

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      {pathname === crmPath("/login") ? children : <CrmShell>{children}</CrmShell>}
    </AuthProvider>
  );
}
