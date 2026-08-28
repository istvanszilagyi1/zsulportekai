import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const logoUrl =
  'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';

export const metadata: Metadata = {
  title: "Zsül Portékái Webshop",
  description: "Egyedi kézműves termékek",
  icons: {
    icon: logoUrl,
  },
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