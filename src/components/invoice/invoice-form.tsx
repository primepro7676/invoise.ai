"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  UserPlus,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Percent,
  IndianRupee,
} from "lucide-react";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validation";
import type { CategoryDTO, CustomerDTO, PackageBundleDTO } from "@/lib/types";
import { computeInvoiceTotals, formatINR, numberToWordsINR } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

const emptyLineItem = {
  categoryName: "",
  packageName: "",
  description: "",
  quantity: 1,
  rate: 0,
  isCustomPrice: false,
  discount: 0,
  discountType: "FLAT" as const,
  gstPercent: 18,
};

export function InvoiceForm({
  mode = "create",
  invoiceId,
  initialValues,
}: {
  mode?: "create" | "edit";
  invoiceId?: string;
  initialValues?: Partial<InvoiceFormValues>;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [bundles, setBundles] = useState<PackageBundleDTO[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [showPackageScope, setShowPackageScope] = useState(
    Boolean(
      initialValues?.packageTitle ||
      initialValues?.packageSubtitle ||
      initialValues?.packageInclusions ||
      initialValues?.platformsIncluded ||
      initialValues?.paymentTermsText ||
      initialValues?.specialOfferNote
    )
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      paymentStatus: "UNPAID",
      lineItems: [emptyLineItem],
      overallDiscount: 0,
      discountType: "FLAT",
      discountReason: "",
      packageTitle: "",
      packageSubtitle: "",
      platformsIncluded: "",
      packageInclusions: "",
      paymentTermsText: "",
      specialOfferNote: "",
      gstEnabled: true,
      gstPercent: 18,
      amountPaid: 0,
      paymentMethod: "UPI",
      upiId: "",
      transactionRef: "",
      notes: "",
      newCustomer: {
        companyName: "",
        contactPerson: "",
        billingAddress: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        phone: "",
        email: "",
        gstin: "",
        placeOfSupply: "",
      },
    },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "lineItems" });

  useEffect(() => {
    fetch("/api/services")
      .then(async (r) => {
        if (!r.ok) return [];
        return r.json().catch(() => []);
      })
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => setCategories([]));

    fetch("/api/customers")
      .then(async (r) => {
        if (!r.ok) return [];
        return r.json().catch(() => []);
      })
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(() => setCustomers([]));

    fetch("/api/package-bundles")
      .then(async (r) => {
        if (!r.ok) return [];
        return r.json().catch(() => []);
      })
      .then((data) => {
        if (Array.isArray(data)) setBundles(data);
      })
      .catch(() => setBundles([]));

    if (mode === "edit" && initialValues) {
      reset({
        ...initialValues,
        newCustomer: { ...initialValues.newCustomer },
      } as InvoiceFormValues);
      setCustomerMode("existing");
      if (
        initialValues.packageTitle ||
        initialValues.packageSubtitle ||
        initialValues.packageInclusions ||
        initialValues.platformsIncluded ||
        initialValues.paymentTermsText ||
        initialValues.specialOfferNote
      ) {
        setShowPackageScope(true);
      }
    } else {
      fetch("/api/invoices/next-number")
        .then(async (r) => {
          if (!r.ok) return null;
          return r.json().catch(() => null);
        })
        .then((d) => {
          if (d?.invoiceNumber) setValue("invoiceNumber", d.invoiceNumber);
        })
        .catch(() => {});
    }
  }, [mode, initialValues, reset, setValue]);

  const lineItems = watch("lineItems");
  const gstEnabled = watch("gstEnabled");
  const gstPercent = watch("gstPercent");
  const amountPaid = watch("amountPaid");
  const overallDiscount = watch("overallDiscount");
  const discountType = watch("discountType");

  const totals = useMemo(() => {
    return computeInvoiceTotals({
      lineItems: (lineItems || []).map((li) => ({
        quantity: Number(li.quantity) || 0,
        rate: Number(li.rate) || 0,
        discount: Number(li.discount) || 0,
        discountType: li.discountType || "FLAT",
        gstPercent: gstEnabled ? Number(li.gstPercent) || 0 : 0,
      })),
      gstEnabled,
      amountPaid: Number(amountPaid) || 0,
      overallDiscount: Number(overallDiscount) || 0,
      discountType: discountType || "FLAT",
    });
  }, [lineItems, gstEnabled, amountPaid, overallDiscount, discountType]);

  function packagesFor(categoryName: string) {
    return categories.find((c) => c.name === categoryName)?.packages || [];
  }

  function handlePackageChange(index: number, categoryName: string, packageName: string) {
    const pkg = packagesFor(categoryName).find((p) => p.name === packageName);
    if (!pkg) return;
    setValue(`lineItems.${index}.rate`, pkg.isCustom ? 0 : pkg.price);
    setValue(`lineItems.${index}.isCustomPrice`, pkg.isCustom);
    setValue(`lineItems.${index}.description`, pkg.description || "");
    setValue(`lineItems.${index}.gstPercent`, gstPercent || 18);
  }

  function handleLoadBundle(bundleId: string) {
    setSelectedBundleId(bundleId);
    if (!bundleId) return;
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;

    if (bundle.items && bundle.items.length > 0) {
      const formattedItems = bundle.items.map((item) => ({
        categoryName: item.categoryName || categories[0]?.name || "Service",
        packageName: item.packageName || "",
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        isCustomPrice: Boolean(item.isCustomPrice),
        discount: 0,
        discountType: "FLAT" as const,
        gstPercent: gstPercent || 18,
      }));
      replace(formattedItems);
    }

    setValue("packageTitle", bundle.name || "");
    setValue("packageSubtitle", bundle.subtitle || "");
    setValue("overallDiscount", bundle.discountPrice || 0);
    setValue("discountType", "FLAT");
    setValue("discountReason", `${bundle.tier || "Special"} Package Offer`);
    setValue("platformsIncluded", bundle.platformsIncluded || "");
    setValue("packageInclusions", bundle.deliverables || "");
    setValue("paymentTermsText", bundle.paymentTerms || "");
    setValue("specialOfferNote", bundle.specialNote || "");

    setShowPackageScope(true);
  }

  async function onSubmit(values: InvoiceFormValues) {
    setSubmitting(true);
    setSubmitError("");

    const payload =
      customerMode === "existing"
        ? (({ newCustomer, ...rest }) => rest)(values)
        : (({ customerId, ...rest }) => rest)(values);

    try {
      const res = await fetch(mode === "edit" ? `/api/invoices/${invoiceId}` : "/api/invoices", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" ? { mode: "edit", data: payload } : payload),
      });
      const data = await res.json().catch(() => ({ error: "Invalid server response" }));
      if (!res.ok) {
        setSubmitError(
          data.error?.formErrors?.join(", ") ||
            data.error ||
            (mode === "edit" ? "Failed to update invoice" : "Failed to create invoice")
        );
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/invoices/${data.id}`);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function onInvalid(formErrors: typeof errors) {
    const messages = Object.values(formErrors)
      .flatMap((e) => {
        if (!e) return [];
        if ("message" in e && typeof e.message === "string") return [e.message];
        return Object.values(e as Record<string, { message?: string }>).flatMap((sub) =>
          sub && typeof sub === "object" && "message" in sub && typeof sub.message === "string"
            ? [sub.message]
            : Object.values(sub || {}).flatMap((s) =>
                s && typeof s === "object" && "message" in s && typeof (s as { message?: string }).message === "string"
                  ? [(s as { message: string }).message]
                  : []
              )
        );
      })
      .filter(Boolean);
    setSubmitError(
      messages.length > 0
        ? `Please fix: ${Array.from(new Set(messages)).join(" · ")}`
        : "Some fields need attention — please check the form above."
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      {submitError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-xs">
          {submitError}
        </div>
      )}

      {bundles.length > 0 && (
        <Card className="border border-[#c5dccb] bg-[#eaf2ec] p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c2e1b] text-[#f0c34e] shadow-xs">
                <Sparkles className="h-5 w-5 text-[#f0c34e]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0c2317]">
                  Select Predefined Package Offer (Quick Fill)
                </h3>
                <p className="text-xs text-[#526b5c]">
                  Choose a saved master package to automatically fill services, standard rates, discounts & deliverables.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-80">
              <Select
                value={selectedBundleId}
                onChange={(e) => handleLoadBundle(e.target.value)}
                className="bg-white font-medium border-[#cdddd2] text-[#0c2317]"
              >
                <option value="">— Choose a Preset Package Bundle —</option>
                {bundles.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.tier}) — {formatINR(b.finalPrice)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <h2 className="mb-4 text-base font-bold text-[#0c2317]">Invoice Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Invoice Number</Label>
            <Input {...register("invoiceNumber")} className="mt-1.5" />
            {errors.invoiceNumber && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.invoiceNumber.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Invoice Date</Label>
            <Input type="date" {...register("invoiceDate")} className="mt-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c] mb-0">Due Date</Label>
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    const base = watch("invoiceDate") ? new Date(watch("invoiceDate")) : new Date();
                    setValue("dueDate", base.toISOString().slice(0, 10), { shouldValidate: true, shouldDirty: true });
                  }}
                  className="px-1.5 py-0.5 rounded border border-[#d2ded5] bg-[#f0f5f1] hover:bg-[#0c2e1b] text-[#1c3d2b] hover:text-[#f0c34e] font-semibold transition"
                  title="Due Today"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = watch("invoiceDate") ? new Date(watch("invoiceDate")) : new Date();
                    const next = new Date(base.getTime() + 7 * 86400000);
                    setValue("dueDate", next.toISOString().slice(0, 10), { shouldValidate: true, shouldDirty: true });
                  }}
                  className="px-1.5 py-0.5 rounded border border-[#d2ded5] bg-[#f0f5f1] hover:bg-[#0c2e1b] text-[#1c3d2b] hover:text-[#f0c34e] font-semibold transition"
                  title="+7 Days"
                >
                  +7d
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = watch("invoiceDate") ? new Date(watch("invoiceDate")) : new Date();
                    const next = new Date(base.getTime() + 15 * 86400000);
                    setValue("dueDate", next.toISOString().slice(0, 10), { shouldValidate: true, shouldDirty: true });
                  }}
                  className="px-1.5 py-0.5 rounded border border-[#d2ded5] bg-[#f0f5f1] hover:bg-[#0c2e1b] text-[#1c3d2b] hover:text-[#f0c34e] font-semibold transition"
                  title="+15 Days"
                >
                  +15d
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = watch("invoiceDate") ? new Date(watch("invoiceDate")) : new Date();
                    const next = new Date(base.getTime() + 30 * 86400000);
                    setValue("dueDate", next.toISOString().slice(0, 10), { shouldValidate: true, shouldDirty: true });
                  }}
                  className="px-1.5 py-0.5 rounded border border-[#d2ded5] bg-[#f0f5f1] hover:bg-[#0c2e1b] text-[#1c3d2b] hover:text-[#f0c34e] font-semibold transition"
                  title="+30 Days"
                >
                  +30d
                </button>
              </div>
            </div>
            <Input type="date" {...register("dueDate")} className="mt-1.5" />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.dueDate.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Payment Status</Label>
            <Select {...register("paymentStatus")} className="mt-1.5">
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0c2317]">Bill To</h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={customerMode === "existing" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCustomerMode("existing")}
            >
              Existing Customer
            </Button>
            <Button
              type="button"
              variant={customerMode === "new" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCustomerMode("new")}
            >
              <UserPlus className="h-3.5 w-3.5" /> New Customer
            </Button>
          </div>
        </div>

        {customerMode === "existing" ? (
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Select Customer</Label>
            <Select {...register("customerId")} className="mt-1.5">
              <option value="">— Select a customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.email || c.phone})
                </option>
              ))}
            </Select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.customerId.message}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Customer / Company Name *</Label>
              <Input {...register("newCustomer.companyName")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Contact Person</Label>
              <Input {...register("newCustomer.contactPerson")} className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Billing Address *</Label>
              <Input {...register("newCustomer.billingAddress")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">City *</Label>
              <Input {...register("newCustomer.city")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">State *</Label>
              <Input {...register("newCustomer.state")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Pincode *</Label>
              <Input {...register("newCustomer.pincode")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Country</Label>
              <Input {...register("newCustomer.country")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Phone *</Label>
              <Input {...register("newCustomer.phone")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Email</Label>
              <Input type="email" {...register("newCustomer.email")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">GSTIN</Label>
              <Input {...register("newCustomer.gstin")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Place of Supply *</Label>
              <Input {...register("newCustomer.placeOfSupply")} className="mt-1.5" />
            </div>
          </div>
        )}
      </Card>

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0c2317]">Services & Standard Pricing</h2>
            <p className="text-xs text-[#526b5c]">
              Add or customize services included in this invoice.
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => append(emptyLineItem)}>
            <Plus className="h-3.5 w-3.5" /> Add Service
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const categoryName = watch(`lineItems.${index}.categoryName`);
            const isCustom = watch(`lineItems.${index}.isCustomPrice`);
            const itemDiscountType = watch(`lineItems.${index}.discountType`) || "FLAT";

            return (
              <div key={field.id} className="rounded-xl border border-[#e1ece3] bg-[#f9fbf9] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0c2e1b]">
                    Service {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                      aria-label="Delete service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Service Category</Label>
                    <Controller
                      control={control}
                      name={`lineItems.${index}.categoryName`}
                      render={({ field: f }) => (
                        <Select
                          {...f}
                          className="mt-1"
                          onChange={(e) => {
                            f.onChange(e.target.value);
                            setValue(`lineItems.${index}.packageName`, "");
                            setValue(`lineItems.${index}.rate`, 0);
                          }}
                        >
                          <option value="">— Select Service —</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          {!categories.some((c) => c.name === f.value) && f.value && (
                            <option value={f.value}>{f.value}</option>
                          )}
                        </Select>
                      )}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Package / Item (Optional)</Label>
                    <Controller
                      control={control}
                      name={`lineItems.${index}.packageName`}
                      render={({ field: f }) => {
                        const pkgs = packagesFor(categoryName);
                        const hasPredefined = pkgs.length > 0;
                        return hasPredefined ? (
                          <Select
                            {...f}
                            className="mt-1"
                            onChange={(e) => {
                              f.onChange(e.target.value);
                              if (e.target.value) {
                                handlePackageChange(index, categoryName, e.target.value);
                              }
                            }}
                          >
                            <option value="">— Select Package (Optional) —</option>
                            {pkgs.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name} {p.isCustom ? "" : `— ${formatINR(p.price)}`}
                              </option>
                            ))}
                            {!pkgs.some((p) => p.name === f.value) && f.value && (
                              <option value={f.value}>{f.value}</option>
                            )}
                          </Select>
                        ) : (
                          <Input
                            value={f.value}
                            className="mt-1"
                            onChange={(e) => f.onChange(e.target.value)}
                            placeholder="Service / item name (Optional)"
                          />
                        );
                      }}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Qty</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      className="mt-1"
                      {...register(`lineItems.${index}.quantity`)}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">{isCustom ? "Price (₹)" : "Standard Price (₹)"}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1"
                      {...register(`lineItems.${index}.rate`)}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-6">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Line Description (Optional)</Label>
                    <Input
                      className="mt-1"
                      {...register(`lineItems.${index}.description`)}
                      placeholder="Optional details for this service"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Item Discount (Optional)</Label>
                      <div className="flex items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setValue(`lineItems.${index}.discountType`, "FLAT")}
                          className={`rounded-lg px-2 py-0.5 text-xs font-bold transition ${
                            itemDiscountType === "FLAT"
                              ? "bg-[#0c2e1b] text-[#f0c34e] shadow-xs"
                              : "bg-[#eaf2ec] text-[#1c3d2b] hover:bg-[#d8e8dc]"
                          }`}
                        >
                          ₹ (Rupees)
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue(`lineItems.${index}.discountType`, "PERCENT")}
                          className={`rounded-lg px-2 py-0.5 text-xs font-bold transition ${
                            itemDiscountType === "PERCENT"
                              ? "bg-[#0c2e1b] text-[#f0c34e] shadow-xs"
                              : "bg-[#eaf2ec] text-[#1c3d2b] hover:bg-[#d8e8dc]"
                          }`}
                        >
                          % (Percent)
                        </button>
                      </div>
                    </div>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        {...register(`lineItems.${index}.discount`)}
                      />
                      <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-[#526b5c] font-bold">
                        {itemDiscountType === "PERCENT" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">GST %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="mt-1"
                      disabled={!gstEnabled}
                      {...register(`lineItems.${index}.gstPercent`)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {errors.lineItems && typeof errors.lineItems.message === "string" && (
            <p className="text-xs font-medium text-rose-600">{errors.lineItems.message}</p>
          )}
        </div>
      </Card>

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[#edf2ee] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2ec] text-[#0c2e1b] border border-[#d2ded5]">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0c2317]">
                Special Package Offer & Overall Discount (Optional)
              </h2>
              <p className="text-xs text-[#526b5c]">
                Apply a special package discount in Rupees (₹) or Percentage (%) on the entire invoice.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[#d2ded5] bg-[#eaf2ec] px-2.5 py-0.5 text-xs font-semibold text-[#0c2e1b]">
            Special Pricing
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Discount Unit</Label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setValue("discountType", "FLAT")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                  discountType === "FLAT"
                    ? "border-[#0c2e1b] bg-[#0c2e1b] text-[#f0c34e] shadow-md shadow-[#0c2e1b]/20 font-bold"
                    : "border-[#d2ded5] bg-white text-[#1c3d2b] hover:bg-[#f0f5f1]"
                }`}
              >
                <IndianRupee className="h-4 w-4" /> Rupees (₹)
              </button>
              <button
                type="button"
                onClick={() => setValue("discountType", "PERCENT")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                  discountType === "PERCENT"
                    ? "border-[#0c2e1b] bg-[#0c2e1b] text-[#f0c34e] shadow-md shadow-[#0c2e1b]/20 font-bold"
                    : "border-[#d2ded5] bg-white text-[#1c3d2b] hover:bg-[#f0f5f1]"
                }`}
              >
                <Percent className="h-4 w-4" /> Percent (%)
              </button>
            </div>
          </div>

          <div className="sm:col-span-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">
              {discountType === "PERCENT" ? "Special Discount (%)" : "Special Discount (₹)"}
            </Label>
            <div className="relative mt-1">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={discountType === "PERCENT" ? "e.g. 20" : "e.g. 25000"}
                {...register("overallDiscount")}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-bold text-[#526b5c]">
                {discountType === "PERCENT" ? "%" : "₹"}
              </span>
            </div>
          </div>

          <div className="sm:col-span-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Offer Label (Optional)</Label>
            <div className="mt-1">
              <Input
                placeholder="e.g. Special Package Offer / NGO Discount"
                {...register("discountReason")}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#e1ece3] bg-[#f9fbf9] p-4 text-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <span className="text-xs text-[#526b5c]">Total Standard Value:</span>
              <p className="font-bold text-[#0c2317] text-base">{formatINR(totals.subtotal)}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-[#0c2e1b]">Total Discount Applied:</span>
              <p className="font-bold text-[#0c2e1b] text-base">- {formatINR(totals.discountAmount)}</p>
            </div>
            <div>
              <span className="text-xs text-[#526b5c]">Final Package Price (excl. GST):</span>
              <p className="font-bold text-[#0c2e1b] text-base">{formatINR(totals.taxableAmount)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setShowPackageScope(!showPackageScope)}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-[#0c2e1b]" />
            <div>
              <h2 className="text-base font-bold text-[#0c2317]">
                Package Scope, Deliverables & Payment Terms (Optional)
              </h2>
              <p className="text-xs text-[#526b5c]">
                Package branding, platforms, deliverables list, and advance payment terms.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-semibold text-[#0c2e1b] hover:underline"
          >
            {showPackageScope ? (
              <>
                Hide Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Add Package Details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {showPackageScope && (
          <div className="mt-5 space-y-4 border-t border-[#edf2ee] pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Package / Deal Title (Optional)</Label>
                <Input
                  className="mt-1.5"
                  {...register("packageTitle")}
                  placeholder="e.g. Premium NGO Digital Presence Package"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Package Subtitle / Tagline (Optional)</Label>
                <Input
                  className="mt-1.5"
                  {...register("packageSubtitle")}
                  placeholder="e.g. Complete Digital Setup & Automation"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Social Media / Platforms Included (Optional)</Label>
                <Textarea
                  rows={3}
                  className="mt-1.5"
                  {...register("platformsIncluded")}
                  placeholder="e.g.&#10;• Facebook&#10;• Instagram&#10;• YouTube"
                />
                <p className="mt-1 text-xs text-[#526b5c]">
                  Enter platforms or channels separated by newlines or commas.
                </p>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Custom Payment Terms (Optional)</Label>
                <Textarea
                  rows={3}
                  className="mt-1.5"
                  {...register("paymentTermsText")}
                  placeholder="e.g. 100% Advance Payment: ₹20,000&#10;Project development and setup work will commence after receipt of the full advance payment."
                />
                <p className="mt-1 text-xs text-[#526b5c]">
                  Specify milestone or advance terms to display on the invoice.
                </p>
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Package Includes / Deliverables Checklist (Optional)</Label>
              <Textarea
                rows={5}
                className="mt-1.5"
                {...register("packageInclusions")}
                placeholder="e.g.&#10;• Premium NGO website&#10;• Professional social media setup&#10;• Google My Business setup&#10;• WhatsApp integration&#10;• AI chatbot integration&#10;• Mobile-responsive website&#10;• Contact & enquiry forms&#10;• Basic SEO setup&#10;• Google Maps integration&#10;• AI-powered visitor assistance"
              />
              <p className="mt-1 text-xs text-[#526b5c]">
                List key features and deliverables included in this package (each line becomes a bullet point).
              </p>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Special Offer Note / Disclaimer (Optional)</Label>
              <Input
                className="mt-1.5"
                {...register("specialOfferNote")}
                placeholder="e.g. Special Offer: ₹20,000 only · Third-party charges, if applicable, are separate."
              />
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
          <h2 className="mb-4 text-base font-bold text-[#0c2317]">GST</h2>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#e1ece3] bg-[#f9fbf9] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#0c2317]">Apply GST</p>
              <p className="text-xs text-[#526b5c]">
                Default is 18% — toggle off to generate a non-GST invoice
              </p>
            </div>
            <Controller
              control={control}
              name="gstEnabled"
              render={({ field: f }) => (
                <button
                  type="button"
                  onClick={() => f.onChange(!f.value)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    f.value ? "bg-[#0c2e1b] shadow-xs" : "bg-[#d2ded5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      f.value ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              )}
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Default GST %</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="mt-1.5"
              disabled={!gstEnabled}
              {...register("gstPercent")}
            />
          </div>
        </Card>

        <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
          <h2 className="mb-4 text-base font-bold text-[#0c2317]">Payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Payment Method</Label>
              <Select {...register("paymentMethod")} className="mt-1.5">
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">UPI ID (Optional)</Label>
              <Input {...register("upiId")} placeholder="yourupi@bank" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Transaction / Reference No. (Optional)</Label>
              <Input {...register("transactionRef")} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Amount Paid (₹)</Label>
              <Input type="number" step="0.01" min="0" {...register("amountPaid")} className="mt-1.5" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Internal Notes (Optional - not shown on client PDF)</Label>
        <Textarea {...register("notes")} placeholder="Optional private internal notes" className="mt-1.5" />
      </Card>

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <h2 className="mb-4 text-base font-bold text-[#0c2317]">Invoice Summary</h2>
        <div className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4">
          <SummaryItem label="Total Value (Subtotal)" value={formatINR(totals.subtotal)} />
          <SummaryItem
            label="Special Discount"
            value={`- ${formatINR(totals.discountAmount)}`}
            highlight={totals.discountAmount > 0}
          />
          <SummaryItem label="Final Package Price" value={formatINR(totals.taxableAmount)} />
          <SummaryItem
            label={`GST @ ${gstEnabled ? gstPercent : 0}%`}
            value={formatINR(totals.gstAmount)}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0c2e1b] px-5 py-3.5 text-[#f0c34e] shadow-md shadow-[#0c2e1b]/20">
          <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
          <span className="text-2xl font-black">{formatINR(totals.grandTotal)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm border-t border-[#edf2ee] pt-3">
          <SummaryItem label="Amount Paid" value={formatINR(totals.amountPaid)} />
          <SummaryItem label="Balance Due" value={formatINR(totals.balanceDue)} />
        </div>
        <p className="mt-3 text-xs italic text-[#526b5c]">{numberToWordsINR(totals.grandTotal)}</p>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/dashboard/invoices")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {mode === "edit" ? "Save Changes" : "Generate Invoice"}
        </Button>
      </div>
    </form>
  );
}

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[#526b5c] font-medium">{label}</p>
      <p className={`text-base font-bold ${highlight ? "text-[#0c2e1b]" : "text-[#0c2317]"}`}>{value}</p>
    </div>
  );
}
