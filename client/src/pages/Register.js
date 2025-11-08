import React, { useState } from "react";
import { register } from "../api";

export default function Register({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await register({ name, email, password });
      onLogin(res.user, res.token);
    } catch (e) {
      setErr(e.response?.data?.error || "Register failed");
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Create account</h2>
      {err && <div className="form-err">{err}</div>}
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
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
      <button type="submit">Register</button>
    </form>
  );
}
