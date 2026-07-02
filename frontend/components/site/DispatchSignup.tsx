"use client";

import { useState } from "react";

import styles from "./dispatch.module.css";

export default function DispatchSignup() {
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <div className={styles.success}>
        ✓ Welcome aboard. Watch the horizon every other Sunday.
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
    >
      <input
        className={styles.input}
        type="email"
        placeholder="you@somewhere.earth"
        aria-label="Email address"
      />
      <button className={styles.button} type="submit">
        Join
      </button>
    </form>
  );
}
