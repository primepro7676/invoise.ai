import { z } from "zod";

export const customerSchema = z.object({
  companyName: z.string().min(1, "Company/Customer name is required"),
  contactPerson: z.string().optional().default(""),
  billingAddress: z.string().min(1, "Billing address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().min(1).default("India"),
  phone: z.string().min(6, "Valid phone number required"),
  email: z.string().optional().default("").refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "Valid email required"
  ),
  gstin: z.string().optional().default(""),
  placeOfSupply: z.string().min(1, "Place of supply is required"),
});
export type CustomerFormValues = z.infer<typeof customerSchema>;

export const packageSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1, "Package name is required"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  description: z.string().optional().default(""),
  isCustom: z.boolean().optional().default(false),
});
export type PackageFormValues = z.infer<typeof packageSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional().default(""),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const lineItemSchema = z.object({
  categoryName: z.string().min(1, "Select a service"),
  packageName: z.string().min(1, "Select a package"),
  description: z.string().optional().default(""),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.coerce.number().min(0, "Price must be 0 or more"),
  isCustomPrice: z.boolean().optional().default(false),
  discount: z.coerce.number().min(0).optional().default(0),
  gstPercent: z.coerce.number().min(0).max(100).optional().default(18),
});
export type LineItemFormValues = z.infer<typeof lineItemSchema>;

const newCustomerLenient = z.object({
  companyName: z.string().optional().default(""),
  contactPerson: z.string().optional().default(""),
  billingAddress: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  pincode: z.string().optional().default(""),
  country: z.string().optional().default("India"),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  gstin: z.string().optional().default(""),
  placeOfSupply: z.string().optional().default(""),
});

export const invoiceSchema = z
  .object({
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    invoiceDate: z.string().min(1, "Invoice date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    paymentStatus: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"]).default("UNPAID"),

    customerId: z.string().optional().default(""),
    newCustomer: newCustomerLenient.optional(),

    lineItems: z.array(lineItemSchema).min(1, "Add at least one service"),

    gstEnabled: z.boolean().default(true),
    gstPercent: z.coerce.number().min(0).max(100).default(18),

    amountPaid: z.coerce.number().min(0).default(0),

    paymentMethod: z.string().optional().default("UPI"),
    upiId: z.string().optional().default(""),
    transactionRef: z.string().optional().default(""),

    notes: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    const hasExisting = !!data.customerId;
    const hasNewName = !!data.newCustomer?.companyName?.trim();

    if (!hasExisting && !hasNewName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an existing customer or fill in the new customer's details",
        path: ["customerId"],
      });
      return;
    }

    // Only enforce required new-customer fields when actually creating a new customer.
    if (!hasExisting && hasNewName) {
      const required: [keyof z.infer<typeof newCustomerLenient>, string][] = [
        ["billingAddress", "Billing address is required"],
        ["city", "City is required"],
        ["state", "State is required"],
        ["pincode", "Pincode is required"],
        ["phone", "Phone is required"],
        ["placeOfSupply", "Place of supply is required"],
      ];
      for (const [key, message] of required) {
        if (!data.newCustomer?.[key]?.toString().trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: ["newCustomer", key] });
        }
      }
      const email = data.newCustomer?.email;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid email required", path: ["newCustomer", "email"] });
      }
    }
  });
export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const companySettingsSchema = z.object({
  primeproName: z.string().min(1),
  primeproTagline: z.string().optional().default(""),
  primeproAddress: z.string().min(1),
  primeproRegistration: z.string().optional().default(""),
  primeproEIN: z.string().optional().default(""),
  primeproPhone: z.string().optional().default(""),
  primeproWhatsapp: z.string().optional().default(""),
  primeproEmail: z.string().email().optional().or(z.literal("")),
  primeproLinkedin: z.string().optional().default(""),

  fueloName: z.string().min(1),
  fueloTagline: z.string().optional().default(""),
  fueloCIN: z.string().optional().default(""),
  fueloGSTIN: z.string().optional().default(""),
  fueloAddress: z.string().min(1),
  fueloPhone: z.string().optional().default(""),
  fueloWhatsapp: z.string().optional().default(""),
  fueloEmail: z.string().email().optional().or(z.literal("")),
  fueloLinkedin: z.string().optional().default(""),

  upiId: z.string().optional().default(""),
  signatoryLine1: z.string().optional().default(""),
  signatoryLine2: z.string().optional().default(""),
  defaultGstPercent: z.coerce.number().min(0).max(100).default(18),
  footerNote: z.string().optional().default(""),
});
export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;
