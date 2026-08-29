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

    setMessage("Account created! Check your email to confirm, then log in.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6"
      >
        <h1 className="text-xl font-bold text-gray-900">Create your business account</h1>
        <p className="text-sm text-gray-500 mt-1">Join Wholzo as a wholesaler or business.</p>

        <div className="mt-5">
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