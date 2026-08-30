"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Shirt,
  Laptop,
  Utensils,
  Wrench,
  ToyBrick,
  Sparkles,
  Cog,
  Network,
  Handshake,
  Building2,
  Send,
  X,
  UserRound,
  Store,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Package,
  Globe2,
  BriefcaseBusiness,
} from "lucide-react";

const PURPLE = "#5146C7";
const BLACK = "#111114";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85";

type Page =
  | "home"
  | "categories"
  | "discover"
  | "requirements"
  | "messages"
  | "search";

type Product = {
  name: string;
  price: string;
  moq: number;
  state: string;
  category: string;
  image: string;
  business: string;
  businessId: string;
};

type Business = {
  id: string;
  name: string;
  state: string;
  industry: string;
  verified: boolean;
};

type ChatTarget = {
  id: string;
  name: string;
};

const categories = [
  { name: "Clothing", icon: Shirt },
  { name: "Electronics", icon: Laptop },
  { name: "Home & Kitchen", icon: Utensils },
  { name: "Hardware", icon: Wrench },
  { name: "Toys", icon: ToyBrick },
  { name: "Cosmetics", icon: Sparkles },
  { name: "Machinery", icon: Cog },
];

function priceNumber(price: string): number | null {
  const match = price.match(/[\d,]+/);
  if (!match) return null;
  return parseInt(match[0].replace(/,/g, ""), 10);
}

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [query, setQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stateFilter, setStateFilter] = useState("All States");
  const [moqFilter, setMoqFilter] = useState("MOQ");
  const [priceSort, setPriceSort] = useState("Price");

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("*, profiles(business_name, location)")
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: Product[] = data.map((p: any) => ({
          name: p.name,
          price: p.price_range || "Contact for price",
          moq: p.moq || 0,
          state: p.profiles?.location || "India",
          category: p.category || "General",
          image: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : FALLBACK_IMAGE,
          business: p.profiles?.business_name || "Wholzo Business",
          businessId: p.business_id,
        }));
        setProducts(mapped);
      }
    }

    async function loadBusinesses() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: Business[] = data.map((b: any) => ({
          id: b.id,
          name: b.business_name || "Unnamed Business",
          state: b.location || "India",
          industry: b.industry || "General",
           verified: b.verified || false,
        }));
        setBusinesses(mapped);
      }
    }

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    }

    loadProducts();
    loadBusinesses();
    loadUser();
  }, []);

  const availableCategories = useMemo(
    () => ["All Categories", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const availableStates = useMemo(
    () => ["All States", ...Array.from(new Set(products.map((p) => p.state)))],
    [products]
  );
  const moqOptions = ["MOQ", "Under 100", "100 to 500", "500+"];
  const priceOptions = ["Price", "Low to High", "High to Low"];

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchesQuery =
        query.trim() === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
      const matchesState = stateFilter === "All States" || p.state === stateFilter;
      const matchesMoq =
        moqFilter === "MOQ" ||
        (moqFilter === "Under 100" && p.moq < 100) ||
        (moqFilter === "100 to 500" && p.moq >= 100 && p.moq <= 500) ||
        (moqFilter === "500+" && p.moq > 500);
      return matchesQuery && matchesCategory && matchesState && matchesMoq;
    });

    if (priceSort === "Low to High") {
      list = [...list].sort((a, b) => (priceNumber(a.price) ?? Infinity) - (priceNumber(b.price) ?? Infinity));
    } else if (priceSort === "High to Low") {
      list = [...list].sort((a, b) => (priceNumber(b.price) ?? -Infinity) - (priceNumber(a.price) ?? -Infinity));
    }

    return list;
  }, [products, query, categoryFilter, stateFilter, moqFilter, priceSort]);

  function go(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openChat(target: ChatTarget) {
    setChatTarget(target);
    go("messages");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-white text-[#111114]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#E7E7EC]">
        <div className="max-w-[1320px] mx-auto px-5 lg:px-8 h-[68px] flex items-center justify-between">
          <button onClick={() => go("home")} className="flex items-center gap-2">
            <img src="/logo.png" alt="Wholzo" className="h-20 w-auto object-contain" />
          </button>

          <nav className="hidden lg:flex items-center gap-7">
            <Nav active={page === "home"} onClick={() => go("home")}>Home</Nav>
            <Nav active={page === "categories"} onClick={() => go("categories")}>Categories</Nav>
            <Nav active={page === "discover"} onClick={() => go("discover")}>Discover</Nav>
            <Nav active={page === "requirements"} onClick={() => go("requirements")}>Post Requirement</Nav>
            <Nav active={page === "messages"} onClick={() => go("messages")}>Messages</Nav>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 mr-2">
              <MapPin size={14} />
              India
              <ChevronDown size={12} />
            </div>

            {userEmail ? (
              <>
                <a href="/products/new" className="px-4 py-2 rounded-md text-xs font-semibold border border-gray-300 hover:bg-gray-50">
                  List Product
                </a>
                <a href="/profile" className="px-4 py-2 rounded-md text-xs font-semibold border border-gray-300 hover:bg-gray-50">
                  My Profile
                </a>
                <button onClick={handleLogout} className="px-4 py-2 rounded-md text-xs font-bold text-white" style={{ background: PURPLE }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="px-4 py-2 rounded-md text-xs font-semibold border border-gray-300 hover:bg-gray-50">
                  Login
                </a>
                <a href="/signup" className="px-4 py-2 rounded-md text-xs font-bold text-white" style={{ background: PURPLE }}>
                  Join Free
                </a>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1320px] mx-auto px-5 lg:px-8 pb-3">
          <div className="flex items-center gap-3 bg-[#F7F7F9] border border-[#E5E5EA] rounded-lg px-3.5 h-10">
            <Search size={16} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") go("search");
              }}
              placeholder="Search products, wholesalers, suppliers or requirements"
              className="flex-1 bg-transparent outline-none text-xs"
            />
            <button onClick={() => go("search")} className="px-4 py-1.5 rounded-md text-white text-[11px] font-bold" style={{ background: PURPLE }}>
              Search
            </button>
          </div>
        </div>
      </header>

      {page === "home" && (
        <>
          <section className="relative overflow-hidden bg-[#F8F8FC]">
            <div className="absolute right-[-80px] top-[-100px] opacity-[0.035]">
              <Network size={600} strokeWidth={1} />
            </div>
            <div className="max-w-[1320px] mx-auto px-5 lg:px-8 py-20 lg:py-24 grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E5EA] rounded-full text-[10px] font-bold text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
                  INDIAS WHOLESALE BUSINESS NETWORK
                </div>
                <h1 className="mt-6 text-[44px] lg:text-[60px] leading-[1.02] font-black tracking-[-2.5px]">
                  Find Businesses.
                  <br />
                  Build Connections.
                  <br />
                  <span style={{ color: PURPLE }}>Grow Wholesale.</span>
                </h1>
                <p className="mt-6 text-[15px] leading-7 text-gray-500 max-w-[570px]">
                  Discover wholesalers, suppliers and business opportunities across India. Connect directly and build long-term wholesale relationships.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <button onClick={() => go("discover")} className="px-5 py-3 rounded-md text-xs font-bold text-white" style={{ background: PURPLE }}>
                    Find Wholesalers
                    <ArrowRight size={14} className="inline ml-2" />
                  </button>
                  <button onClick={() => go("requirements")} className="px-5 py-3 rounded-md text-xs font-bold bg-white border border-[#DADAE2]">
                    Post a Requirement
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 mt-9 text-[10px] text-gray-500">
                  <div className="flex items-center gap-2"><ShieldCheck size={16} color={PURPLE} />Verified Businesses</div>
                  <div className="flex items-center gap-2"><Globe2 size={16} color={PURPLE} />Across India</div>
                  <div className="flex items-center gap-2"><MessageCircle size={16} color={PURPLE} />Direct Communication</div>
                </div>
              </div>

              <div className="relative h-[390px] flex items-center justify-center">
                <div className="absolute w-[320px] h-[320px] rounded-full border border-dashed border-[#D8D8EA]" />
                <div className="absolute w-[230px] h-[230px] rounded-full border border-[#E3E3F0]" />
                <div className="relative z-10 w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: "linear-gradient(135deg,#4036A8,#675BD5)" }}>
                  <Handshake size={42} color="white" strokeWidth={1.8} />
                </div>
                <BusinessNode className="absolute left-2 top-8" icon={<Store size={21} />} text="Wholesaler" />
                <BusinessNode className="absolute right-2 top-8" icon={<UserRound size={21} />} text="Buyer" />
                <BusinessNode className="absolute left-5 bottom-8" icon={<Package size={21} />} text="Products" />
                <BusinessNode className="absolute right-5 bottom-8" icon={<CheckCircle2 size={21} />} text="Verified" />
              </div>
            </div>
          </section>

          <section className="max-w-[1320px] mx-auto px-5 lg:px-8 py-12">
            <SectionTitle title="Explore Categories" subtitle="Find wholesale businesses by category" action="View all" onClick={() => go("categories")} />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.name} onClick={() => go("search")} className="group p-4 rounded-xl border border-[#E7E7EC] bg-white hover:border-[#C8C5F2] hover:shadow-sm transition text-left">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition" style={{ background: "#F1F0FF" }}>
                      <Icon size={19} color={PURPLE} />
                    </div>
                    <p className="mt-3 text-xs font-bold">{cat.name}</p>
                    <p className="text-[9px] text-gray-400 mt-1">Explore</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-[#F8F8FA] py-14">
            <div className="max-w-[1320px] mx-auto px-5 lg:px-8">
              <SectionTitle title="Trending Wholesale Products" subtitle="Products listed by businesses on Wholzo" action="View all products" onClick={() => go("search")} />
              <FilterBar
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                stateFilter={stateFilter}
                setStateFilter={setStateFilter}
                moqFilter={moqFilter}
                setMoqFilter={setMoqFilter}
                priceSort={priceSort}
                setPriceSort={setPriceSort}
                availableCategories={availableCategories}
                availableStates={availableStates}
                moqOptions={moqOptions}
                priceOptions={priceOptions}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {filteredProducts.length === 0 && (
                  <p className="text-xs text-gray-400 col-span-full">No products match these filters.</p>
                )}
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.name + product.businessId}
                    product={product}
                    onDetails={() => setSelectedProduct(product)}
                    onChat={() => openChat({ id: product.businessId, name: product.business })}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 relative overflow-hidden">
            <div className="relative max-w-[1100px] mx-auto px-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <BriefcaseBusiness size={14} />
                  Business Network
                </div>
                <h2 className="text-3xl font-black mt-3">
                  Connect With Businesses,
                  <br />
                  <span style={{ color: PURPLE }}>Not Just Products.</span>
                </h2>
                <p className="text-xs text-gray-500 mt-3">Discover verified wholesale businesses and start meaningful conversations.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-10">
                {businesses.length === 0 && (
                  <p className="text-xs text-gray-400 col-span-full text-center">No businesses yet.</p>
                )}
                {businesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onChat={() => openChat({ id: business.id, name: business.name })}
                    onView={() => setSelectedBusiness(business)}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-[#F7F6FF]">
            <div className="max-w-[900px] mx-auto text-center px-5">
              <h2 className="text-3xl font-black">Have a wholesale requirement?</h2>
              <p className="text-sm text-gray-500 mt-3">Post what you need and let relevant businesses discover your requirement.</p>
              <button onClick={() => go("requirements")} className="mt-6 px-6 py-3 rounded-md text-white text-xs font-bold" style={{ background: PURPLE }}>
                Post Requirement
                <ArrowRight size={14} className="inline ml-2" />
              </button>
            </div>
          </section>
        </>
      )}

      {page === "categories" && (
        <main className="max-w-[1200px] mx-auto px-5 py-14">
          <PageHeading title="Wholesale Categories" subtitle="Explore verified businesses across major wholesale categories." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-9">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.name} onClick={() => go("search")} className="text-left p-6 rounded-xl border border-[#E7E7EC] hover:shadow-md hover:border-[#C9C6F0] transition">
                  <div className="w-12 h-12 rounded-xl bg-[#F1F0FF] flex items-center justify-center">
                    <Icon color={PURPLE} />
                  </div>
                  <h3 className="font-bold text-sm mt-5">{cat.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-2">Find wholesalers</p>
                </button>
              );
            })}
          </div>
        </main>
      )}

      {page === "discover" && (
        <main className="max-w-[1200px] mx-auto px-5 py-14">
          <PageHeading title="Discover Wholesalers" subtitle="Find businesses, suppliers and wholesale connections." />
          <div className="grid md:grid-cols-3 gap-5 mt-7">
            {businesses.length === 0 && (
              <p className="text-xs text-gray-400 col-span-full">No businesses yet.</p>
            )}
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onChat={() => openChat({ id: business.id, name: business.name })}
                onView={() => setSelectedBusiness(business)}
              />
            ))}
          </div>
        </main>
      )}

      {page === "search" && (
        <main className="max-w-[1200px] mx-auto px-5 py-14">
          <PageHeading title="Search Wholesale" subtitle="Showing search results" />
          <FilterBar
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            stateFilter={stateFilter}
            setStateFilter={setStateFilter}
            moqFilter={moqFilter}
            setMoqFilter={setMoqFilter}
            priceSort={priceSort}
            setPriceSort={setPriceSort}
            availableCategories={availableCategories}
            availableStates={availableStates}
            moqOptions={moqOptions}
            priceOptions={priceOptions}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-7">
            {filteredProducts.length === 0 && (
              <p className="text-xs text-gray-400 col-span-full">No products match these filters.</p>
            )}
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.name + product.businessId}
                product={product}
                onDetails={() => setSelectedProduct(product)}
                onChat={() => openChat({ id: product.businessId, name: product.business })}
              />
            ))}
          </div>
        </main>
      )}

      {page === "requirements" && <RequirementPage />}

      {page === "messages" && (
        <MessagesPage currentUserId={userId} target={chatTarget} businesses={businesses} onSelectTarget={setChatTarget} />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          close={() => setSelectedProduct(null)}
          chat={() => { setSelectedProduct(null); openChat({ id: selectedProduct.businessId, name: selectedProduct.business }); }}
        />
      )}

      {selectedBusiness && (
        <BusinessModal
          business={selectedBusiness}
          close={() => setSelectedBusiness(null)}
          chat={() => { setSelectedBusiness(null); openChat({ id: selectedBusiness.id, name: selectedBusiness.name }); }}
        />
      )}
    </div>
  );
}

function Nav({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative text-[12px] font-semibold py-[24px]" style={{ color: active ? PURPLE : BLACK }}>
      {children}
      {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: PURPLE }} />}
    </button>
  );
}

function SectionTitle({ title, subtitle, action, onClick }: { title: string; subtitle: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
        <p className="text-[11px] text-gray-500 mt-1">{subtitle}</p>
      </div>
      <button onClick={onClick} className="text-[11px] font-bold" style={{ color: PURPLE }}>{action}</button>
    </div>
  );
}

function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">{title}</h1>
      <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
}

function BusinessNode({ className, icon, text }: { className: string; icon: React.ReactNode; text: string }) {
  return (
    <div className={`${className} w-[115px] bg-white border border-[#E6E6ED] rounded-xl shadow-sm p-3`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#F1F0FF", color: PURPLE }}>
        {icon}
      </div>
      <p className="text-[10px] font-bold mt-2">{text}</p>
    </div>
  );
}

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-[#E1E1E7] text-[10px] font-semibold hover:border-[#C8C5F0]"
      >
        {value}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#E5E5EA] rounded-md shadow-lg py-1 min-w-[160px] max-h-[220px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50"
                style={{ color: opt === value ? PURPLE : BLACK, fontWeight: opt === value ? 700 : 400 }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterBar({
  categoryFilter,
  setCategoryFilter,
  stateFilter,
  setStateFilter,
  moqFilter,
  setMoqFilter,
  priceSort,
  setPriceSort,
  availableCategories,
  availableStates,
  moqOptions,
  priceOptions,
}: {
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  stateFilter: string;
  setStateFilter: (v: string) => void;
  moqFilter: string;
  setMoqFilter: (v: string) => void;
  priceSort: string;
  setPriceSort: (v: string) => void;
  availableCategories: string[];
  availableStates: string[];
  moqOptions: string[];
  priceOptions: string[];
}) {
  const hasActiveFilter =
    categoryFilter !== "All Categories" || stateFilter !== "All States" || moqFilter !== "MOQ" || priceSort !== "Price";

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6">
      <FilterDropdown value={categoryFilter} options={availableCategories} onChange={setCategoryFilter} />
      <FilterDropdown value={stateFilter} options={availableStates} onChange={setStateFilter} />
      <FilterDropdown value={moqFilter} options={moqOptions} onChange={setMoqFilter} />
      <FilterDropdown value={priceSort} options={priceOptions} onChange={setPriceSort} />
      {hasActiveFilter && (
        <button
          onClick={() => {
            setCategoryFilter("All Categories");
            setStateFilter("All States");
            setMoqFilter("MOQ");
            setPriceSort("Price");
          }}
          className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <X size={12} />
          Clear filters
        </button>
      )}
    </div>
  );
}

function ProductCard({ product, onDetails, onChat }: { product: Product; onDetails: () => void; onChat: () => void }) {
  return (
    <div className="group bg-white border border-[#E6E6EB] rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200">
      <div className="relative h-[175px] bg-[#F3F3F5] overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300" />
        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-white/95 text-[9px] font-bold">{product.category}</div>
      </div>
      <div className="p-4">
        <h3 className="text-[12px] font-bold truncate">{product.name}</h3>
        <p className="text-[14px] font-black mt-1">{product.price}</p>
        <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500">
          <span>MOQ: <b className="text-gray-700">{product.moq}</b></span>
          <span className="flex items-center gap-1"><MapPin size={10} />{product.state}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#EEEEF1]">
          <p className="text-[9px] text-gray-400">Supplier</p>
          <p className="text-[10px] font-semibold mt-0.5">{product.business}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={onDetails} className="py-2 rounded-md border border-[#D9D9E1] text-[10px] font-bold hover:bg-gray-50">View Details</button>
          <button onClick={onChat} className="py-2 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 text-white" style={{ background: PURPLE }}>
            <MessageCircle size={11} />Chat
          </button>
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ business, onChat, onView }: { business: Business; onChat: () => void; onView: () => void }) {
  return (
    <div className="bg-white border border-[#E5E5EA] rounded-xl p-5 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#F1F0FF" }}>
            <Building2 size={20} color={PURPLE} />
          </div>
                      <div>
            <h3 className="text-[13px] font-bold flex items-center gap-1">
              {business.name}
              {business.verified && (
                <CheckCircle2 size={13} color="#059669" />
              )}
            </h3>
            {business.verified && (
              <p className="text-[9px] font-semibold text-green-600 mt-0.5">Verified Business</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-2 text-[10px] text-gray-500">
        <p className="flex items-center gap-2"><MapPin size={12} />{business.state}</p>
        <p className="flex items-center gap-2"><BriefcaseBusiness size={12} />{business.industry}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        <button onClick={onView} className="py-2 rounded-md border border-[#DCDCE4] text-[10px] font-bold">View Profile</button>
        <button onClick={onChat} className="py-2 rounded-md text-[10px] font-bold text-white" style={{ background: PURPLE }}>Connect</button>
      </div>
    </div>
  );
}

function RequirementPage() {
  const [posted, setPosted] = useState(false);

  if (posted) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-green-50 mx-auto flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-black mt-5">Requirement Posted</h1>
          <p className="text-sm text-gray-500 mt-2">Your requirement is now visible to relevant wholesalers.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[760px] mx-auto px-5 py-14">
      <PageHeading title="Post a Wholesale Requirement" subtitle="Tell suppliers exactly what you need." />
      <div className="mt-8 bg-white border border-[#E5E5EA] rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="What are you looking for?" placeholder="Example: Cotton T-Shirts" />
          <Input label="Quantity" placeholder="Example: 500" />
          <Input label="Target price" placeholder="Example: 150 rupees per unit" />
          <div>
            <label className="text-[11px] font-bold">State</label>
            <select className="w-full mt-2 border border-[#DCDCE4] rounded-md px-3 py-2.5 text-xs outline-none">
              <option>Select state</option>
              <option>Tamil Nadu</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>Maharashtra</option>
              <option>Gujarat</option>
              <option>Delhi</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-[11px] font-bold">Additional details</label>
          <textarea placeholder="Describe your requirement..." className="w-full h-28 mt-2 border border-[#DCDCE4] rounded-md p-3 text-xs outline-none resize-none" />
        </div>
        <button onClick={() => setPosted(true)} className="w-full mt-5 py-3 rounded-md text-white text-xs font-bold" style={{ background: PURPLE }}>
          Post Requirement
        </button>
      </div>
    </main>
  );
}

type Msg = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

function MessagesPage({
  currentUserId,
  target,
  businesses,
  onSelectTarget,
}: {
  currentUserId: string | null;
  target: ChatTarget | null;
  businesses: Business[];
  onSelectTarget: (t: ChatTarget) => void;
}) {
  const [message, setMessage] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      if (!currentUserId || !target) return;
      setLoading(true);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${target.id}),and(sender_id.eq.${target.id},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      setMsgs(data || []);
      setLoading(false);
    }

    loadMessages();
  }, [currentUserId, target]);

  async function handleSend() {
    if (!message.trim() || !currentUserId || !target) return;

    const { data } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: target.id,
        content: message,
      })
      .select()
      .single();

    if (data) {
      setMsgs((prev) => [...prev, data]);
      setMessage("");
    }
  }

  if (!currentUserId) {
    return (
      <main className="max-w-[900px] mx-auto px-5 py-12 text-center">
        <PageHeading title="Messages" subtitle="You need to log in to message businesses." />
        <a href="/login" className="inline-block mt-6 px-5 py-3 rounded-md text-white text-xs font-bold" style={{ background: PURPLE }}>
          Log in
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-[1000px] mx-auto px-5 py-12">
      <PageHeading title="Messages" subtitle="Communicate directly with businesses." />

      <div className="mt-7 grid md:grid-cols-[240px_1fr] gap-4">
        <div className="border border-[#E5E5EA] rounded-xl overflow-hidden h-fit">
          <div className="p-3 border-b bg-[#FAFAFB] text-[10px] font-bold text-gray-500 uppercase">Businesses</div>
          {businesses.filter((b) => b.id !== currentUserId).map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectTarget({ id: b.id, name: b.name })}
              className="w-full text-left px-3 py-2.5 text-xs border-b last:border-b-0 hover:bg-gray-50"
              style={{ background: target?.id === b.id ? "#F1F0FF" : "white" }}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div className="border border-[#E5E5EA] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F1F0FF] flex items-center justify-center">
              <Building2 size={19} color={PURPLE} />
            </div>
            <p className="text-xs font-bold">{target?.name || "Select a business to message"}</p>
          </div>

          <div className="h-[400px] bg-[#FAFAFB] p-5 overflow-y-auto">
            {!target && <p className="text-xs text-gray-400">Pick a business on the left to start chatting.</p>}
            {target && loading && <p className="text-xs text-gray-400">Loading...</p>}
            {target && !loading && msgs.length === 0 && (
              <p className="text-xs text-gray-400">No messages yet. Say hello!</p>
            )}
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`mt-3 p-3 rounded-xl text-[11px] max-w-[350px] ${m.sender_id === currentUserId ? "ml-auto text-white" : "bg-white border border-[#E5E5EA]"}`}
                style={m.sender_id === currentUserId ? { background: PURPLE } : {}}
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder={target ? "Write a message..." : "Select a business first"}
              disabled={!target}
              className="flex-1 border border-[#DCDCE4] rounded-md px-3 py-2.5 text-xs outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!target}
              className="w-10 rounded-md flex items-center justify-center text-white disabled:opacity-50"
              style={{ background: PURPLE }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductModal({ product, close, chat }: { product: Product; close: () => void; chat: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl max-w-[720px] w-full overflow-hidden shadow-2xl relative">
        <button onClick={close} className="absolute right-4 top-4 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center">
          <X size={15} />
        </button>
        <div className="grid md:grid-cols-2">
          <img src={product.image} alt={product.name} className="w-full h-[300px] md:h-full object-cover" />
          <div className="p-7">
            <span className="text-[10px] font-bold text-purple-600">{product.category}</span>
            <h2 className="text-xl font-black mt-2">{product.name}</h2>
            <p className="text-xl font-black mt-4">{product.price}</p>
            <div className="mt-6 space-y-3 text-xs text-gray-500">
              <p><b className="text-gray-800">MOQ:</b> {product.moq} units</p>
              <p className="flex items-center gap-2"><MapPin size={13} />{product.state}</p>
              <p><b className="text-gray-800">Supplier:</b> {product.business}</p>
            </div>
            <button onClick={chat} className="w-full mt-8 py-3 rounded-md text-white text-xs font-bold" style={{ background: PURPLE }}>
              <MessageCircle size={14} className="inline mr-2" />
              Chat With Seller
            </button>
           <ReportButton targetType="product" targetId={product.name} targetName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessModal({ business, close, chat }: { business: Business; close: () => void; chat: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl max-w-[600px] w-full p-7 relative">
        <button onClick={close} className="absolute right-4 top-4"><X size={17} /></button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#F1F0FF] flex items-center justify-center">
            <Building2 size={25} color={PURPLE} />
          </div>
          <div>
            <h2 className="text-xl font-black">{business.name}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-7">
          <InfoBox title="Location" value={business.state} />
          <InfoBox title="Industry" value={business.industry} />
        </div>
        <button onClick={chat} className="w-full mt-6 py-3 rounded-md text-white text-xs font-bold" style={{ background: PURPLE }}>
          <MessageCircle size={14} className="inline mr-2" />
          Connect With Business
        </button>
            <ReportButton targetType="business" targetId={business.id} targetName={business.name} />
      </div>
    </div>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#F8F8FA] rounded-lg p-4">
      <p className="text-[9px] text-gray-400">{title}</p>
      <p className="text-xs font-bold mt-1">{value}</p>
    </div>
  );
}

function Input({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block mt-4">
      <span className="text-[10px] font-bold">{label}</span>
      <input type={type} placeholder={placeholder} className="w-full mt-2 border border-[#DCDCE4] rounded-md px-3 py-2.5 text-xs outline-none focus:border-[#8D87DE]" />
    </label>
  );
}
function ReportButton({
  targetType,
  targetId,
  targetName,
}: {
  targetType: string;
  targetId: string;
  targetName: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submitReport() {
    if (!reason.trim()) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("reports").insert({
      reporter_id: user?.id ?? null,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      reason,
    });

    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="mt-3 text-[11px] text-center text-gray-500">
        Thanks — this has been reported for review.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-3 py-2 rounded-md border border-[#EBB] text-[11px] font-semibold text-red-600 hover:bg-red-50"
      >
        Report this {targetType}
      </button>
    );
  }

  return (
    <div className="mt-3 border border-[#EBB] rounded-md p-3">
      <p className="text-[11px] font-semibold text-red-600 mb-2">
        Why are you reporting this {targetType}?
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="Describe the issue..."
        className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none resize-none"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={submitReport}
          disabled={sending || !reason.trim()}
          className="flex-1 py-2 rounded-md bg-red-600 text-white text-[11px] font-semibold disabled:opacity-50"
        >
          {sending ? "Submitting..." : "Submit report"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-2 rounded-md border border-gray-300 text-[11px] font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}