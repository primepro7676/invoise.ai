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

  // ===================================================
  // PRIMEPRO LOGO
  // ONLY THIS LOGO POSITION HAS BEEN CHANGED
  // ===================================================
  logoLeft: {
    width: 130,
    height: 52,
    objectFit: "contain",
    alignSelf: "flex-start",

    /*
     * Moves ONLY the PrimePro logo to align
     * its visible left edge with USA Headquarters.
     */
    marginLeft: -34,

    marginBottom: 4,
  },

  // ===================================================
  // FUELO LOGO
  // UNCHANGED
  // ===================================================
  logoRight: {
    width: 130,
    height: 52,
    objectFit: "contain",
    alignSelf: "flex-end",
    marginBottom: 4,
  },

  // ===================================================
  // OFFICE HEADINGS
  // ONLY THESE TWO ARE BOLD
  // ===================================================
  officeHeading: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND.navy,
    marginBottom: 1,
  },

  // ===================================================
  // NORMAL COMPANY TEXT
  // ===================================================
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
    marginBottom: 10,
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
  // BILL TO
  // ===================================================
  billToBox: {
    borderWidth: 1,
    borderColor: BRAND.greenBorder,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    width: "55%",
  },

  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND.green,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  billToName: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND.navy,
    marginBottom: 2,
  },

  billToLine: {
    fontSize: 8,
    color: BRAND.navy,
    lineHeight: 1.4,
  },

  // ===================================================
  // TABLE
  // ===================================================
  table: {
    marginBottom: 8,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.green,
    paddingVertical: 6,
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
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2f2eb",
  },

  tableRowAlt: {
    backgroundColor: BRAND.greenLight,
  },

  tableCell: {
    fontSize: 8,
    color: BRAND.navy,
  },

  colSno: {
    width: "6%",
  },

  colService: {
    width: "28%",
  },

  colPackage: {
    width: "16%",
  },

  colQty: {
    width: "8%",
    textAlign: "center",
  },

  colRate: {
    width: "14%",
    textAlign: "right",
  },

  colGst: {
    width: "10%",
    textAlign: "center",
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
    marginBottom: 8,
  },

  totalsBox: {
    width: "48%",
  },

  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2f2eb",
  },

  totalsLabel: {
    fontSize: 8.5,
    color: BRAND.gray,
  },

  totalsValue: {
    fontSize: 8.5,
    color: BRAND.navy,
    fontWeight: 700,
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: BRAND.green,
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 4,
  },

  grandTotalLabel: {
    fontSize: 9.5,
    fontWeight: 700,
    color: BRAND.white,
  },

  grandTotalValue: {
    fontSize: 10.5,
    fontWeight: 700,
    color: BRAND.white,
  },

  // ===================================================
  // AMOUNT IN WORDS
  // ===================================================
  wordsBox: {
    backgroundColor: BRAND.greenLight,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },

  wordsLabel: {
    fontSize: 7,
    color: BRAND.gray,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  wordsValue: {
    fontSize: 8.5,
    color: BRAND.navy,
    fontWeight: 700,
  },

  // ===================================================
  // PAYMENT / QR / SIGNATURE
  // ===================================================
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
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
    width: 64,
    height: 64,
    marginBottom: 4,
  },

  qrCaption: {
    fontSize: 6.5,
    color: BRAND.gray,
    textAlign: "center",
  },

  signatureImg: {
    width: 90,
    height: 34,
    objectFit: "contain",
    marginBottom: 2,
  },

  signatureLine: {
    fontSize: 7.5,
    color: BRAND.navy,
    textAlign: "right",
    lineHeight: 1.4,
  },

  // ===================================================
  // FOOTER
  // ===================================================
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 7,
    color: BRAND.gray,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.greenBorder,
    paddingTop: 6,
  },

  pageNumber: {
    position: "absolute",
    bottom: 18,
    right: 32,
    fontSize: 7,
    color: BRAND.gray,
  },

  // ===================================================
  // PAGE 2
  // ===================================================
  termsTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: BRAND.greenDark,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  termsSection: {
    marginBottom: 12,
  },

  termsSectionTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    color: BRAND.white,
    backgroundColor: BRAND.green,
    padding: 5,
    borderRadius: 3,
    marginBottom: 5,
    textTransform: "uppercase",
  },

  termsLine: {
    fontSize: 8.3,
    color: BRAND.navy,
    lineHeight: 1.7,
    marginBottom: 1,
  },

  termsFooterCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.greenBorder,
  },

  termsFooterCol: {
    width: "48%",
  },

  termsFooterName: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND.greenDark,
    marginBottom: 2,
  },

  termsFooterLine: {
    fontSize: 7.3,
    color: BRAND.gray,
    lineHeight: 1.5,
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
// MONEY
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

  return (
    <Document title={`Tax Invoice ${props.invoiceNumber}`}>

      {/* =================================================
          PAGE 1
      ================================================= */}
      <Page size="A4" style={styles.page}>

        {/* =================================================
            HEADER
        ================================================= */}
        <View style={styles.headerRow}>

          {/* ===============================================
              PRIMEPRO - LEFT
          =============================================== */}
          <View style={styles.companyCol}>

            {/* PRIMEPRO LOGO
                Only this logo has been moved */}
            {settings.primeproLogoUrl ? (
              <Image
                src={settings.primeproLogoUrl}
                style={styles.logoLeft}
              />
            ) : null}

            {/* ONLY THIS HEADING IS BOLD */}
            <Text style={styles.officeHeading}>
              USA Headquarters
            </Text>

            {/* NORMAL TEXT */}
            <Text style={styles.companyLine}>
              {settings.primeproName}
            </Text>

            <Text style={styles.companyLine}>
              {settings.primeproAddress}
            </Text>

            <Text style={styles.companyLine}>
              {settings.primeproRegistration}
            </Text>

            <Text style={styles.companyLine}>
              EIN: {settings.primeproEIN}
            </Text>

            <Text style={styles.companyLine}>
              Phone: {settings.primeproPhone}
            </Text>

            <Text style={styles.companyLine}>
              Email: {settings.primeproEmail}
            </Text>

          </View>


          {/* ===============================================
              FUELO - RIGHT
              POSITION UNCHANGED
          =============================================== */}
          <View style={styles.companyColRight}>

            {settings.fueloLogoUrl ? (
              <Image
                src={settings.fueloLogoUrl}
                style={styles.logoRight}
              />
            ) : null}

            {/* ONLY THIS HEADING IS BOLD */}
            <Text style={styles.officeHeading}>
              India Office
            </Text>

            {/* NORMAL TEXT */}
            <Text style={styles.companyLineRight}>
              {settings.fueloName}
            </Text>

            <Text style={styles.companyLineRight}>
              CIN: {settings.fueloCIN}
            </Text>

            <Text style={styles.companyLineRight}>
              GSTIN: {settings.fueloGSTIN}
            </Text>

            <Text style={styles.companyLineRight}>
              {settings.fueloAddress}
            </Text>

            <Text style={styles.companyLineRight}>
              Phone: {settings.fueloPhone}
            </Text>

            <Text style={styles.companyLineRight}>
              Email: {settings.fueloEmail}
            </Text>

          </View>

        </View>


        {/* =================================================
            TAX INVOICE TITLE
        ================================================= */}
        <View style={styles.titleBar}>

          <Text style={styles.titleText}>
            TAX INVOICE
          </Text>

          <View style={styles.metaGrid}>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>
                Invoice No.
              </Text>

              <Text style={styles.metaValue}>
                {props.invoiceNumber}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>
                Invoice Date
              </Text>

              <Text style={styles.metaValue}>
                {formatDate(props.invoiceDate)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>
                Due Date
              </Text>

              <Text style={styles.metaValue}>
                {formatDate(props.dueDate)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>
                Status
              </Text>

              <Text style={styles.metaValue}>
                {props.paymentStatus.replace("_", " ")}
              </Text>
            </View>

          </View>

        </View>


        {/* =================================================
            BILL TO
        ================================================= */}
        <View style={styles.billToBox}>

          <Text style={styles.sectionLabel}>
            Bill To
          </Text>

          <Text style={styles.billToName}>
            {props.customer.companyName}
          </Text>

          {props.customer.contactPerson ? (
            <Text style={styles.billToLine}>
              Attn: {props.customer.contactPerson}
            </Text>
          ) : null}

          <Text style={styles.billToLine}>
            {props.customer.billingAddress}
          </Text>

          <Text style={styles.billToLine}>
            {props.customer.city}, {props.customer.state} —{" "}
            {props.customer.pincode}
          </Text>

          <Text style={styles.billToLine}>
            {props.customer.country}
          </Text>

          <Text style={styles.billToLine}>
            Phone: {props.customer.phone}
          </Text>

          {props.customer.email ? (
            <Text style={styles.billToLine}>
              Email: {props.customer.email}
            </Text>
          ) : null}

          {props.customer.gstin ? (
            <Text style={styles.billToLine}>
              GSTIN: {props.customer.gstin}
            </Text>
          ) : null}

          <Text style={styles.billToLine}>
            Place of Supply: {props.customer.placeOfSupply}
          </Text>

        </View>


        {/* =================================================
            SERVICES TABLE
        ================================================= */}
        <View style={styles.table}>

          <View style={styles.tableHeader}>

            <Text style={[styles.tableHeaderCell, styles.colSno]}>
              #
            </Text>

            <Text style={[styles.tableHeaderCell, styles.colService]}>
              Service
            </Text>

            <Text style={[styles.tableHeaderCell, styles.colPackage]}>
              Package
            </Text>

            <Text style={[styles.tableHeaderCell, styles.colQty]}>
              Qty
            </Text>

            <Text style={[styles.tableHeaderCell, styles.colRate]}>
              Rate
            </Text>

            <Text style={[styles.tableHeaderCell, styles.colGst]}>
              GST
            </Text>

            <Text style={[styles.tableHeaderCell, styles.colAmount]}>
              Amount
            </Text>

          </View>


          {props.lineItems.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                ...(idx % 2 === 1
                  ? [styles.tableRowAlt]
                  : []),
              ]}
            >

              <Text style={[styles.tableCell, styles.colSno]}>
                {idx + 1}
              </Text>

              <Text style={[styles.tableCell, styles.colService]}>
                {item.categoryName}
              </Text>

              <Text style={[styles.tableCell, styles.colPackage]}>
                {item.packageName}
              </Text>

              <Text style={[styles.tableCell, styles.colQty]}>
                {item.quantity}
              </Text>

              <Text style={[styles.tableCell, styles.colRate]}>
                {money(item.rate)}
              </Text>

              <Text style={[styles.tableCell, styles.colGst]}>
                {props.gstEnabled
                  ? `${item.gstPercent}%`
                  : "—"}
              </Text>

              <Text style={[styles.tableCell, styles.colAmount]}>
                {money(item.total)}
              </Text>

            </View>
          ))}

        </View>


        {/* =================================================
            TOTALS
        ================================================= */}
        <View style={styles.totalsWrap}>

          <View style={styles.totalsBox}>

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Subtotal
              </Text>

              <Text style={styles.totalsValue}>
                {money(props.subtotal)}
              </Text>
            </View>

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Discount
              </Text>

              <Text style={styles.totalsValue}>
                - {money(props.discountAmount)}
              </Text>
            </View>

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Taxable Amount
              </Text>

              <Text style={styles.totalsValue}>
                {money(props.taxableAmount)}
              </Text>
            </View>

            <View style={styles.totalsRow}>

              <Text style={styles.totalsLabel}>
                GST{" "}
                {props.gstEnabled
                  ? `@ ${props.gstPercent}%`
                  : "(not applied)"}
              </Text>

              <Text style={styles.totalsValue}>
                {money(props.gstAmount)}
              </Text>

            </View>

            <View style={styles.grandTotalRow}>

              <Text style={styles.grandTotalLabel}>
                Grand Total
              </Text>

              <Text style={styles.grandTotalValue}>
                {money(props.grandTotal)}
              </Text>

            </View>

            <View style={styles.totalsRow}>

              <Text style={styles.totalsLabel}>
                Amount Paid
              </Text>

              <Text style={styles.totalsValue}>
                {money(props.amountPaid)}
              </Text>

            </View>

            <View style={styles.totalsRow}>

              <Text style={styles.totalsLabel}>
                Balance Due
              </Text>

              <Text style={styles.totalsValue}>
                {money(props.balanceDue)}
              </Text>

            </View>

          </View>

        </View>


        {/* =================================================
            AMOUNT IN WORDS
        ================================================= */}
        <View style={styles.wordsBox}>

          <Text style={styles.wordsLabel}>
            Amount in Words
          </Text>

          <Text style={styles.wordsValue}>
            {props.amountInWords}
          </Text>

        </View>


        {/* =================================================
            PAYMENT / QR / SIGNATURE
        ================================================= */}
        <View style={styles.bottomRow}>

          {/* PAYMENT DETAILS */}
          <View style={styles.paymentCol}>

            <Text style={styles.sectionLabel}>
              Payment Details
            </Text>

            <Text style={styles.billToLine}>
              Method: {props.paymentMethod}
            </Text>

            {props.upiId ? (
              <Text style={styles.billToLine}>
                UPI ID: {props.upiId}
              </Text>
            ) : null}

            {props.transactionRef ? (
              <Text style={styles.billToLine}>
                Reference No.: {props.transactionRef}
              </Text>
            ) : null}

          </View>


          {/* QR CODE */}
          <View style={styles.qrCol}>

            {settings.qrCodeUrl ? (
              <>
                <Image
                  src={settings.qrCodeUrl}
                  style={styles.qrImage}
                />

                <Text style={styles.qrCaption}>
                  Scan to Pay
                </Text>
              </>
            ) : null}

          </View>


          {/* SIGNATURE */}
          <View style={styles.signCol}>

            {settings.signatureUrl ? (
              <Image
                src={settings.signatureUrl}
                style={styles.signatureImg}
              />
            ) : null}

            <Text style={styles.signatureLine}>
              {settings.signatoryLine1}
            </Text>

            <Text style={styles.signatureLine}>
              {settings.signatoryLine2}
            </Text>

          </View>

        </View>


        {/* FOOTER */}
        <Text style={styles.footer}>
          {settings.footerNote}
        </Text>

        <Text style={styles.pageNumber}>
          Page 1 of 2
        </Text>

      </Page>


      {/* =================================================
          PAGE 2
      ================================================= */}
      <Page size="A4" style={styles.page}>

        <Text style={styles.termsTitle}>
          Terms & Conditions
        </Text>


        {props.termsSections.map((section) => (
          <View
            key={section.title}
            style={styles.termsSection}
          >

            <Text style={styles.termsSectionTitle}>
              {section.title}
            </Text>

            {section.lines.map((line, i) => (
              <Text
                key={i}
                style={styles.termsLine}
              >
                {line}
              </Text>
            ))}

          </View>
        ))}


        {/* GENERAL TERMS */}
        <View style={styles.termsSection}>

          <Text style={styles.termsSectionTitle}>
            General Terms
          </Text>

          {props.generalTerms.map((line, i) => (
            <Text
              key={i}
              style={styles.termsLine}
            >
              {line}
            </Text>
          ))}

        </View>


        {/* PAGE 2 COMPANY FOOTER */}
        <View style={styles.termsFooterCols}>

          {/* PRIMEPRO */}
          <View style={styles.termsFooterCol}>

            <Text style={styles.termsFooterName}>
              {settings.primeproName}
            </Text>

            <Text style={styles.termsFooterLine}>
              {settings.primeproAddress}
            </Text>

            <Text style={styles.termsFooterLine}>
              {settings.primeproEmail}
            </Text>

          </View>


          {/* FUELO */}
          <View
            style={[
              styles.termsFooterCol,
              {
                alignItems: "flex-end",
              },
            ]}
          >

            <Text style={styles.termsFooterName}>
              {settings.fueloName}
            </Text>

            <Text
              style={[
                styles.termsFooterLine,
                {
                  textAlign: "right",
                },
              ]}
            >
              {settings.fueloAddress}
            </Text>

            <Text
              style={[
                styles.termsFooterLine,
                {
                  textAlign: "right",
                },
              ]}
            >
              GSTIN: {settings.fueloGSTIN}
            </Text>

          </View>

        </View>


        {/* FOOTER */}
        <Text style={styles.footer}>
          {settings.footerNote}
        </Text>

        <Text style={styles.pageNumber}>
          Page 2 of 2
        </Text>

      </Page>

    </Document>
  );
}