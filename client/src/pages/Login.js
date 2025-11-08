import React, { useState } from "react";
import { login } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      onLogin(res.user, res.token);
    } catch (e) {
      setErr(e.response?.data?.error || "Login failed");
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Login</h2>
      {err && <div className="form-err">{err}</div>}
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}
