'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileCheck, Truck, TrendingUp, Settings, Users, LogOut, Route
} from 'lucide-react';
import { cn } from '../lib/utils';
// import { supabase } from '../lib/supabase/client'; // Descomentar cuando integremos el logout real

const menuItems = [
  { name: 'Inicio', href: '/', icon: LayoutDashboard },
  { name: 'Embarques', href: '/embarques', icon: FileCheck },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Transportistas', href: '/transportistas', icon: Truck },
  { name: 'Tarifas', href: '/tarifas', icon: Route },
  { name: 'Finanzas', href: '/finanzas', icon: TrendingUp },
];
export default function Sidebar() {
  const pathname = usePathname();
  
  // NUEVA LÍNEA: Si estamos en la ruta de login, destruye el Sidebar
  if (pathname === '/login') return null;

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <aside className="w-64 h-full shrink-0 border-r border-slate-200 bg-white shadow-sm z-50 flex flex-col p-6">
      {/* Cabecera del Sidebar (Logo Institucional) */}
      <div className="mb-10 px-2 flex flex-col items-start select-none">
        <div className="flex items-center gap-2 mb-1">
          <Truck size={28} className="text-blue-600" strokeWidth={2.5} />
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
            Fleet<span className="text-blue-600">Force</span>
          </h1>
        </div>
        <p className="text-[9px] text-slate-500 font-black uppercase ml-1 tracking-[0.2em]">
          Brokerage 2026
        </p>
      </div>

      {/* Navegación Principal */}
      <nav className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-bold border border-blue-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              )}
            >
              <item.icon size={20} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"} />
              <span className="text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar (Configuración y Salida) */}
      <div className="mt-auto pt-6 border-t border-slate-100">
         <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Settings size={20} className="text-slate-400" />
            <span className="text-sm font-medium">Configuración</span>
         </button>
         <button className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all mt-1">
            <LogOut size={20} className="text-red-400" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
         </button>
      </div>

  </aside></div>
    
  );
}