import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server error or empty response");
      }
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712] px-4">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[200px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
      </div>
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/15 bg-white/[0.06] backdrop-blur-2xl px-9 py-11 shadow-[0_50px_160px_rgba(0,255,255,0.25)]">
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/20" />
        <h2 className="text-center text-[42px] font-black tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">Welcome Back</h2>
        <p className="text-center text-sm text-gray-400 mt-3 mb-12">Secure access to your intelligence platform</p>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="relative">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="peer w-full bg-transparent border-b border-white/25 py-4 text-sm text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300" />
            <label className="absolute left-0 -top-4 text-xs text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 transition-all">Email Address</label>
            <span className="absolute left-0 bottom-0 h-[3px] w-0 bg-gradient-to-r from-purple-400 via-cyan-400 to-teal-300 peer-focus:w-full transition-all duration-700" />
          </div>
          <div className="relative">
            <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="peer w-full bg-transparent border-b border-white/25 py-4 text-sm text-white placeholder-transparent focus:outline-none focus:border-cyan-400 transition-all duration-300" />
            <label className="absolute left-0 -top-4 text-xs text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 transition-all">Password</label>
            <button type="button" onClick={() => setShow(!show)} className="absolute right-0 top-4 text-xs tracking-widest text-gray-400 hover:text-cyan-400 transition">{show ? "HIDE" : "SHOW"}</button>
            <span className="absolute left-0 bottom-0 h-[3px] w-0 bg-gradient-to-r from-purple-400 via-cyan-400 to-teal-300 peer-focus:w-full transition-all duration-700" />
          </div>
          {error && <div className="text-red-400 text-xs text-center">{error}</div>}
          <button className="relative w-full py-4 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-teal-300 text-black font-bold tracking-wide shadow-[0_0_60px_rgba(0,255,255,0.6)] hover:shadow-[0_0_100px_rgba(0,255,255,0.9)] hover:scale-[1.04] active:scale-[0.96] transition-all duration-300">Login</button>
        </form>
        <p className="text-center mt-10 text-xs text-gray-400">New here?{" "}<Link to="/signup" className="font-semibold text-cyan-400 hover:text-teal-300 transition">Create an account</Link></p>
      </div>
    </main>
  );
};

export default Login;
