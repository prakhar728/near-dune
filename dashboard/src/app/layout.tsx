import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEAR Analytics — On-chain Dashboard",
  description:
    "Full on-chain analytics for NEAR Protocol — powered by Dune Analytics. Track transactions, wallets, staking, NFTs, bridges and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0b0f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
