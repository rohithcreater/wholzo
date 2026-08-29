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
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setBusinessName(data.business_name || "");
        setIndustry(data.industry || "");
        setLocation(data.location || "");
        setDescription(data.description || "");
        setLogoUrl(data.logo_url || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let finalLogoUrl = logoUrl;

    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business-logos")
        .upload(filePath, logoFile);

      if (uploadError) {
        setMessage(`Logo upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("business-logos")
        .getPublicUrl(filePath);

      finalLogoUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: businessName,
        industry,
        location,
        description,
        logo_url: finalLogoUrl,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile saved!");
      setLogoFile(null);
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

        <div className="mt-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Business logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-gray-400">No logo</span>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Business logo</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="text-xs" />
          </div>
        </div>

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