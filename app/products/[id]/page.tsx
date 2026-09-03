"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  MessageCircle,
  ShieldCheck,
  Flag,
  CheckCircle2,
  Mail,
  Link2,
  Pencil,
  Heart,
} from "lucide-react";

const BLUE = "#1D2939";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "details">("description");
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("*, profiles(business_name, location, id, verified, created_at)")
        .eq("id", params.id)
        .single();

      if (data) {
        setProduct(data);
        setActiveImage(0);
        supabase.from("products").update({ views: (data.views || 0) + 1 }).eq("id", data.id);

        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === data.business_id) {
          setIsOwner(true);
        }
        if (user) {
          setCurrentUserId(user.id);
          const { data: fav } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", data.id)
            .maybeSingle();
          setIsFavorited(!!fav);
        }
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleChat() {
    if (!product) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/?chat=${product.business_id}&name=${encodeURIComponent(product.profiles?.business_name || "Business")}`);
  }

  async function submitReport() {
    if (!reason.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("reports").insert({
      reporter_id: user?.id ?? null,
      target_type: "product",
      target_id: product.id,
      target_name: product.name,
      reason,
    });
    setReportSent(true);
  }

  async function toggleFavorite() {
    if (!product) return;
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", currentUserId)
        .eq("product_id", product.id);
      setIsFavorited(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: currentUserId,
        product_id: product.id,
      });
      setIsFavorited(true);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Product not found.
      </div>
    );
  }

  const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : [FALLBACK_IMAGE];
  const inStock = product.in_stock !== false;
  const memberSince = product.profiles?.created_at
    ? new Date(product.profiles.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <button onClick={() => router.push("/")} className="hover:text-gray-800">Home</button>
            {product.category && (
              <>
                <span>&gt;</span>
                <span>{product.category}</span>
              </>
            )}
            <span>&gt;</span>
            <span className="text-gray-800">{product.name}</span>
          </div>
          {!reportSent && !reportOpen && (
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFavorite}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: isFavorited ? "#DC2626" : "#9CA3AF" }}
              >
                <Heart size={13} fill={isFavorited ? "#DC2626" : "none"} />
                {isFavorited ? "Saved" : "Save"}
              </button>
              {isOwner && (
                <button
                  onClick={() => router.push(`/products/${params.id}/edit`)}
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: BLUE }}
                >
                  <Pencil size={12} />
                  Edit Product
                </button>
              )}
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
              >
                <Flag size={12} />
                Report
              </button>
            </div>
          )}
        </div>

        {reportOpen && !reportSent && (
          <div className="border border-red-200 rounded-lg p-3 mb-4 bg-white">
            <p className="text-[11px] font-semibold text-red-600 mb-2">Why are you reporting this product?</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Describe the issue..."
              className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={submitReport} disabled={!reason.trim()} className="py-1.5 px-4 rounded-md bg-red-600 text-white text-[11px] font-semibold disabled:opacity-50">
                Submit
              </button>
              <button onClick={() => setReportOpen(false)} className="py-1.5 px-4 rounded-md border border-gray-300 text-[11px] font-semibold">
                Cancel
              </button>
            </div>
          </div>
        )}
        {reportSent && <p className="text-[11px] text-gray-500 mb-4">Thanks — this has been reported for review.</p>}

        {/* Main grid: gallery | specs | seller */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="hidden lg:flex lg:col-span-1 flex-col gap-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="w-full aspect-square rounded-lg overflow-hidden border-2 bg-white"
                  style={{ borderColor: i === activeImage ? BLUE : "#E5E7EB" }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image + details card */}
          <div className={`${images.length > 1 ? "lg:col-span-7" : "lg:col-span-8"} grid md:grid-cols-2 gap-6`}>
            <div className="bg-white rounded-xl border border-gray-200 aspect-square overflow-hidden">
              <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex gap-2 mb-2">
                <span className="text-[11px] font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">Featured</span>
                {inStock && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700">In Stock</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.category && <p className="text-sm text-blue-600 mt-1">{product.category}</p>}

              <p className="text-2xl font-bold text-gray-900 mt-4">
                {product.price_range || "Contact for price"} <span className="text-xs font-normal text-gray-400">/ piece</span>
              </p>
              <p className="text-[11px] text-gray-400">Price varies with quantity</p>

              <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100 text-sm">
                <SpecRow label="MOQ" value={`${product.moq || 0} Pieces`} />
                {product.category && <SpecRow label="Category" value={product.category} />}
                <SpecRow
                  label="Availability"
                  value={inStock ? "In Stock" : "Out of Stock"}
                  valueClass={inStock ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}
                />
                {product.profiles?.location && (
                  <SpecRow
                    label="Location"
                    value={
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {product.profiles.location}
                      </span>
                    }
                  />
                )}
              </div>

              <button
                onClick={handleChat}
                className="w-full mt-6 py-3 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: BLUE }}
              >
                <MessageCircle size={15} />
                Chat with Seller
              </button>
            </div>
          </div>

          {/* Seller card + why buy + share */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: BLUE }}
                >
                  {(product.profiles?.business_name || "W").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{product.profiles?.business_name || "Wholzo Business"}</p>
                  {product.profiles?.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <ShieldCheck size={12} />
                      Verified Supplier
                    </span>
                  )}
                  <p className="text-[11px] text-gray-400">Wholesale Supplier</p>
                </div>
              </div>

              {memberSince && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  Member since {memberSince}
                </div>
              )}

              <button
                onClick={handleChat}
                className="w-full mt-4 py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: BLUE }}
              >
                <MessageCircle size={15} />
                Chat with Seller
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Why buy from this seller?</h3>
              <ul className="space-y-2">
                {["Quality Assured Products", "On-time Delivery", "Best Wholesale Prices", "Easy Returns & Refunds"].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Share this product</h3>
              <div className="flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold"
                >
                  f
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold"
                >
                  X
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <Mail size={15} />
                </a>
                <button
                  onClick={copyLink}
                  className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                >
                  <Link2 size={15} />
                </button>
              </div>
              {copied && <p className="text-[11px] text-emerald-600 mt-2">Link copied</p>}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specifications */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200">
          <div className="flex gap-6 px-5 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("description")}
              className="py-3 text-sm font-medium"
              style={{
                color: activeTab === "description" ? BLUE : "#9CA3AF",
                borderBottom: activeTab === "description" ? `2px solid ${BLUE}` : "2px solid transparent",
              }}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className="py-3 text-sm font-medium"
              style={{
                color: activeTab === "details" ? BLUE : "#9CA3AF",
                borderBottom: activeTab === "details" ? `2px solid ${BLUE}` : "2px solid transparent",
              }}
            >
              Specifications
            </button>
          </div>

          <div className="p-5">
            {activeTab === "description" && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || "No description provided by the seller yet."}
              </p>
            )}
            {activeTab === "details" && (
              <ul className="text-sm text-gray-600 space-y-2">
                {product.category && <li><b className="text-gray-800">Category:</b> {product.category}</li>}
                <li><b className="text-gray-800">MOQ:</b> {product.moq || 0} pieces</li>
                <li><b className="text-gray-800">Price:</b> {product.price_range || "Contact for price"}</li>
                {product.profiles?.location && <li><b className="text-gray-800">Ships from:</b> {product.profiles.location}</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-gray-400">{label}</span>
      <span className={`text-gray-800 ${valueClass || ""}`}>{value}</span>
    </div>
  );
}