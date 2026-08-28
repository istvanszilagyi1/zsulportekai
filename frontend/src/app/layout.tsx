import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Zsül Portékái Webshop",
  description: "Egyedi kézműves termékek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}