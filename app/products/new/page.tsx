"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [moq, setMoq] = useState("");
  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!data) {
        setLoading(false);
        return;
      }

      if (data.business_id !== user.id) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      setName(data.name || "");
      setCategory(data.category || "");
      setPriceRange(data.price_range || "");
      setMoq(data.moq ? String(data.moq) : "");
      setDescription(data.description || "");
      setExistingImages(data.image_urls || []);
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const remainingSlots = 5 - existingImages.length;
      setNewFiles(Array.from(e.target.files).slice(0, Math.max(remainingSlots, 0)));
    }
  }

  function removeExistingImage(url: string) {
    setExistingImages(existingImages.filter((img) => img !== url));
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

    const uploadedUrls: string[] = [];

    for (const file of newFiles) {
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

      uploadedUrls.push(urlData.publicUrl);
    }

    const finalImages = [...existingImages, ...uploadedUrls];

    const { error } = await supabase
      .from("products")
      .update({
        name,
        category,
        price_range: priceRange,
        moq: moq ? parseInt(moq) : null,
        description,
        image_urls: finalImages,
      })
      .eq("id", params.id);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push(`/products/${params.id}`);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  if (notAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        You don't have permission to edit this product.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6"
      >
        <h1 className="text-xl font-bold text-gray-900">Edit product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Changes will update immediately in the Wholzo directory.
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
          <label className="text-xs font-semibold text-gray-700">Current photos</label>
          {existingImages.length === 0 && (
            <p className="text-[11px] text-gray-400 mt-1">No photos yet.</p>
          )}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">
            Add more photos (up to {Math.max(5 - existingImages.length, 0)} more)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={existingImages.length >= 5}
            onChange={handleFileChange}
            className="w-full mt-1 text-xs"
          />
          {newFiles.length > 0 && (
            <p className="text-[11px] text-gray-500 mt-1">{newFiles.length} new photo(s) selected</p>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-md text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: "#4F46E5" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/products/${params.id}`)}
            className="px-4 py-2.5 rounded-md border border-gray-300 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>

        {message && (
          <p className="mt-4 text-xs text-center text-red-600">{message}</p>
        )}
      </form>
    </div>
  );
}