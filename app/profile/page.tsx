"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setBusinessName(data.business_name || "");
        setIndustry(data.industry || "");
        setLocation(data.location || "");
        setDescription(data.description || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: businessName,
        industry,
        location,
        description,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile saved!");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6"
      >
        <h1 className="text-xl font-bold text-gray-900">Your business profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          This is what other businesses will see on Wholzo.
        </p>

        <div className="mt-5">
          <label className="text-xs font-semibold text-gray-700">Business name</label>
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Industry</label>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Textiles, Electronics, Hardware"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Chennai, Tamil Nadu"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell buyers what you do..."
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-6 py-2.5 rounded-md text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: "#4F46E5" }}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>

        {message && (
          <p className="mt-4 text-xs text-center text-gray-600">{message}</p>
        )}
      </form>
    </div>
  );
}
