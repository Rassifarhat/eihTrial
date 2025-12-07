import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinical PDF Filler",
  description: "Fill PDF forms with clinical data extracted from images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
