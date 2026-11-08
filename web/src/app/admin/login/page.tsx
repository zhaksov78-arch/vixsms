"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState(login, null as { error?: string } | null);
  return (
    <main className="page narrow">
      <h1>Әкімші</h1>
      <form action={action} className="stack">
        <label>Құпиясөз<input type="password" name="password" required autoFocus autoComplete="current-password" /></label>
        <label>Authenticator коды (2FA)<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="123456" /></label>
        <button className="btn" disabled={pending}>Кіру</button>
        {state?.error && <p className="err">{state.error}</p>}
      </form>
    </main>
  );
}
