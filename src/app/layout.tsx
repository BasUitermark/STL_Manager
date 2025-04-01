import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initDb } from "@/lib/metadata/initDatabase";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Initialize the database
initDb().catch(console.error);

export const metadata = {
  title: "STL File Manager",
  description: "Manage your STL files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
