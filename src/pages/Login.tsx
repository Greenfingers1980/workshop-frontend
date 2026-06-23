
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setStatus("Signing in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setStatus("Login failed: " + error.message);
      return;
    }

    setStatus("Login successful!");
    navigate("/technician/learning/courses");
  };

  const handleSignup = async () => {
    setStatus("Creating account...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Signup error:", error);
      setStatus("Signup failed: " + error.message);
      return;
    }

    setStatus("Account created! Please log in.");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundImage: "url('/morris-wallpaper.png')",
        backgroundSize: "cover",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          width: "300px",
          textAlign: "center",
        }}
      >
        <h2>Technician Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
        />
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>
        <button
          onClick={handleSignup}
          style={{
            width: "100%",
            padding: "0.5rem",
            backgroundColor: "#95a5a6",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
        <p style={{ marginTop: "1rem" }}>{status}</p>
      </div>
    </div>
  );
};

export default Login;
