"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6"
      >
        <h1 className="text-xl font-bold text-gray-900">Log in to Wholzo</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back.</p>

        <div className="mt-5">
          <label className="text-xs font-semibold text-gray-700">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
            placeholder="you@business.com"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-2.5 rounded-md text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: "#4F46E5" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {message && (
          <p className="mt-4 text-xs text-center text-red-600">{message}</p>
        )}

        <p className="text-center text-xs text-gray-500 mt-5">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-semibold" style={{ color: "#4F46E5" }}>
            Join Free
          </a>
        </p>
      </form>
    </div>
  );
}