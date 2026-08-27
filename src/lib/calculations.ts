export interface LineItemInput {
  quantity: number;
  rate: number;
  discount: number; // discount value (either flat ₹ or %)
  discountType?: "FLAT" | "PERCENT"; // default "FLAT" (₹)
  gstPercent: number;
}

export function lineItemTotal(item: LineItemInput, gstEnabled: boolean) {
  const lineBaseBeforeDiscount = (item.quantity || 0) * (item.rate || 0);
  let discountAmt = 0;
  if (item.discount && item.discount > 0) {
    if (item.discountType === "PERCENT") {
      discountAmt = round2((lineBaseBeforeDiscount * Math.min(100, item.discount)) / 100);
    } else {
      discountAmt = round2(Math.min(lineBaseBeforeDiscount, item.discount));
    }
  }
  const base = Math.max(0, lineBaseBeforeDiscount - discountAmt);
  const gst = gstEnabled ? (base * (item.gstPercent || 0)) / 100 : 0;
  return {
    discountAmt: round2(discountAmt),
    base: round2(base),
    gst: round2(gst),
    total: round2(base + gst),
  };
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface InvoiceTotalsInput {
  lineItems: LineItemInput[];
  gstEnabled: boolean;
  amountPaid: number;
  overallDiscount?: number;
  discountType?: "FLAT" | "PERCENT";
}

export function computeInvoiceTotals({
  lineItems,
  gstEnabled,
  amountPaid,
  overallDiscount = 0,
  discountType = "FLAT",
}: InvoiceTotalsInput) {
  let subtotal = 0;
  let lineDiscountTotal = 0;

  for (const item of lineItems) {
    subtotal += (item.quantity || 0) * (item.rate || 0);
    const { discountAmt } = lineItemTotal(item, gstEnabled);
    lineDiscountTotal += discountAmt;
  }

  const baseAfterLineDiscount = Math.max(0, subtotal - lineDiscountTotal);

  let overallDiscountAmount = 0;
  if (overallDiscount > 0) {
    if (discountType === "PERCENT") {
      overallDiscountAmount = round2((baseAfterLineDiscount * Math.min(100, overallDiscount)) / 100);
    } else {
      overallDiscountAmount = round2(Math.min(baseAfterLineDiscount, overallDiscount));
    }
  }

  const discountAmount = round2(lineDiscountTotal + overallDiscountAmount);
  const taxableAmount = Math.max(0, round2(subtotal - discountAmount));

  // Compute GST based on weighted average or proportionate line items
  let gstAmount = 0;
  if (gstEnabled && taxableAmount > 0) {
    if (subtotal > 0) {
      const discountRatio = taxableAmount / subtotal;
      for (const item of lineItems) {
        const itemLineTotal = (item.quantity || 0) * (item.rate || 0);
        const itemProportionateTaxable = itemLineTotal * discountRatio;
        gstAmount += (itemProportionateTaxable * (item.gstPercent || 0)) / 100;
      }
    } else {
      gstAmount = 0;
    }
  }

  gstAmount = round2(gstAmount);
  const grandTotal = round2(taxableAmount + gstAmount);
  const balanceDue = Math.max(0, round2(grandTotal - amountPaid));

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    lineDiscountTotal: round2(lineDiscountTotal),
    overallDiscountAmount: round2(overallDiscountAmount),
    taxableAmount: round2(taxableAmount),
    gstAmount: round2(gstAmount),
    grandTotal: round2(grandTotal),
    amountPaid: round2(amountPaid),
    balanceDue: round2(balanceDue),
  };
}

// ---- Number to words (Indian numbering system, Rupees) ----

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${tens[t]}${o ? " " + ones[o] : ""}`;
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let str = "";
  if (h) str += `${ones[h]} Hundred${rest ? " " : ""}`;
  if (rest) str += twoDigits(rest);
  return str;
}

export function numberToWordsINR(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  let n = rupees;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  let words = "";
  if (crore) words += `${threeDigits(crore)} Crore `;
  if (lakh) words += `${threeDigits(lakh)} Lakh `;
  if (thousand) words += `${threeDigits(thousand)} Thousand `;
  if (hundred) words += `${threeDigits(hundred)}`;

  words = words.trim();
  let result = `${words} Rupees`;
  if (paise > 0) {
    result += ` and ${twoDigits(paise)} Paise`;
  }
  return `${result} Only`;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}
