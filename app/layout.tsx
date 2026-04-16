import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The UK Mum's Money Reset — Budget Tracker",
  description: "Interactive budget tracker for UK families 2026/2027",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}