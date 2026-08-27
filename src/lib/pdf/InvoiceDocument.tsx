import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatDate } from "@/lib/calculations";

// =====================================================
// BRAND PALETTE
// =====================================================
const BRAND = {
  green: "#0e8f68",
  greenDark: "#0b4a3a",
  greenLight: "#eefdf6",
  greenBorder: "#aef3d6",
  navy: "#08202d",
  gray: "#5b6b68",
  white: "#ffffff",
};

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: BRAND.navy,
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 32,
    backgroundColor: BRAND.white,
  },

  // ===================================================
  // HEADER
  // ===================================================
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: BRAND.green,
    paddingBottom: 10,
    marginBottom: 10,
  },

  companyCol: {
    width: "48%",
  },

  companyColRight: {
    width: "48%",
    alignItems: "flex-end",
  },

  logoLeft: {
    width: 130,
    height: 52,
    objectFit: "contain",
    alignSelf: "flex-start",
    marginLeft: -34,
    marginBottom: 4,
  },

  logoRight: {
    width: 130,
    height: 52,
    objectFit: "contain",
    alignSelf: "flex-end",
    marginBottom: 4,
  },

  officeHeading: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND.navy,
    marginBottom: 1,
  },

  companyLine: {
    fontSize: 8,
    fontWeight: 400,
    color: BRAND.navy,
    lineHeight: 1.4,
  },

  companyLineRight: {
    fontSize: 8,
    fontWeight: 400,
    color: BRAND.navy,
    lineHeight: 1.4,
    textAlign: "right",
  },

  // ===================================================
  // TITLE BAR
  // ===================================================
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BRAND.greenLight,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  titleText: {
    fontSize: 14,
    fontWeight: 700,
    color: BRAND.greenDark,
    letterSpacing: 1,
  },

  metaGrid: {
    flexDirection: "row",
    gap: 16,
  },

  metaItem: {
    alignItems: "flex-end",
  },

  metaLabel: {
    fontSize: 6.5,
    color: BRAND.gray,
    textTransform: "uppercase",
  },

  metaValue: {
    fontSize: 8.5,
    fontWeight: 700,
    color: BRAND.navy,
  },

  // ===================================================
  // PACKAGE BANNER
  // ===================================================
  packageBanner: {
    backgroundColor: BRAND.greenLight,
    borderLeftWidth: 3,
    borderLeftColor: BRAND.green,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 2,
  },

  packageBannerTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    color: BRAND.greenDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  packageBannerSubtitle: {
    fontSize: 7.5,
    color: BRAND.navy,
    marginTop: 1,
  },

  // ===================================================
  // BILL TO
  // ===================================================
  billToBox: {
    borderWidth: 1,
    borderColor: BRAND.greenBorder,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    width: "55%",
  },

  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: BRAND.green,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  billToName: {
    fontSize: 9.5,
    fontWeight: 700,
    color: BRAND.navy,
    marginBottom: 2,
  },

  billToLine: {
    fontSize: 7.5,
    color: BRAND.navy,
    lineHeight: 1.35,
  },

  // ===================================================
  // TABLE
  // ===================================================
  table: {
    marginBottom: 6,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.green,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2,
  },

  tableHeaderCell: {
    color: BRAND.white,
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2f2eb",
  },

  tableRowAlt: {
    backgroundColor: BRAND.greenLight,
  },

  tableCell: {
    fontSize: 7.8,
    color: BRAND.navy,
  },

  colSno: {
    width: "6%",
  },

  colService: {
    width: "30%",
  },

  colPackage: {
    width: "20%",
  },

  colQty: {
    width: "8%",
    textAlign: "center",
  },

  colRate: {
    width: "18%",
    textAlign: "right",
  },

  colAmount: {
    width: "18%",
    textAlign: "right",
  },

  // ===================================================
  // TOTALS
  // ===================================================
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },

  totalsBox: {
    width: "50%",
  },

  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2f2eb",
  },

  totalsLabel: {
    fontSize: 8,
    color: BRAND.gray,
  },

  totalsValue: {
    fontSize: 8,
    color: BRAND.navy,
    fontWeight: 700,
  },

  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2f2eb",
    backgroundColor: BRAND.greenLight,
    paddingHorizontal: 4,
    borderRadius: 2,
  },

  discountLabel: {
    fontSize: 8,
    color: BRAND.greenDark,
    fontWeight: 700,
  },

  discountValue: {
    fontSize: 8,
    color: BRAND.green,
    fontWeight: 700,
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: BRAND.green,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 3,
  },

  grandTotalLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: BRAND.white,
  },

  grandTotalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND.white,
  },

  // ===================================================
  // AMOUNT IN WORDS
  // ===================================================
  wordsBox: {
    backgroundColor: BRAND.greenLight,
    borderRadius: 3,
    padding: 6,
    marginBottom: 6,
  },

  wordsLabel: {
    fontSize: 6.5,
    color: BRAND.gray,
    textTransform: "uppercase",
    marginBottom: 1,
  },

  wordsValue: {
    fontSize: 8,
    color: BRAND.navy,
    fontWeight: 700,
  },

  // ===================================================
  // PAYMENT / QR / SIGNATURE
  // ===================================================
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  paymentCol: {
    width: "45%",
  },

  qrCol: {
    width: "22%",
    alignItems: "center",
  },

  signCol: {
    width: "30%",
    alignItems: "flex-end",
  },

  qrImage: {
    width: 58,
    height: 58,
    marginBottom: 3,
  },

  qrCaption: {
    fontSize: 6.5,
    color: BRAND.gray,
    textAlign: "center",
  },

  signatureImg: {
    width: 85,
    height: 30,
    objectFit: "contain",
    marginBottom: 2,
  },

  signatureLine: {
    fontSize: 7.5,
    color: BRAND.navy,
    textAlign: "right",
    lineHeight: 1.3,
  },

  // ===================================================
  // FOOTER
  // ===================================================
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 6.8,
    color: BRAND.gray,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.greenBorder,
    paddingTop: 5,
  },

  pageNumber: {
    position: "absolute",
    bottom: 16,
    right: 32,
    fontSize: 6.8,
    color: BRAND.gray,
  },

  // ===================================================
  // PAGE 2
  // ===================================================
  termsTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: BRAND.greenDark,
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  termsSection: {
    marginBottom: 9,
  },

  termsSectionTitle: {
    fontSize: 8.8,
    fontWeight: 700,
    color: BRAND.white,
    backgroundColor: BRAND.green,
    padding: 4,
    borderRadius: 2,
    marginBottom: 4,
    textTransform: "uppercase",
  },

  termsLine: {
    fontSize: 7.8,
    color: BRAND.navy,
    lineHeight: 1.5,
    marginBottom: 1,
  },

  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },

  bulletDot: {
    fontSize: 8,
    color: BRAND.green,
    marginRight: 4,
  },

  bulletText: {
    fontSize: 7.8,
    color: BRAND.navy,
    lineHeight: 1.4,
    flex: 1,
  },

  highlightBox: {
    backgroundColor: BRAND.greenLight,
    borderWidth: 1,
    borderColor: BRAND.greenBorder,
    borderRadius: 3,
    padding: 6,
    marginBottom: 8,
  },

  highlightTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: BRAND.greenDark,
    marginBottom: 2,
  },

  highlightText: {
    fontSize: 7.8,
    color: BRAND.navy,
    lineHeight: 1.4,
  },

  termsFooterCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.greenBorder,
  },

  termsFooterCol: {
    width: "48%",
  },

  termsFooterName: {
    fontSize: 7.8,
    fontWeight: 700,
    color: BRAND.greenDark,
    marginBottom: 2,
  },

  termsFooterLine: {
    fontSize: 7,
    color: BRAND.gray,
    lineHeight: 1.4,
  },
});

// =====================================================
// PROPS
// =====================================================
export interface InvoicePdfProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: string;

  // Package & scope details
  packageTitle?: string;
  packageSubtitle?: string;
  platformsIncluded?: string;
  packageInclusions?: string;
  paymentTermsText?: string;
  specialOfferNote?: string;
  discountReason?: string;

  settings: {
    primeproName: string;
    primeproTagline: string;
    primeproAddress: string;
    primeproRegistration: string;
    primeproEIN: string;
    primeproPhone: string;
    primeproWhatsapp: string;
    primeproEmail: string;
    primeproLogoUrl: string;

    fueloName: string;
    fueloTagline: string;
    fueloCIN: string;
    fueloGSTIN: string;
    fueloAddress: string;
    fueloPhone: string;
    fueloWhatsapp: string;
    fueloEmail: string;
    fueloLogoUrl: string;

    upiId: string;
    qrCodeUrl: string;
    signatureUrl: string;
    signatoryLine1: string;
    signatoryLine2: string;
    footerNote: string;
  };

  customer: {
    companyName: string;
    contactPerson: string;
    billingAddress: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
    email: string;
    gstin: string;
    placeOfSupply: string;
  };

  lineItems: {
    categoryName: string;
    packageName: string;
    quantity: number;
    rate: number;
    gstPercent: number;
    total: number;
  }[];

  gstEnabled: boolean;
  gstPercent: number;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  amountInWords: string;

  paymentMethod: string;
  upiId: string;
  transactionRef: string;

  termsSections: {
    title: string;
    lines: string[];
  }[];

  generalTerms: string[];
}

// =====================================================
// MONEY HELPER
// =====================================================
function money(n: number) {
  return `Rs. ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// =====================================================
// INVOICE DOCUMENT
// =====================================================
export function InvoiceDocument(props: InvoicePdfProps) {
  const { settings } = props;

  const inclusionBullets = props.packageInclusions
    ? props.packageInclusions
        .split("\n")
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
        .filter(Boolean)
    : [];

  const platformBullets = props.platformsIncluded
    ? props.platformsIncluded
        .split("\n")
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
        .filter(Boolean)
    : [];

  return (
    <Document title={`Tax Invoice ${props.invoiceNumber}`}>
      {/* =================================================
          PAGE 1: TAX INVOICE & BREAKDOWN
      ================================================= */}
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          {/* PRIMEPRO - LEFT */}
          <View style={styles.companyCol}>
            {settings.primeproLogoUrl ? (
              <Image src={settings.primeproLogoUrl} style={styles.logoLeft} />
            ) : null}
            <Text style={styles.officeHeading}>USA Headquarters</Text>
            <Text style={styles.companyLine}>{settings.primeproName}</Text>
            <Text style={styles.companyLine}>{settings.primeproAddress}</Text>
            <Text style={styles.companyLine}>{settings.primeproRegistration}</Text>
            <Text style={styles.companyLine}>EIN: {settings.primeproEIN}</Text>
            <Text style={styles.companyLine}>Phone: {settings.primeproPhone}</Text>
            <Text style={styles.companyLine}>Email: {settings.primeproEmail}</Text>
          </View>

          {/* FUELO - RIGHT */}
          <View style={styles.companyColRight}>
            {settings.fueloLogoUrl ? (
              <Image src={settings.fueloLogoUrl} style={styles.logoRight} />
            ) : null}
            <Text style={styles.officeHeading}>India Office</Text>
            <Text style={styles.companyLineRight}>{settings.fueloName}</Text>
            <Text style={styles.companyLineRight}>CIN: {settings.fueloCIN}</Text>
            <Text style={styles.companyLineRight}>GSTIN: {settings.fueloGSTIN}</Text>
            <Text style={styles.companyLineRight}>{settings.fueloAddress}</Text>
            <Text style={styles.companyLineRight}>Phone: {settings.fueloPhone}</Text>
            <Text style={styles.companyLineRight}>Email: {settings.fueloEmail}</Text>
          </View>
        </View>

        {/* TITLE BAR */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>TAX INVOICE</Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Invoice No.</Text>
              <Text style={styles.metaValue}>{props.invoiceNumber}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Invoice Date</Text>
              <Text style={styles.metaValue}>{formatDate(props.invoiceDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{formatDate(props.dueDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={styles.metaValue}>{props.paymentStatus.replace("_", " ")}</Text>
            </View>
          </View>
        </View>

        {/* PACKAGE TITLE BANNER (If specified) */}
        {props.packageTitle ? (
          <View style={styles.packageBanner}>
            <Text style={styles.packageBannerTitle}>{props.packageTitle}</Text>
            {props.packageSubtitle ? (
              <Text style={styles.packageBannerSubtitle}>{props.packageSubtitle}</Text>
            ) : null}
          </View>
        ) : null}

        {/* BILL TO */}
        <View style={styles.billToBox}>
          <Text style={styles.sectionLabel}>Bill To</Text>
          <Text style={styles.billToName}>{props.customer.companyName}</Text>
          {props.customer.contactPerson ? (
            <Text style={styles.billToLine}>Attn: {props.customer.contactPerson}</Text>
          ) : null}
          <Text style={styles.billToLine}>{props.customer.billingAddress}</Text>
          <Text style={styles.billToLine}>
            {props.customer.city}, {props.customer.state} — {props.customer.pincode}
          </Text>
          <Text style={styles.billToLine}>{props.customer.country}</Text>
          <Text style={styles.billToLine}>Phone: {props.customer.phone}</Text>
          {props.customer.email ? (
            <Text style={styles.billToLine}>Email: {props.customer.email}</Text>
          ) : null}
          {props.customer.gstin ? (
            <Text style={styles.billToLine}>GSTIN: {props.customer.gstin}</Text>
          ) : null}
          <Text style={styles.billToLine}>Place of Supply: {props.customer.placeOfSupply}</Text>
        </View>

        {/* SERVICES TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colSno]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colService]}>Service</Text>
            <Text style={[styles.tableHeaderCell, styles.colPackage]}>Package</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Standard Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {props.lineItems.map((item, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, ...(idx % 2 === 1 ? [styles.tableRowAlt] : [])]}
            >
              <Text style={[styles.tableCell, styles.colSno]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, styles.colService]}>{item.categoryName}</Text>
              <Text style={[styles.tableCell, styles.colPackage]}>{item.packageName}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{money(item.rate)}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>{money(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* TOTALS & SPECIAL PACKAGE BREAKDOWN */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Value (Subtotal)</Text>
              <Text style={styles.totalsValue}>{money(props.subtotal)}</Text>
            </View>

            {props.discountAmount > 0 ? (
              <>
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>
                    {props.discountReason || "Special Discount"}
                  </Text>
                  <Text style={styles.discountValue}>- {money(props.discountAmount)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Final Package Price</Text>
                  <Text style={styles.totalsValue}>{money(props.taxableAmount)}</Text>
                </View>
              </>
            ) : null}

            {props.gstEnabled ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>GST @ {props.gstPercent}%</Text>
                <Text style={styles.totalsValue}>{money(props.gstAmount)}</Text>
              </View>
            ) : null}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{money(props.grandTotal)}</Text>
            </View>

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Amount Paid</Text>
              <Text style={styles.totalsValue}>{money(props.amountPaid)}</Text>
            </View>

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Balance Due</Text>
              <Text style={styles.totalsValue}>{money(props.balanceDue)}</Text>
            </View>
          </View>
        </View>

        {/* AMOUNT IN WORDS */}
        <View style={styles.wordsBox}>
          <Text style={styles.wordsLabel}>Amount in Words</Text>
          <Text style={styles.wordsValue}>{props.amountInWords}</Text>
        </View>

        {/* PAYMENT / QR / SIGNATURE */}
        <View style={styles.bottomRow}>
          {/* PAYMENT DETAILS */}
          <View style={styles.paymentCol}>
            <Text style={styles.sectionLabel}>Payment Details</Text>
            <Text style={styles.billToLine}>Method: {props.paymentMethod}</Text>
            {props.upiId ? <Text style={styles.billToLine}>UPI ID: {props.upiId}</Text> : null}
            {props.transactionRef ? (
              <Text style={styles.billToLine}>Ref No.: {props.transactionRef}</Text>
            ) : null}
            {props.paymentTermsText ? (
              <Text style={[styles.billToLine, { marginTop: 2, fontWeight: 700, color: BRAND.greenDark }]}>
                Terms: {props.paymentTermsText.split("\n")[0]}
              </Text>
            ) : null}
          </View>

          {/* QR CODE */}
          <View style={styles.qrCol}>
            {settings.qrCodeUrl ? (
              <>
                <Image src={settings.qrCodeUrl} style={styles.qrImage} />
                <Text style={styles.qrCaption}>Scan to Pay</Text>
              </>
            ) : null}
          </View>

          {/* SIGNATURE */}
          <View style={styles.signCol}>
            {settings.signatureUrl ? (
              <Image src={settings.signatureUrl} style={styles.signatureImg} />
            ) : null}
            <Text style={styles.signatureLine}>{settings.signatoryLine1}</Text>
            <Text style={styles.signatureLine}>{settings.signatoryLine2}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>{settings.footerNote}</Text>
        <Text style={styles.pageNumber}>Page 1 of 2</Text>
      </Page>

      {/* =================================================
          PAGE 2: SCOPE, DELIVERABLES & TERMS
      ================================================= */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.termsTitle}>Package Scope, Deliverables & Terms</Text>

        {/* SPECIAL PACKAGE OFFER SUMMARY (If package or discount is present) */}
        {props.packageTitle || props.discountAmount > 0 ? (
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>
              {props.packageTitle || "Special Package Offer"}
            </Text>
            {props.packageSubtitle ? (
              <Text style={[styles.highlightText, { marginBottom: 3, fontStyle: "italic" }]}>
                {props.packageSubtitle}
              </Text>
            ) : null}
            <Text style={styles.highlightText}>
              Total Value: {money(props.subtotal)}
              {props.discountAmount > 0
                ? `  |  Special Discount: ${money(props.discountAmount)}  |  Final Package Price: ${money(props.taxableAmount)}`
                : ""}
            </Text>
          </View>
        ) : null}

        {/* PAYMENT TERMS */}
        {props.paymentTermsText ? (
          <View style={styles.termsSection}>
            <Text style={styles.termsSectionTitle}>Payment Terms</Text>
            {props.paymentTermsText.split("\n").map((line, i) => (
              <Text key={i} style={styles.termsLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {/* SOCIAL MEDIA PLATFORMS INCLUDED */}
        {platformBullets.length > 0 ? (
          <View style={styles.termsSection}>
            <Text style={styles.termsSectionTitle}>Social Media Platforms Included</Text>
            {platformBullets.map((platform, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{platform}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* PACKAGE INCLUSIONS & DELIVERABLES */}
        {inclusionBullets.length > 0 ? (
          <View style={styles.termsSection}>
            <Text style={styles.termsSectionTitle}>Package Includes & Deliverables</Text>
            {inclusionBullets.map((item, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* SPECIAL OFFER NOTE */}
        {props.specialOfferNote ? (
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>{props.specialOfferNote}</Text>
          </View>
        ) : null}

        {/* CATEGORY TERMS */}
        {props.termsSections.map((section) => (
          <View key={section.title} style={styles.termsSection}>
            <Text style={styles.termsSectionTitle}>{section.title}</Text>
            {section.lines.map((line, i) => (
              <Text key={i} style={styles.termsLine}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        {/* GENERAL TERMS */}
        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>General Terms</Text>
          {props.generalTerms.map((line, i) => (
            <Text key={i} style={styles.termsLine}>
              {line}
            </Text>
          ))}
        </View>

        {/* PAGE 2 COMPANY FOOTER */}
        <View style={styles.termsFooterCols}>
          {/* PRIMEPRO */}
          <View style={styles.termsFooterCol}>
            <Text style={styles.termsFooterName}>{settings.primeproName}</Text>
            <Text style={styles.termsFooterLine}>{settings.primeproAddress}</Text>
            <Text style={styles.termsFooterLine}>{settings.primeproEmail}</Text>
          </View>

          {/* FUELO */}
          <View style={[styles.termsFooterCol, { alignItems: "flex-end" }]}>
            <Text style={styles.termsFooterName}>{settings.fueloName}</Text>
            <Text style={[styles.termsFooterLine, { textAlign: "right" }]}>
              {settings.fueloAddress}
            </Text>
            <Text style={[styles.termsFooterLine, { textAlign: "right" }]}>
              GSTIN: {settings.fueloGSTIN}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>{settings.footerNote}</Text>
        <Text style={styles.pageNumber}>Page 2 of 2</Text>
      </Page>
    </Document>
  );
}