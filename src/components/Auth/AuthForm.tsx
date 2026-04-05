import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      alert("Compte créé !");
    }
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      alert("Connecté !");
    }
  };

  return (
    <div style={container}>
      <h3 style={title}>Account</h3>

      <input
        style={input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={actions}>
        <button style={btnPrimary} onClick={handleLogin}>
          Login
        </button>

        <button style={btnSecondary} onClick={handleSignUp}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

/* 🎨 STYLE BEATSTUDIO */

const container: React.CSSProperties = {
  position: "fixed",
  top: "20px",
  left: "20px",
  background: "rgba(20, 20, 30, 0.95)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(124, 58, 237, 0.3)",
  borderRadius: "12px",
  padding: "16px",
  width: "220px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: 9999,
};

const title: React.CSSProperties = {
  color: "#7c3aed",
  fontSize: "14px",
  margin: 0,
};

const input: React.CSSProperties = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #333",
  background: "#0f0f1a",
  color: "#fff",
  fontSize: "12px",
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: "6px",
};

const btnPrimary: React.CSSProperties = {
  flex: 1,
  background: "#7c3aed",
  border: "none",
  color: "#fff",
  padding: "6px",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  flex: 1,
  background: "#1f1f2e",
  border: "1px solid #444",
  color: "#aaa",
  padding: "6px",
  borderRadius: "6px",
  cursor: "pointer",
};