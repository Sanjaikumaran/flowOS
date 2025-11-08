import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { fetchAvatars } from "./api";

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("flowos_token");
    const userRaw = localStorage.getItem("flowos_user");
    return token && userRaw ? JSON.parse(userRaw) : null;
  });

  useEffect(() => {
    if (user) {
      fetchAvatars().catch(() => {});
    }
  }, [user]);

  if (!user) {
    // show simple auth switcher
    return (
      <AuthShell
        onLogin={(u, token) => {
          localStorage.setItem("flowos_token", token);
          localStorage.setItem("flowos_user", JSON.stringify(u));
          setUser(u);
        }}
      />
    );
  }

  return (
    <Home
      onLogout={() => {
        localStorage.removeItem("flowos_token");
        localStorage.removeItem("flowos_user");
        setUser(null);
      }}
    />
  );
}

function AuthShell({ onLogin }) {
  const [mode, setMode] = useState("login");
  return (
    <div className="auth-root">
      <div className="auth-box">
        <div className="logo">flowOS</div>
        {mode === "login" ? (
          <Login onLogin={onLogin} />
        ) : (
          <Register onLogin={onLogin} />
        )}
        <div className="auth-switch">
          {mode === "login" ? (
            <span>
              New here?{" "}
              <button onClick={() => setMode("register")}>
                Create account
              </button>
            </span>
          ) : (
            <span>
              Have an account?{" "}
              <button onClick={() => setMode("login")}>Login</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
