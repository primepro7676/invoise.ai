export interface LineItemInput {
  quantity: number;
  rate: number;
  discount: number; // flat amount per line
  gstPercent: number;
}

export function lineItemTotal(item: LineItemInput, gstEnabled: boolean) {
  const base = item.quantity * item.rate - item.discount;
  const gst = gstEnabled ? (base * item.gstPercent) / 100 : 0;
  return {
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
}

export function computeInvoiceTotals({ lineItems, gstEnabled, amountPaid }: InvoiceTotalsInput) {
  let subtotal = 0;
  let discountAmount = 0;
  let gstAmount = 0;

  for (const item of lineItems) {
    subtotal += item.quantity * item.rate;
    discountAmount += item.discount;
    const { base } = lineItemTotal(item, gstEnabled);
    gstAmount += gstEnabled ? (base * item.gstPercent) / 100 : 0;
  }

  const taxableAmount = subtotal - discountAmount;
  const grandTotal = taxableAmount + gstAmount;
  const balanceDue = grandTotal - amountPaid;

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
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
