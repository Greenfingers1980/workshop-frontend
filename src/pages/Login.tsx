import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, ShieldAlert } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  // Prevent logged-in users from seeing the login screen
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/technician"); // Redirect to dashboard if already logged in
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setStatus("Authenticating profile link...");
    setIsError(false);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setStatus(error.message);
      setIsError(true);
      return;
    }

    setStatus("Access authorized. Redirecting...");
    
    // PATCH: Redirect to the main technician area, not the login form itself
    navigate("/technician"); 
  };

  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus("Registering profile parameters...");
    setIsError(false);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Signup error:", error);
      setStatus(error.message);
      setIsError(true);
      return;
    }

    setStatus("Account configured successfully! Please authenticate via log-in.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.04),transparent_55%)] pointer-events-none" />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400 mb-2">
            <LogIn className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Technician Terminal</h2>
          <p className="text-xs text-slate-400">Authenticate core workshop systems access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                required
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm py-2 px-4 rounded-xl shadow-lg shadow-sky-600/10 transition active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" /> Authenticate Access
            </button>
            
            <button
              type="button"
              onClick={handleSignup}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm py-2 px-4 rounded-xl transition active:scale-[0.99]"
            >
              <UserPlus className="w-4 h-4" /> Register New Account
            </button>
          </div>
        </form>

        {status && (
          <div className={`flex items-start gap-2.5 border text-xs p-3 rounded-xl transition-all ${
            isError 
              ? "bg-rose-950/20 border-rose-900/40 text-rose-400" 
              : "bg-slate-950 border-slate-850 text-sky-400"
          }`}>
            {isError && <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <p className="font-medium leading-relaxed">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;