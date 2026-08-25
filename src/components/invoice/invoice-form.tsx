"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, FileText, UserPlus } from "lucide-react";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validation";
import type { CategoryDTO, CustomerDTO } from "@/lib/types";
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
  gstPercent: 18,
};

export function InvoiceForm({ mode = "create", invoiceId, initialValues }: { mode?: "create" | "edit"; invoiceId?: string; initialValues?: Partial<InvoiceFormValues> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
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

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setCategories);
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
    if (mode === "edit" && initialValues) {
      reset({ ...initialValues, newCustomer: { ...initialValues.newCustomer } } as InvoiceFormValues);
      setCustomerMode("existing");
    } else {
      fetch("/api/invoices/next-number")
        .then((r) => r.json())
        .then((d) => setValue("invoiceNumber", d.invoiceNumber));
    }
  }, [mode, initialValues, reset, setValue]);

  const lineItems = watch("lineItems");
  const gstEnabled = watch("gstEnabled");
  const gstPercent = watch("gstPercent");
  const amountPaid = watch("amountPaid");

  const totals = useMemo(() => {
    return computeInvoiceTotals({
      lineItems: (lineItems || []).map((li) => ({
        quantity: Number(li.quantity) || 0,
        rate: Number(li.rate) || 0,
        discount: Number(li.discount) || 0,
        gstPercent: gstEnabled ? Number(li.gstPercent) || 0 : 0,
      })),
      gstEnabled,
      amountPaid: Number(amountPaid) || 0,
    });
  }, [lineItems, gstEnabled, amountPaid]);

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

  async function onSubmit(values: InvoiceFormValues) {    setSubmitting(true);
    setSubmitError("");

    const payload = customerMode === "existing"
      ? (({ newCustomer, ...rest }) => rest)(values)
      : (({ customerId, ...rest }) => rest)(values);

    try {
      const res = await fetch(mode === "edit" ? `/api/invoices/${invoiceId}` : "/api/invoices", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" ? { mode: "edit", data: payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error?.formErrors?.join(", ") || data.error || (mode === "edit" ? "Failed to update invoice" : "Failed to create invoice"));
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
        // nested errors (lineItems array, newCustomer object)
        return Object.values(e as Record<string, { message?: string }>)
          .flatMap((sub) =>
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
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{submitError}</div>
      )}

      {/* Invoice meta */}
      <Card>
        <h2 className="mb-4 text-base font-semibold text-navy-900">Invoice Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Invoice Number</Label>
            <Input {...register("invoiceNumber")} />
            {errors.invoiceNumber && <p className="mt-1 text-xs text-red-600">{errors.invoiceNumber.message}</p>}
          </div>
          <div>
            <Label>Invoice Date</Label>
            <Input type="date" {...register("invoiceDate")} />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" {...register("dueDate")} />
          </div>
          <div>
            <Label>Payment Status</Label>
            <Select {...register("paymentStatus")}>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Customer */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">Bill To</h2>
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
            <Label>Select Customer</Label>
            <Select {...register("customerId")}>
              <option value="">— Select a customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.email})
                </option>
              ))}
            </Select>
            {errors.customerId && <p className="mt-1 text-xs text-red-600">{errors.customerId.message}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Customer / Company Name</Label>
              <Input {...register("newCustomer.companyName")} />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input {...register("newCustomer.contactPerson")} />
            </div>
            <div className="sm:col-span-2">
              <Label>Billing Address</Label>
              <Input {...register("newCustomer.billingAddress")} />
            </div>
            <div>
              <Label>City</Label>
              <Input {...register("newCustomer.city")} />
            </div>
            <div>
              <Label>State</Label>
              <Input {...register("newCustomer.state")} />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input {...register("newCustomer.pincode")} />
            </div>
            <div>
              <Label>Country</Label>
              <Input {...register("newCustomer.country")} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register("newCustomer.phone")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("newCustomer.email")} />
            </div>
            <div>
              <Label>GSTIN</Label>
              <Input {...register("newCustomer.gstin")} />
            </div>
            <div>
              <Label>Place of Supply</Label>
              <Input {...register("newCustomer.placeOfSupply")} />
            </div>
          </div>
        )}
      </Card>

      {/* Services */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">Services</h2>
          <Button type="button" size="sm" onClick={() => append(emptyLineItem)}>
            <Plus className="h-3.5 w-3.5" /> Add Service
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const categoryName = watch(`lineItems.${index}.categoryName`);
            const isCustom = watch(`lineItems.${index}.isCustomPrice`);
            return (
              <div key={field.id} className="rounded-lg border border-brand-100 bg-brand-50/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-brand-700">Service {index + 1}</span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      aria-label="Delete service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <div className="lg:col-span-2">
                    <Label>Service Category</Label>
                    <Controller
                      control={control}
                      name={`lineItems.${index}.categoryName`}
                      render={({ field: f }) => (
                        <Select
                          {...f}
                          onChange={(e) => {
                            f.onChange(e.target.value);
                            setValue(`lineItems.${index}.packageName`, "");
                            setValue(`lineItems.${index}.rate`, 0);
                          }}
                        >
                          <option value="">— Select —</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Package</Label>
                    <Controller
                      control={control}
                      name={`lineItems.${index}.packageName`}
                      render={({ field: f }) => (
                        <Select
                          {...f}
                          disabled={!categoryName}
                          onChange={(e) => {
                            f.onChange(e.target.value);
                            handlePackageChange(index, categoryName, e.target.value);
                          }}
                        >
                          <option value="">— Select —</option>
                          {packagesFor(categoryName).map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} {p.isCustom ? "" : `— ${formatINR(p.price)}`}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" step="1" min="0" {...register(`lineItems.${index}.quantity`)} />
                  </div>
                  <div>
                    <Label>{isCustom ? "Custom Price" : "Price"}</Label>
                    <Input type="number" step="0.01" min="0" {...register(`lineItems.${index}.rate`)} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Label>Description</Label>
                    <Input {...register(`lineItems.${index}.description`)} placeholder="Optional notes for this line" />
                  </div>
                  <div>
                    <Label>Discount (₹)</Label>
                    <Input type="number" step="0.01" min="0" {...register(`lineItems.${index}.discount`)} />
                  </div>
                  <div>
                    <Label>GST %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      disabled={!gstEnabled}
                      {...register(`lineItems.${index}.gstPercent`)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {errors.lineItems && typeof errors.lineItems.message === "string" && (
            <p className="text-xs text-red-600">{errors.lineItems.message}</p>
          )}
        </div>
      </Card>

      {/* GST + Payment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-navy-900">GST</h2>
          <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-navy-900">Apply GST</p>
              <p className="text-xs text-navy-600/60">Default is 18% — toggle off to generate a non-GST invoice</p>
            </div>
            <Controller
              control={control}
              name="gstEnabled"
              render={({ field: f }) => (
                <button
                  type="button"
                  onClick={() => f.onChange(!f.value)}
                  className={`relative h-6 w-11 rounded-full transition ${f.value ? "bg-brand-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${f.value ? "left-5" : "left-0.5"}`}
                  />
                </button>
              )}
            />
          </div>
          <div>
            <Label>Default GST %</Label>
            <Input type="number" step="0.01" min="0" max="100" disabled={!gstEnabled} {...register("gstPercent")} />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-navy-900">Payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Payment Method</Label>
              <Select {...register("paymentMethod")}>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <Label>UPI ID</Label>
              <Input {...register("upiId")} placeholder="yourupi@bank" />
            </div>
            <div>
              <Label>Transaction / Reference No.</Label>
              <Input {...register("transactionRef")} />
            </div>
            <div>
              <Label>Amount Paid (₹)</Label>
              <Input type="number" step="0.01" min="0" {...register("amountPaid")} />
            </div>
          </div>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <Label>Notes (internal, not shown on PDF)</Label>
        <Textarea {...register("notes")} placeholder="Optional internal notes" />
      </Card>

      {/* Totals summary */}
      <Card className="border-brand-200 bg-brand-50/40">
        <h2 className="mb-4 text-base font-semibold text-navy-900">Summary</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
          <SummaryItem label="Subtotal" value={formatINR(totals.subtotal)} />
          <SummaryItem label="Discount" value={`- ${formatINR(totals.discountAmount)}`} />
          <SummaryItem label="Taxable Amount" value={formatINR(totals.taxableAmount)} />
          <SummaryItem label={`GST @ ${gstEnabled ? gstPercent : 0}%`} value={formatINR(totals.gstAmount)} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-600 px-4 py-3 text-white">
          <span className="text-sm font-medium">Grand Total</span>
          <span className="text-xl font-bold">{formatINR(totals.grandTotal)}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <SummaryItem label="Amount Paid" value={formatINR(totals.amountPaid)} />
          <SummaryItem label="Balance Due" value={formatINR(totals.balanceDue)} />
        </div>
        <p className="mt-3 text-xs italic text-navy-600/70">{numberToWordsINR(totals.grandTotal)}</p>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/invoices")}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {mode === "edit" ? "Save Changes" : "Generate Invoice"}
        </Button>
      </div>
    </form>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-navy-600/60">{label}</p>
      <p className="font-semibold text-navy-900">{value}</p>
    </div>
  );
}
