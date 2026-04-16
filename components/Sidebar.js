'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase/client'; 
import { 
  LayoutDashboard, FileCheck, Truck, TrendingUp, Settings, Users, LogOut, Route,
  ChevronUp, X, Menu, Sun, Moon, KeyRound, Lock, Loader2, ReceiptText, Scale, Wrench, Image as ImageIcon, Building2
} from 'lucide-react';

const menuItems = [
  { name: 'Inicio', href: '/', icon: LayoutDashboard },
  { name: 'Embarques', href: '/embarques', icon: FileCheck },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Transportistas', href: '/transportistas', icon: Truck },
  { name: 'Ubicaciones', href: '/informacion', icon: Building2 },
  { name: 'Facturas', href: '/facturas', icon: ReceiptText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  
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

  const cambiarContrasena = async (e) => {
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
      setPasswordActual('');
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const esRutaDeImpresion = pathname.includes('/embarques/') && pathname.split('/').length > 2;
  if (pathname === '/login' || esRutaDeImpresion || !mounted) return null;

  return (
    <>
      {/* BOTÓN MÓVIL */}
      <button onClick={() => setIsMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm text-slate-600 hover:text-slate-900">
        <Menu size={24} />
      </button>

      {/* OVERLAY MÓVIL */}
      {isMobileOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        w-64 h-screen p-6 
        border-r border-slate-100 dark:border-slate-800 
        bg-slate-50/50 dark:bg-slate-950 
        flex flex-col gap-2 shrink-0 transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0 bg-white' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* LOGO SECCIÓN (Estilo FleetForce Regular) */}
        <div className="mb-8 px-2 flex flex-col items-start select-none">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={28} className="text-emerald-500" strokeWidth={2.5} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Fleet<span className="text-slate-500 font-medium">Force</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gestión 2026</p>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold tracking-wide">ADMINISTRADOR</span>
          </div>
        </div>

        {/* NAVEGACIÓN (Clean & Modern) */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group font-semibold text-[15px] ${
                  isActive ? 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors'} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER Y CONFIGURACIÓN */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/50">
          <p className="text-[10px] font-bold text-slate-400 mb-4 px-2 italic tracking-wider">"VERSION BETA 1.0.1"</p>
          
          <div className="relative">
            {isConfigOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 flex flex-col gap-1 z-50 animate-in slide-in-from-bottom-2 duration-200">
                
                <Link 
                  href="/configuracion" 
                  onClick={() => setIsConfigOpen(false)} 
                  className="w-full flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <ImageIcon size={16} className="text-slate-400" /> Insertar Logo
                </Link>

                <button onClick={toggleTheme} className="w-full flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                  {theme === 'dark' ? <Sun size={16} className="text-slate-400" /> : <Moon size={16} className="text-slate-400" />}
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </button>

                <button onClick={() => { setMostrarModalPassword(true); setIsConfigOpen(false); }} className="w-full flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                  <KeyRound size={16} className="text-slate-400" /> Seguridad
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                  <LogOut size={16} className="text-red-500" /> Cerrar Sesión
                </button>
              </div>
            )}

            <button onClick={() => setIsConfigOpen(!isConfigOpen)} 
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                isConfigOpen ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' 
                : 'bg-transparent border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings size={16} className={isConfigOpen ? "animate-spin text-slate-500" : "text-slate-400"} /> 
                Configuración
              </div>
              {isConfigOpen ? <X size={16} className="text-slate-400" /> : <ChevronUp size={16} className="text-slate-400" />}
            </button>
          </div>
        </div>
      </aside>

      {/* MODAL CONTRASEÑA (Limpiado y corporativo) */}
      {mostrarModalPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setMostrarModalPassword(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Lock size={20}/></div>
              Seguridad
            </h2>
            <form onSubmit={cambiarContrasena} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Contraseña Actual</label>
                <input type="password" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white transition-all" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Nueva Contraseña</label>
                <input type="password" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white transition-all" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Confirmar Contraseña</label>
                <input type="password" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white transition-all" value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)} />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setMostrarModalPassword(false)} className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
                <button type="submit" disabled={loadingPassword} className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2">
                  {loadingPassword ? <Loader2 className="animate-spin" size={16} /> : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}