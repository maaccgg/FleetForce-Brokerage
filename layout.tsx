import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FleetForce | Institución Logística",
  description: "Sistema de gestión de brokerage y transporte",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
        {children}
      </body>
    </html>
  );
}