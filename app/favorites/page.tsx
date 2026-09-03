"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Heart, ArrowLeft } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85";

export default function FavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select("id, product_id, products(*, profiles(business_name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setItems(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function removeFavorite(favoriteId: string) {
    await supabase.from("favorites").delete().eq("id", favoriteId);
    setItems(items.filter((item) => item.id !== favoriteId));
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-5 hover:text-gray-700">
          <ArrowLeft size={14} />
          Back to Wholzo
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-1">My Favorites</h1>
        <p className="text-sm text-gray-500 mb-6">Products you've saved for later.</p>

        {items.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <Heart size={28} className="mx-auto text-gray-300" />
            <p className="text-sm text-gray-500 mt-3">You haven't saved any products yet.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-sm font-semibold text-blue-600"
            >
              Browse products
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const p = item.products;
              if (!p) return null;
              const image = p.image_urls?.[0] || FALLBACK_IMAGE;
              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => router.push(`/products/${p.id}`)}
                    className="block w-full text-left"
                  >
                    <img src={image} alt={p.name} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.price_range || "Contact for price"}</p>
                      {p.profiles?.business_name && (
                        <p className="text-[11px] text-gray-400 mt-1">{p.profiles.business_name}</p>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="w-full py-2 text-xs font-medium text-red-500 border-t border-gray-100 flex items-center justify-center gap-1"
                  >
                    <Heart size={12} fill="#EF4444" />
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}