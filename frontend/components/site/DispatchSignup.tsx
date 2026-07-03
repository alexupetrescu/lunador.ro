"use client";

import { useState } from "react";

import styles from "./dispatch.module.css";

export default function DispatchSignup() {
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <div className={styles.success}>
        ✓ Bine ai venit la bord. Urmărește orizontul din două în două duminici.
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
        placeholder="tu@undeva.pamant"
        aria-label="Adresă de e-mail"
      />
      <button className={styles.button} type="submit">
        Alătură-te
      </button>
    </form>
  );
}
