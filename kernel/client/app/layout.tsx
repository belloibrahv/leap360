import "@/app/globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["100", "200", "300", "400"],
  subsets: ["latin"],
});

export const metadata: Metadata = { title: "LEAP360" };

const Layout = ({children}: Readonly<{children: ReactNode}>) => (
  <html lang="en" className="w-full h-full">
    <body className={`w-full h-full antialiased ${roboto.className}`}>
      {children}
    </body>
  </html>
);

export default Layout;
