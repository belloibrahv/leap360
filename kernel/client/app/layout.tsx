import "@/app/globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import AuthProvider from "@/core/auth/providers/AuthProvider";

export const metadata: Metadata = { title: "LEAP360" };

const Layout = ({children}: Readonly<{children: ReactNode}>) => (
  <html lang="en" className="w-full h-full">
    <body className="w-full h-full antialiased">
      <AuthProvider>
        {children}
      </AuthProvider>
    </body>
  </html>
);

export default Layout;
