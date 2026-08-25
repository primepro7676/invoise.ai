import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrimePro × Fuelo | Tax Invoice System",
  description: "Professional tax invoice generator and billing dashboard for PrimePro Technologies AI LLC & Fuelo Technologies OPC Pvt Ltd.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
