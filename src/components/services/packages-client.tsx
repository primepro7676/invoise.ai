"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Layers,
  FolderPlus,
  PackagePlus,
  Sparkles,
  X,
  Boxes,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatINR } from "@/lib/calculations";
import type { CategoryDTO, PackageBundleDTO, BundleItemDTO } from "@/lib/types";

interface PackagesClientProps {
  categories: CategoryDTO[];
  initialBundles: PackageBundleDTO[];
}

export function PackagesClient({ categories, initialBundles }: PackagesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bundles" | "individual">("bundles");
  const [search, setSearch] = useState("");

  // Modals
  const [editingBundle, setEditingBundle] = useState<PackageBundleDTO | null | "new">(null);
  const [editingPackage, setEditingPackage] = useState<{
    categoryId: string;
    pkg: { id: string; name: string; price: number; description: string; isCustom: boolean } | null;
  } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const filteredBundles = useMemo(() => {
    if (!search.trim()) return initialBundles;
    const q = search.toLowerCase();
    return initialBundles.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q) ||
        b.tier.toLowerCase().includes(q) ||
        b.items.some(
          (i) =>
            i.categoryName.toLowerCase().includes(q) ||
            i.packageName.toLowerCase().includes(q)
        )
    );
  }, [initialBundles, search]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map((cat) => {
        const matchesCat = cat.name.toLowerCase().includes(q);
        const matchingPkgs = cat.packages.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
        if (matchesCat) return cat;
        if (matchingPkgs.length > 0) return { ...cat, packages: matchingPkgs };
        return null;
      })
      .filter(Boolean) as CategoryDTO[];
  }, [categories, search]);

  async function handleDeleteBundle(id: string) {
    if (!confirm("Are you sure you want to delete this package bundle?")) return;
    try {
      await fetch(`/api/package-bundles/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Failed to delete package bundle.");
    }
  }

  async function handleDeletePackage(id: string) {
    if (!confirm("Are you sure you want to delete this package? Existing invoices are unaffected."))
      return;
    try {
      await fetch(`/api/packages/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Failed to delete package.");
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Tab Switcher & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full sm:w-auto rounded-xl bg-white p-1 border border-[#e1ece3] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("bundles")}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "bundles"
                ? "bg-[#0c2e1b] text-[#f0c34e] shadow-sm"
                : "text-[#526b5c] hover:text-[#0c2317] hover:bg-[#f4f7f4]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Main Packages
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-black ${
                activeTab === "bundles"
                  ? "bg-[#133b24] text-[#f0c34e]"
                  : "bg-[#f4f7f4] text-[#526b5c]"
              }`}
            >
              {initialBundles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("individual")}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "individual"
                ? "bg-[#0c2e1b] text-[#f0c34e] shadow-sm"
                : "text-[#526b5c] hover:text-[#0c2317] hover:bg-[#f4f7f4]"
            }`}
          >
            <Boxes className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> All Items & Rates
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-black ${
                activeTab === "individual"
                  ? "bg-[#133b24] text-[#f0c34e]"
                  : "bg-[#f4f7f4] text-[#526b5c]"
              }`}
            >
              {categories.reduce((acc, c) => acc + c.packages.length, 0)}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "bundles" ? (
            <Button
              onClick={() => setEditingBundle("new")}
              className="w-full sm:w-auto gap-1.5 font-bold shadow-sm justify-center"
            >
              <Sparkles className="h-4 w-4" /> Create Main Package
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowCategoryModal(true)}
                className="flex-1 sm:flex-initial gap-1.5 justify-center font-bold"
              >
                <FolderPlus className="h-4 w-4" /> Add Category
              </Button>
              <Button
                onClick={() =>
                  setEditingPackage({
                    categoryId: categories[0]?.id || "",
                    pkg: null,
                  })
                }
                className="flex-1 sm:flex-initial gap-1.5 font-bold shadow-sm justify-center"
              >
                <PackagePlus className="h-4 w-4" /> Add Item & Price
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#8aa393]" />
        <Input
          placeholder={
            activeTab === "bundles"
              ? "Search package bundles by name, tier, service..."
              : "Search services and items..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 text-xs sm:text-sm bg-white"
        />
      </div>

      {/* TAB 1: MAIN PACKAGE BUNDLES */}
      {activeTab === "bundles" && (
        <div className="space-y-6">
          {filteredBundles.length === 0 ? (
            <Card className="py-12 text-center border-dashed border-[#cdddd2] bg-white rounded-2xl shadow-sm">
              <Sparkles className="mx-auto h-12 w-12 text-[#0c2e1b] opacity-40" />
              <h3 className="mt-3 text-base font-black text-[#0c2317]">
                No Package Bundles Created Yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm font-medium text-[#526b5c]">
                Create main packages (e.g. <em>Premium NGO Digital Presence Package</em>) with multiple included services, custom prices, discounts, and deliverables for 1-click invoice generation.
              </p>
              <div className="mt-5">
                <Button onClick={() => setEditingBundle("new")} className="gap-1.5 font-bold shadow-sm">
                  <Plus className="h-4 w-4" /> Create First Package Bundle
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredBundles.map((bundle) => {
                const tierStyles: Record<string, string> = {
                  Standard: "bg-blue-50 text-blue-800 border-blue-200",
                  Professional: "bg-purple-50 text-purple-800 border-purple-200",
                  Premium: "bg-amber-50 text-amber-900 border-amber-200",
                  Custom: "bg-emerald-50 text-emerald-900 border-emerald-200",
                };
                const badgeClass =
                  tierStyles[bundle.tier] || "bg-amber-50 text-amber-900 border-amber-200";

                return (
                  <Card
                    key={bundle.id}
                    className="flex flex-col justify-between overflow-hidden border border-[#e1ece3] bg-white shadow-sm rounded-2xl p-6 transition-all hover:border-[#133b24]/40 hover:shadow-md"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-[#e1ece3] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeClass}`}
                            >
                              {bundle.tier} Tier
                            </span>
                          </div>
                          <h3 className="mt-2 text-lg sm:text-xl font-black text-[#0c2317] leading-tight">
                            {bundle.name}
                          </h3>
                          {bundle.subtitle && (
                            <p className="mt-1 text-xs font-bold text-[#0c2e1b]">
                              {bundle.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingBundle(bundle)}
                            className="rounded-lg p-1.5 text-[#526b5c] hover:bg-[#f4f7f4] hover:text-[#0c2317] transition"
                            title="Edit package bundle"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBundle(bundle.id)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                            title="Delete package bundle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Included Services Table */}
                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-[#0c2e1b]">
                          Included Services & Standard Prices ({bundle.items.length})
                        </p>
                        <div className="overflow-hidden rounded-xl border border-[#e1ece3] bg-[#f4f7f4]">
                          <table className="w-full text-xs">
                            <thead className="border-b border-[#e1ece3] bg-[#eef4ee] text-left font-bold text-[#526b5c]">
                              <tr>
                                <th className="px-3 py-2.5 font-bold">Service Item</th>
                                <th className="px-3 py-2.5 text-right font-bold">Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e1ece3] bg-white">
                              {bundle.items.map((item, idx) => (
                                <tr key={idx} className="transition-colors hover:bg-[#f4f7f4]">
                                  <td className="px-3 py-2.5 text-[#0c2317] font-semibold">
                                    {item.packageName || item.categoryName}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-black text-[#0c2e1b]">
                                    {item.isCustomPrice ? "Custom" : formatINR(item.rate)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Deliverables / Platforms preview */}
                      {(bundle.platformsIncluded || bundle.deliverables) && (
                        <div className="mt-3.5 space-y-1 text-xs text-[#526b5c]">
                          {bundle.platformsIncluded && (
                            <p className="line-clamp-1">
                              <strong className="text-[#0c2317]">Platforms:</strong> {bundle.platformsIncluded.replace(/\n/g, ", ")}
                            </p>
                          )}
                          {bundle.paymentTerms && (
                            <p className="line-clamp-1">
                              <strong className="text-[#0c2317]">Terms:</strong> {bundle.paymentTerms.split("\n")[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pricing Summary Box */}
                    <div className="mt-5 rounded-xl border border-[#e1ece3] bg-[#f4f7f4] p-3.5">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aa393]">Total Value</span>
                          <p className="font-bold text-[#0c2317] mt-0.5 text-xs sm:text-sm">
                            {formatINR(bundle.totalPrice)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Special Discount</span>
                          <p className="font-bold text-emerald-700 mt-0.5 text-xs sm:text-sm">
                            - {formatINR(bundle.discountPrice)}
                          </p>
                        </div>
                        <div className="bg-[#0c2e1b] rounded-lg py-1 px-1.5 shadow-sm text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#e5ba55]">Final Price</span>
                          <p className="text-xs sm:text-sm font-black text-[#f0c34e] mt-0.5">
                            {formatINR(bundle.finalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INDIVIDUAL SERVICES & PACKAGES */}
      {activeTab === "individual" && (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden border border-[#e1ece3] bg-white shadow-sm rounded-2xl p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#e1ece3] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c2e1b]/10 border border-[#0c2e1b]/20 text-[#0c2e1b]">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#0c2317]">{cat.name}</h2>
                    <span className="text-xs font-semibold text-[#526b5c]">
                      {cat.packages.length} item{cat.packages.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingPackage({ categoryId: cat.id, pkg: null });
                  }}
                  className="gap-1 font-bold text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item to {cat.name}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cat.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-[#e1ece3] bg-[#f4f7f4] p-4 transition-all hover:border-[#133b24]/40 hover:bg-white hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-[#0c2317] leading-snug">{pkg.name}</h4>
                        <div className="flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => setEditingPackage({ categoryId: cat.id, pkg })}
                            className="rounded p-1 text-[#526b5c] hover:bg-white hover:text-[#0c2317] transition"
                            title="Edit package"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="rounded p-1 text-rose-500 hover:bg-rose-50 transition"
                            title="Delete package"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {pkg.description ? (
                        <p className="mt-1.5 text-xs text-[#526b5c] line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs italic text-[#8aa393]">No description</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#e1ece3] pt-2.5">
                      <span className="text-xs font-bold text-[#526b5c]">Standard Rate</span>
                      <span className="text-sm font-black text-[#0c2e1b]">
                        {pkg.isCustom ? "Custom Price" : formatINR(pkg.price)}
                      </span>
                    </div>
                  </div>
                ))}

                {cat.packages.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-[#cdddd2] bg-[#f4f7f4] p-6 text-center text-xs font-semibold text-[#526b5c]">
                    No items in <strong>{cat.name}</strong> yet.
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: CREATE / EDIT MAIN PACKAGE BUNDLE */}
      {editingBundle && (
        <MainPackageBundleModal
          bundle={editingBundle === "new" ? null : editingBundle}
          categories={categories}
          onClose={() => setEditingBundle(null)}
          onSaved={() => {
            setEditingBundle(null);
            router.refresh();
          }}
        />
      )}

      {/* MODAL: ADD / EDIT INDIVIDUAL PACKAGE */}
      {editingPackage && (
        <PackageModal
          categories={categories}
          initialCategoryId={editingPackage.categoryId || categories[0]?.id || ""}
          initialPackage={editingPackage.pkg}
          onClose={() => setEditingPackage(null)}
          onSaved={() => {
            setEditingPackage(null);
            router.refresh();
          }}
        />
      )}

      {/* MODAL: ADD SERVICE CATEGORY */}
      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSaved={() => {
            setShowCategoryModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function MainPackageBundleModal({
  bundle,
  categories,
  onClose,
  onSaved,
}: {
  bundle: PackageBundleDTO | null;
  categories: CategoryDTO[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(bundle?.name || "");
  const [subtitle, setSubtitle] = useState(bundle?.subtitle || "");
  const [tier, setTier] = useState(bundle?.tier || "Premium");
  const [items, setItems] = useState<BundleItemDTO[]>(
    bundle?.items || [
      {
        categoryName: categories[0]?.name || "Web Development",
        packageName: "Premium NGO Website Development",
        quantity: 1,
        rate: 25000,
        isCustomPrice: false,
      },
    ]
  );
  const [discountPrice, setDiscountPrice] = useState(
    bundle ? String(bundle.discountPrice) : "25000"
  );
  const [platformsIncluded, setPlatformsIncluded] = useState(
    bundle?.platformsIncluded || "• Facebook\n• Instagram\n• YouTube"
  );
  const [deliverables, setDeliverables] = useState(
    bundle?.deliverables ||
      "• Premium NGO website\n• Professional social media setup\n• Google My Business setup\n• WhatsApp integration\n• AI chatbot integration\n• Mobile-responsive website\n• Contact & enquiry forms\n• Basic SEO setup\n• Google Maps integration\n• AI-powered visitor assistance"
  );
  const [paymentTerms, setPaymentTerms] = useState(
    bundle?.paymentTerms ||
      "100% Advance Payment: ₹20,000\nProject development and setup work will commence after receipt of the full advance payment."
  );
  const [specialNote, setSpecialNote] = useState(
    bundle?.specialNote || "Special Offer: ₹20,000 only. Third-party charges, if applicable, are separate."
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 1) * (Number(item.rate) || 0), 0);
  }, [items]);

  const numDiscount = Number(discountPrice) || 0;
  const finalPrice = Math.max(0, totalPrice - numDiscount);

  function handleAddItem() {
    setItems([
      ...items,
      {
        categoryName: categories[0]?.name || "Service",
        packageName: "",
        quantity: 1,
        rate: 0,
        isCustomPrice: false,
      },
    ]);
  }

  function handleRemoveItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function handleItemCategoryChange(index: number, catName: string) {
    const next = [...items];
    next[index].categoryName = catName;
    const cat = categories.find((c) => c.name === catName);
    if (cat && cat.packages[0]) {
      next[index].packageName = cat.packages[0].name;
      next[index].rate = cat.packages[0].isCustom ? 0 : cat.packages[0].price;
      next[index].isCustomPrice = cat.packages[0].isCustom;
    }
    setItems(next);
  }

  function handleItemNameChange(index: number, nameVal: string) {
    const next = [...items];
    next[index].packageName = nameVal;
    const cat = categories.find((c) => c.name === next[index].categoryName);
    const pkg = cat?.packages.find((p) => p.name === nameVal);
    if (pkg) {
      next[index].rate = pkg.isCustom ? 0 : pkg.price;
      next[index].isCustomPrice = pkg.isCustom;
    }
    setItems(next);
  }

  function handleItemRateChange(index: number, rate: number) {
    const next = [...items];
    next[index].rate = rate;
    setItems(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Main package name is required.");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.packageName?.trim())) {
      setError("Please ensure all included services have a name.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      tier,
      items,
      totalPrice,
      discountPrice: numDiscount,
      finalPrice,
      platformsIncluded: platformsIncluded.trim(),
      deliverables: deliverables.trim(),
      paymentTerms: paymentTerms.trim(),
      specialNote: specialNote.trim(),
    };

    try {
      const url = bundle ? `/api/package-bundles/${bundle.id}` : "/api/package-bundles";
      const method = bundle ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error?.formErrors?.join(", ") || err.error?.message || "Failed to save package bundle.");
        setSubmitting(false);
        return;
      }

      onSaved();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-[#e1ece3] bg-white text-[#0c2317] shadow-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1ece3] bg-[#f4f7f4] px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c2e1b]/10 border border-[#0c2e1b]/20 text-[#0c2e1b]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0c2317] leading-tight">
                {bundle ? "Edit Main Package Bundle" : "Create Main Package Bundle"}
              </h3>
              <p className="text-xs font-medium text-[#526b5c]">
                Configure included services, tier, and automated pricing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#526b5c] hover:bg-[#eef4ee] hover:text-[#0c2317] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              {error}
            </div>
          )}

          <form id="bundle-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Main Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Main Package Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium NGO Digital Presence Package"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Subtitle / Tagline (Optional)</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Complete Digital Setup & Automation"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Tier Selection Buttons */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c] mb-1.5 block">Package Tier / Level</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Standard", "Professional", "Premium", "Custom"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      tier === t
                        ? "border-[#0c2e1b] bg-[#0c2e1b] text-[#f0c34e] shadow-xs"
                        : "border-[#d2ded5] bg-white text-[#526b5c] hover:bg-[#f4f7f4] hover:text-[#0c2317]"
                    }`}
                  >
                    {t} Tier
                  </button>
                ))}
              </div>
            </div>

            {/* Included Items Section */}
            <div className="rounded-xl border border-[#e1ece3] bg-[#f9fbf9] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0c2e1b]">
                    Included Services & Standard Prices
                  </h4>
                  <p className="text-[11px] text-[#526b5c]">
                    Add services that make up this package bundle.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddItem}
                  className="gap-1 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Service
                </Button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, index) => {
                  const cat = categories.find((c) => c.name === item.categoryName);
                  const availablePkgs = cat?.packages || [];

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-[#e1ece3] bg-white p-3 sm:grid-cols-12 sm:items-center"
                    >
                      <div className="sm:col-span-4">
                        <Label className="text-[10px] uppercase font-bold text-[#8aa393]">Category</Label>
                        <Select
                          value={item.categoryName}
                          onChange={(e) => handleItemCategoryChange(index, e.target.value)}
                          className="mt-1 h-9 text-xs"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="sm:col-span-4">
                        <Label className="text-[10px] uppercase font-bold text-[#8aa393]">Service / Package Name</Label>
                        {availablePkgs.length > 0 ? (
                          <Select
                            value={item.packageName}
                            onChange={(e) => handleItemNameChange(index, e.target.value)}
                            className="mt-1 h-9 text-xs"
                          >
                            <option value="">— Select item —</option>
                            {availablePkgs.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name} ({p.isCustom ? "Custom" : formatINR(p.price)})
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            value={item.packageName}
                            onChange={(e) => handleItemNameChange(index, e.target.value)}
                            placeholder="Service name"
                            className="mt-1 h-9 text-xs"
                          />
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <Label className="text-[10px] uppercase font-bold text-[#8aa393]">Rate (₹)</Label>
                        <Input
                          type="number"
                          value={item.rate || 0}
                          onChange={(e) => handleItemRateChange(index, Number(e.target.value))}
                          className="mt-1 h-9 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex sm:justify-center pt-2 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Total Standard Value (₹)</Label>
                <Input
                  value={formatINR(totalPrice)}
                  disabled
                  className="mt-1.5 bg-[#f4f7f4] font-bold text-[#0c2317]"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Special Discount (₹)</Label>
                <Input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="25000"
                  className="mt-1.5 font-bold text-emerald-700"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Final Package Price (₹)</Label>
                <Input
                  value={formatINR(finalPrice)}
                  disabled
                  className="mt-1.5 bg-[#eaf2ec] font-black text-[#0c2e1b] border-[#c5dccb]"
                />
              </div>
            </div>

            {/* Scope Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Platforms Included (One per line)</Label>
                <Textarea
                  rows={3}
                  value={platformsIncluded}
                  onChange={(e) => setPlatformsIncluded(e.target.value)}
                  className="mt-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Custom Payment Terms</Label>
                <Textarea
                  rows={3}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="mt-1.5 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Deliverables Checklist (One per line)</Label>
              <Textarea
                rows={4}
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                className="mt-1.5 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Special Offer Note / Disclaimer</Label>
              <Input
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e1ece3] bg-[#f4f7f4] px-4 py-3 sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="bundle-form" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {bundle ? "Save Bundle Changes" : "Create Package Bundle"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PackageModal({
  categories,
  initialCategoryId,
  initialPackage,
  onClose,
  onSaved,
}: {
  categories: CategoryDTO[];
  initialCategoryId: string;
  initialPackage: { id: string; name: string; price: number; description: string; isCustom: boolean } | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [name, setName] = useState(initialPackage?.name || "");
  const [price, setPrice] = useState(initialPackage ? String(initialPackage.price) : "");
  const [description, setDescription] = useState(initialPackage?.description || "");
  const [isCustom, setIsCustom] = useState(initialPackage?.isCustom || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const payload = {
      categoryId,
      name: name.trim(),
      price: isCustom ? 0 : Number(price) || 0,
      description: description.trim(),
      isCustom,
    };

    try {
      const url = initialPackage ? `/api/packages/${initialPackage.id}` : "/api/packages";
      const method = initialPackage ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error?.formErrors?.join(", ") || "Failed to save package.");
        setSubmitting(false);
        return;
      }

      onSaved();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#e1ece3] bg-white p-6 text-[#0c2317] shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#e1ece3] pb-3">
          <h3 className="text-base font-black text-[#0c2317]">
            {initialPackage ? "Edit Service Item" : "Add Service Item"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[#526b5c] hover:bg-[#f4f7f4]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Category</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Item / Service Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Setup" required className="mt-1" />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCustom"
              checked={isCustom}
              onChange={(e) => setIsCustom(e.target.checked)}
              className="h-4 w-4 rounded text-[#0c2e1b] focus:ring-[#0c2e1b]"
            />
            <label htmlFor="isCustom" className="text-xs font-bold text-[#0c2317]">
              Custom / Variable Price (entered during invoicing)
            </label>
          </div>

          {!isCustom && (
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Standard Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                required
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Description (Optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief line description" className="mt-1" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialPackage ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (!res.ok) {
        setError("Failed to create category. It might already exist.");
        setSubmitting(false);
        return;
      }

      onSaved();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#e1ece3] bg-white p-6 text-[#0c2317] shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#e1ece3] pb-3">
          <h3 className="text-base font-black text-[#0c2317]">Add Service Category</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[#526b5c] hover:bg-[#f4f7f4]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Category Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI Automation" required className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Description (Optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category scope description" className="mt-1" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
