"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        business_name: businessName,
      });

      if (profileError) {
        setMessage(profileError.message);
        setLoading(false);
        return;
      }
    }

    setMessage("Account created! You can now log in.");
    setLoading(false);
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6"
      >
        <h1 className="text-xl font-bold text-gray-900">Create your business account</h1>
        <p className="text-sm text-gray-500 mt-1">Join Wholzo as a wholesaler or business.</p>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full mt-5 py-2.5 rounded-md border border-gray-300 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C34.5 5.5 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l6-6C34.5 5.5 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 36 26.9 37 24 37c-5.3 0-9.8-3.3-11.3-8l-6.6 5.1C9.6 40.6 16.3 45 24 45z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.3l6.5 5.5C40.9 37.1 44 31.5 44 24c0-1.2-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] text-gray-400 font-semibold">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Business name</label>
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
            placeholder="e.g. Coastline Textiles Co."
          />
        </div>

        <div className="mt-4">
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-2.5 rounded-md text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: "#4F46E5" }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {message && (
          <p className="mt-4 text-xs text-center text-gray-600">{message}</p>
        )}
      </form>
    </div>
  );
}