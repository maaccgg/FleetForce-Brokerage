'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase/client'; 
import { 
  LayoutDashboard, FileCheck, Truck, TrendingUp, Settings, Users, LogOut, Route,
  ChevronUp, X, Menu, Sun, Moon, KeyRound, Lock, Loader2, ReceiptText, Scale, Wrench 
} from 'lucide-react';

const menuItems = [
  { name: 'Inicio', href: '/', icon: LayoutDashboard },
  { name: 'Embarques', href: '/embarques', icon: FileCheck },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Transportistas', href: '/transportistas', icon: Truck },
  { name: 'Facturas', href: '/facturas', icon: ReceiptText },
  { name: 'Tarifas', href: '/tarifas', icon: Route },
  { name: 'Información', href: '/informacion', icon: Sun },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Estados de Seguridad
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const cambiarContrasena = async (e: FormEvent) => {
    e.preventDefault();
    if (nuevaPassword !== confirmarPassword) return alert("Las contraseñas no coinciden.");
    setLoadingPassword(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session?.user?.email || '',
        password: passwordActual,
      });

      if (authError) throw new Error("Contraseña actual incorrecta.");

      const { error: updateError } = await supabase.auth.updateUser({ password: nuevaPassword });
      if (updateError) throw updateError;

      alert("Contraseña actualizada con éxito.");
      setMostrarModalPassword(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const esRutaDeImpresion = pathname.includes('/embarques/') && pathname.split('/').length > 2;
  if (pathname === '/login' || esRutaDeImpresion || !mounted) return null;

  return (
    <>
      <button onClick={() => setIsMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md">
        <Menu size={24} className="text-slate-600 dark:text-slate-300" />
      </button>

      {isMobileOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        w-64 h-screen p-6 
        border-r border-slate-200 dark:border-slate-800 
        bg-slate-50 dark:bg-slate-950 
        flex flex-col gap-2 shrink-0 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo Sección */}
        <div className="mb-10 px-2 flex flex-col items-start select-none">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={28} className="text-emerald-500" strokeWidth={2.5} />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic uppercase">
              Fleet<span className="text-slate-400 dark:text-slate-600 font-bold">Force</span>
            </h1>
          </div>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest ml-1">Gestión 2026</p>
        </div>

        {/* Navegación - Todas las pestañas visibles */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  isActive ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-blue-600' : 'group-hover:text-blue-600 transition-colors'} />
                <span className="text-sm font-bold uppercase tracking-tighter italic">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer y Configuración */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/50">
          <div className="relative">
            {isConfigOpen && (
              <div className="absolute bottom-full left-0 mb-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 animate-in slide-in-from-bottom-2 duration-200">
                <button onClick={toggleTheme} className="w-full flex items-center justify-between text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase">
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                </button>
                <button onClick={() => setMostrarModalPassword(true)} className="w-full flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase">
                  <KeyRound size={14} /> Seguridad
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase">
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </div>
            )}
            <button onClick={() => setIsConfigOpen(!isConfigOpen)} 
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isConfigOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-transparent border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Settings size={15} className={isConfigOpen ? "animate-spin" : ""} /> Configuración
              </div>
              {isConfigOpen ? <X size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Contraseña */}
      {mostrarModalPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMostrarModalPassword(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 dark:text-white italic uppercase mb-6 flex items-center gap-2">
              <Lock className="text-emerald-500" size={20}/> Seguridad
            </h2>
            <form onSubmit={cambiarContrasena} className="space-y-4">
              <input type="password" required placeholder="Clave Actual" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-sm outline-none focus:border-emerald-500 dark:text-white" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} />
              <input type="password" required placeholder="Nueva Clave" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-sm outline-none focus:border-emerald-500 dark:text-white" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} />
              <button type="submit" disabled={loadingPassword} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest">
                {loadingPassword ? "Procesando..." : "Actualizar Acceso"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}