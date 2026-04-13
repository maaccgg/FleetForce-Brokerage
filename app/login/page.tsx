"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { Truck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorLogin(null);

    // Conexión real con Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setErrorLogin("Credenciales incorrectas o acceso denegado.");
      setLoading(false);
      return;
    }

    // Si es exitoso, entra a la Institución (Ruta raíz)
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden w-full">
      
      <div className="max-w-md w-full relative z-10 bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-xl">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-4">
            <Truck size={40} className="text-blue-600" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase italic mb-2">
            Fleet<span className="text-blue-600">Force</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Acceso Operativo
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-[18px] text-slate-400" size={14} />
                <input 
                  type="email" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 pl-12 p-3.5 rounded-2xl text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all lowercase"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-[18px] text-slate-400" size={16} />
                <input 
                  type="password" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 pl-12 p-3.5 rounded-2xl text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {errorLogin && (
            <div className="text-red-600 text-[10px] uppercase tracking-widest font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-center animate-in fade-in">
              {errorLogin}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}