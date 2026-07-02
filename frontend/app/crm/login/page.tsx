"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/admin/AuthProvider";
import Logo from "@/components/site/Logo";
import { ensureCsrf, login } from "@/lib/browser-api";
import { CRM_BASE } from "@/lib/crm";

import styles from "../crm.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ensureCsrf().catch(() => {});
  }, []);

  useEffect(() => {
    if (user) router.replace(CRM_BASE);
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await ensureCsrf();
      await login(username, password);
      await refresh();
      router.replace(CRM_BASE);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <div className={styles.brand}>
          <Logo size="sm" href="/" />
        </div>
        <h1 className={styles.loginTitle}>Sign in</h1>
        {error ? <p className={styles.error}>{error}</p> : null}
        <label className={styles.label}>
          Username
          <input
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button className={styles.primaryBtn} type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
