import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Crea Caps — Gorras personalizadas",
    template: "%s | Crea Caps",
  },
  description:
    "Gorras completamente personalizables",
  icons: {
    icon: [{ url: "/crea-caps-logo.png", type: "image/png" }],
    apple: [{ url: "/crea-caps-logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <ReactQueryProvider>
          <CartProvider>{children}</CartProvider>
        </ReactQueryProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
