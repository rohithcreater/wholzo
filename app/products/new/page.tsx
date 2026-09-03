"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [moq, setMoq] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 5));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        setMessage(`Image upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrls.push(urlData.publicUrl);
    }

    const { error } = await supabase.from("products").insert({
      business_id: user.id,
      name,
      category,
      price_range: priceRange,
      moq: moq ? parseInt(moq) : null,
      description,
      image_urls: imageUrls,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6"
      >
        <h1 className="text-xl font-bold text-gray-900">List a product</h1>
        <p className="text-sm text-gray-500 mt-1">
          This will appear in the Wholzo directory for other businesses to find.
        </p>

        <div className="mt-5">
          <label className="text-xs font-semibold text-gray-700">Product name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cotton Poplin Fabric"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Textiles & Fabric"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Price range</label>
          <input
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g. 250 to 350 rupees per unit"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Minimum order quantity (MOQ)</label>
          <input
            type="number"
            value={moq}
            onChange={(e) => setMoq(e.target.value)}
            placeholder="e.g. 100"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the product..."
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none resize-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Product photos (up to 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full mt-1 text-xs"
          />
          {files.length > 0 && (
            <p className="text-[11px] text-gray-500 mt-1">{files.length} photo(s) selected</p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-6 py-2.5 rounded-md text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: "#4F46E5" }}
        >
          {saving ? "Saving..." : "List product"}
        </button>

        {message && (
          <p className="mt-4 text-xs text-center text-red-600">{message}</p>
        )}
      </form>
    </div>
  );
}