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
  CheckCircle2,
  X,
  Boxes,
  Tag,
  ChevronRight,
  IndianRupee,
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
        <div className="flex w-full sm:w-auto rounded-xl bg-brand-50/70 p-1 border border-brand-100">
          <button
            type="button"
            onClick={() => setActiveTab("bundles")}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === "bundles"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-navy-700 hover:text-navy-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Main Packages
            <span
              className={`ml-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs ${
                activeTab === "bundles"
                  ? "bg-brand-700 text-white"
                  : "bg-brand-100 text-brand-800"
              }`}
            >
              {initialBundles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("individual")}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === "individual"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-navy-700 hover:text-navy-900"
            }`}
          >
            <Boxes className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> All Items & Rates
            <span
              className={`ml-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs ${
                activeTab === "individual"
                  ? "bg-brand-700 text-white"
                  : "bg-brand-100 text-brand-800"
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
              className="w-full sm:w-auto gap-1.5 shadow-sm justify-center"
            >
              <Sparkles className="h-4 w-4" /> Create Main Package
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowCategoryModal(true)}
                className="flex-1 sm:flex-initial gap-1.5 justify-center"
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
                className="flex-1 sm:flex-initial gap-1.5 shadow-sm justify-center"
              >
                <PackagePlus className="h-4 w-4" /> Add Item & Price
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-navy-400" />
        <Input
          placeholder={
            activeTab === "bundles"
              ? "Search package bundles, tiers, or included services..."
              : "Search services or packages..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* =========================================================
          TAB 1: MAIN PACKAGE BUNDLES
      ========================================================= */}
      {activeTab === "bundles" && (
        <div className="space-y-6">
          {filteredBundles.length === 0 ? (
            <Card className="py-12 text-center border-dashed border-brand-200">
              <Sparkles className="mx-auto h-12 w-12 text-brand-400" />
              <h3 className="mt-3 text-base font-semibold text-navy-900">
                No Package Bundles Created Yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-navy-600/70">
                Create main packages (e.g. *Premium NGO Digital Presence Package*) with multiple included services, custom prices, discounts, and deliverables for 1-click invoice generation.
              </p>
              <div className="mt-5">
                <Button onClick={() => setEditingBundle("new")} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create First Package Bundle
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredBundles.map((bundle) => {
                const tierStyles: Record<string, string> = {
                  Standard: "bg-blue-100 text-blue-800 border-blue-200",
                  Professional: "bg-purple-100 text-purple-800 border-purple-200",
                  Premium: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  Custom: "bg-amber-100 text-amber-800 border-amber-200",
                };
                const badgeClass =
                  tierStyles[bundle.tier] || "bg-brand-100 text-brand-800 border-brand-200";

                return (
                  <Card
                    key={bundle.id}
                    className="flex flex-col justify-between overflow-hidden border border-brand-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-brand-100 pb-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badgeClass}`}
                            >
                              {bundle.tier} Tier
                            </span>
                          </div>
                          <h3 className="mt-1.5 text-base sm:text-lg font-bold text-navy-900 leading-tight">
                            {bundle.name}
                          </h3>
                          {bundle.subtitle && (
                            <p className="mt-0.5 text-xs font-medium text-brand-700">
                              {bundle.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingBundle(bundle)}
                            className="rounded-lg p-1.5 text-navy-600 hover:bg-brand-50 hover:text-navy-900 transition"
                            title="Edit package bundle"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBundle(bundle.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete package bundle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Included Services Table */}
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy-600/70">
                          Included Services & Standard Prices ({bundle.items.length})
                        </p>
                        <div className="overflow-hidden rounded-lg border border-brand-100 bg-brand-50/20">
                          <table className="w-full text-xs">
                            <thead className="border-b border-brand-100 bg-brand-50/50 text-left font-semibold text-navy-700">
                              <tr>
                                <th className="px-3 py-2">Service Item</th>
                                <th className="px-3 py-2 text-right">Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-100/60">
                              {bundle.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-brand-50/30">
                                  <td className="px-3 py-2 text-navy-900 font-medium">
                                    {item.packageName || item.categoryName}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold text-navy-800">
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
                        <div className="mt-3.5 space-y-1 text-xs text-navy-600/80">
                          {bundle.platformsIncluded && (
                            <p className="line-clamp-1">
                              <strong>Platforms:</strong> {bundle.platformsIncluded.replace(/\n/g, ", ")}
                            </p>
                          )}
                          {bundle.paymentTerms && (
                            <p className="line-clamp-1">
                              <strong>Terms:</strong> {bundle.paymentTerms.split("\n")[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pricing Summary Box */}
                    <div className="mt-5 rounded-xl border border-brand-200/80 bg-brand-50/40 p-3.5">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <span className="text-navy-600/70">Total Value:</span>
                          <p className="font-semibold text-navy-900 mt-0.5 text-xs sm:text-sm">
                            {formatINR(bundle.totalPrice)}
                          </p>
                        </div>
                        <div>
                          <span className="text-emerald-700 font-medium">Special Discount:</span>
                          <p className="font-semibold text-emerald-700 mt-0.5 text-xs sm:text-sm">
                            - {formatINR(bundle.discountPrice)}
                          </p>
                        </div>
                        <div>
                          <span className="text-brand-800 font-bold">Final Price:</span>
                          <p className="text-xs sm:text-base font-extrabold text-brand-700 mt-0.5">
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

      {/* =========================================================
          TAB 2: INDIVIDUAL SERVICES & PACKAGES
      ========================================================= */}
      {activeTab === "individual" && (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden border border-brand-100 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-brand-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-navy-900">{cat.name}</h2>
                    <span className="text-xs text-navy-600/60">
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
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item to {cat.name}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cat.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-brand-100/80 bg-brand-50/20 p-4 transition hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-navy-900 leading-snug">{pkg.name}</h4>
                        <div className="flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => setEditingPackage({ categoryId: cat.id, pkg })}
                            className="rounded p-1 text-navy-600 hover:bg-white hover:text-navy-900 transition"
                            title="Edit package"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete package"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {pkg.description ? (
                        <p className="mt-1.5 text-xs text-navy-600/70 line-clamp-2">
                          {pkg.description}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs italic text-navy-600/40">No description</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-brand-100/60 pt-2.5">
                      <span className="text-xs font-medium text-navy-600/60">Standard Rate</span>
                      <span
                        className={`text-sm font-bold ${
                          pkg.isCustom ? "text-amber-700" : "text-brand-700"
                        }`}
                      >
                        {pkg.isCustom ? "Custom Price" : formatINR(pkg.price)}
                      </span>
                    </div>
                  </div>
                ))}

                {cat.packages.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed border-brand-200 p-6 text-center text-sm text-navy-600/60">
                    No items in <strong>{cat.name}</strong> yet.
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* =========================================================
          MODAL: CREATE / EDIT MAIN PACKAGE BUNDLE
      ========================================================= */}
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

      {/* =========================================================
          MODAL: ADD / EDIT INDIVIDUAL PACKAGE
      ========================================================= */}
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

      {/* =========================================================
          MODAL: ADD SERVICE CATEGORY
      ========================================================= */}
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

// =========================================================================
// Main Package Bundle Modal (Fully Responsive & Scrollable)
// =========================================================================
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

  // Calculations
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

  function handleItemPackageChange(index: number, pkgName: string) {
    const next = [...items];
    next[index].packageName = pkgName;
    const cat = categories.find((c) => c.name === next[index].categoryName);
    const pkg = cat?.packages.find((p) => p.name === pkgName);
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

  function handleItemNameChange(index: number, nameVal: string) {
    const next = [...items];
    next[index].packageName = nameVal;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-100 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-navy-900 leading-tight">
                {bundle ? "Edit Main Package Bundle" : "Create Main Package Bundle"}
              </h3>
              <p className="text-xs text-navy-600/70">
                Configure included services, tier, and automated pricing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-400 hover:bg-gray-100 hover:text-navy-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <form id="bundle-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Main Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Main Package Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium NGO Digital Presence Package"
                  required
                />
              </div>
              <div>
                <Label>Subtitle / Tagline (Optional)</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Complete Digital Setup & Automation"
                />
              </div>
            </div>

            {/* Tier Selection Buttons */}
            <div>
              <Label className="mb-1.5 block">Package Tier / Level</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["Standard", "Professional", "Premium", "Custom"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs sm:text-sm font-semibold transition ${
                      tier === t
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                        : "border-gray-200 bg-white text-navy-700 hover:bg-brand-50"
                    }`}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Included Services Builder */}
            <div className="rounded-xl border border-brand-200 bg-brand-50/20 p-3 sm:p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy-900">Included Services & Rates</h4>
                  <p className="text-xs text-navy-600/70">
                    Add the individual services included in this package and set their standard price.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddItem}
                  className="w-full sm:w-auto justify-center"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Service Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 gap-2.5 rounded-xl border border-brand-100 bg-white p-3 shadow-xs sm:grid-cols-12 sm:items-center"
                  >
                    <div className="sm:col-span-4">
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={item.categoryName}
                        onChange={(e) => handleItemCategoryChange(idx, e.target.value)}
                        className="text-xs mt-1"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                        {!categories.some((c) => c.name === item.categoryName) && (
                          <option value={item.categoryName}>{item.categoryName}</option>
                        )}
                      </Select>
                    </div>

                    <div className="sm:col-span-5">
                      <Label className="text-xs">Service / Item Name</Label>
                      <Input
                        value={item.packageName}
                        onChange={(e) => handleItemNameChange(idx, e.target.value)}
                        placeholder="e.g. Website Development"
                        className="text-xs mt-1"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleItemRateChange(idx, Number(e.target.value))}
                        className="text-xs mt-1 font-semibold"
                      />
                    </div>

                    <div className="flex items-center justify-end sm:col-span-1 sm:pt-4">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown Summary */}
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-white/80 p-2.5 border border-emerald-100">
                    <span className="text-xs text-navy-600/70 font-medium">Total Standard Value:</span>
                    <p className="text-base sm:text-lg font-bold text-navy-900 mt-0.5">
                      {formatINR(totalPrice)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/80 p-2.5 border border-emerald-100">
                    <Label className="text-xs text-emerald-800 font-semibold">Special Discount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="e.g. 25000"
                      className="mt-1 font-semibold text-emerald-700 bg-white"
                    />
                  </div>

                  <div className="rounded-lg bg-white/80 p-2.5 border border-emerald-100">
                    <span className="text-xs text-brand-800 font-bold">Final Package Price:</span>
                    <p className="text-lg sm:text-xl font-extrabold text-brand-700 mt-0.5">
                      {formatINR(finalPrice)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platforms, Deliverables, Payment Terms */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Social Media Platforms Included</Label>
                <Textarea
                  rows={3}
                  value={platformsIncluded}
                  onChange={(e) => setPlatformsIncluded(e.target.value)}
                  placeholder="• Facebook&#10;• Instagram&#10;• YouTube"
                  className="text-xs sm:text-sm mt-1"
                />
              </div>

              <div>
                <Label>Payment Terms</Label>
                <Textarea
                  rows={3}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="100% Advance Payment: ₹20,000&#10;Project begins after receipt of advance."
                  className="text-xs sm:text-sm mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Package Includes / Deliverables Checklist</Label>
              <Textarea
                rows={4}
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder="• Premium NGO website&#10;• Professional social media setup&#10;• Google My Business setup&#10;• WhatsApp integration&#10;• AI chatbot integration"
                className="text-xs sm:text-sm mt-1"
              />
            </div>

            <div>
              <Label>Special Offer Note / Disclaimer</Label>
              <Input
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="e.g. Special Offer: ₹20,000 only. Third-party charges are separate."
                className="text-xs sm:text-sm mt-1"
              />
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-brand-100 bg-gray-50/80 px-4 py-3 sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="bundle-form" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {bundle ? "Save Changes" : "Create Master Package"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Package Modal (Create & Edit Single Package)
// =========================================================================
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
  const [categoryId, setCategoryId] = useState(initialCategoryId || categories[0]?.id || "");
  const [name, setName] = useState(initialPackage?.name || "");
  const [price, setPrice] = useState(initialPackage?.price ? String(initialPackage.price) : "");
  const [description, setDescription] = useState(initialPackage?.description || "");
  const [isCustom, setIsCustom] = useState(initialPackage?.isCustom || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Package item name is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a service category.");
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
        setError(err.error?.message || "Failed to save package.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-brand-100 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-brand-600" />
            <h3 className="text-base sm:text-lg font-bold text-navy-900">
              {initialPackage ? "Edit Service Item & Price" : "Add Service Item & Price"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-400 hover:bg-gray-100 hover:text-navy-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>
          )}

          <form id="package-item-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Service Category *</Label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="mt-1"
              >
                <option value="">— Select Service Category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Item / Service Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium NGO Website Development"
                required
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Standard Price (₹) *</Label>
                <span className="text-xs text-navy-600/60">
                  {isCustom ? "Disabled for custom pricing" : "e.g. 25000"}
                </span>
              </div>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                disabled={isCustom}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={isCustom ? "Custom pricing enabled" : "25000"}
                className="mt-1 font-semibold"
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Custom WordPress or Next.js build with 5 pages, SSL, and mobile responsive design"
                className="mt-1"
              />
            </div>

            <div className="rounded-lg border border-brand-100 bg-brand-50/30 p-3">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-navy-800">
                <input
                  type="checkbox"
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-medium text-xs sm:text-sm">Custom Price Option</span>
                  <p className="text-xs text-navy-600/60">
                    Enable if price is entered manually per invoice.
                  </p>
                </div>
              </label>
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-brand-100 bg-gray-50/80 px-4 py-3 sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="package-item-form" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialPackage ? "Save Changes" : "Create Item"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Category Modal (Create Service Category)
// =========================================================================
function CategoryModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
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
        const err = await res.json().catch(() => ({}));
        setError(err.error?.message || "Failed to create category.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-brand-100 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-brand-600" />
            <h3 className="text-base sm:text-lg font-bold text-navy-900">Add Service Category</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-400 hover:bg-gray-100 hover:text-navy-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>
          )}

          <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Development, Digital Marketing"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. End-to-end development, SEO, and social media management services"
                className="mt-1"
              />
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-brand-100 bg-gray-50/80 px-4 py-3 sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Category
          </Button>
        </div>
      </div>
    </div>
  );
}
