import React from "react";
import Sidebar from "../components/Sidebar";
import "./globals.css";
export const metadata = {
  title: 'FleetForce | Brokerage',
  description: 'Institución Logística - Consolidación 2026',
};

type NewType = {
  children: React.ReactNode;
};

export default function RootLayout({
  children,
}: NewType) {
  return (
    <html lang="es">
      <body className="antialiased flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
        
        {/* Columna Izquierda: Sidebar Fijo e inamovible */}
          <Sidebar />

        
        {/* Columna Derecha: Contenido Flexible (El min-w-0 evita que tablas anchas rompan el diseño) */}
        <main className="flex-1 h-full min-w-0 overflow-y-auto p-8 relative">
          {children}
        </main>

      </body>
    </html>
  );
}