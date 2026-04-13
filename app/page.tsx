"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, TrendingUp, Users, Truck, Bell, Calendar, 
  Search, ChevronDown, ArrowUpRight, ShieldAlert, 
  Package, Clock, CheckCircle2, DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState(true);
  
  // Meta de la Institución
  const META_MENSUAL = 60000;
  const gananciaActual = 12450; // Placeholder para Supabase
  const progresoMeta = (gananciaActual / META_MENSUAL) * 100;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER INSTITUCIONAL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">
            Consolidación <span className="text-emerald-500">2026</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 tracking-[0.3em] uppercase mt-2 italic">
            Misión: Soberanía e Inteligencia Logística
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
            <Calendar size={14} />
            Periodo: Abril
            <ChevronDown size={14} />
          </button>
        </div>
      </header>

      {/* MÉTRICAS DE PODER (Finanzas y Meta) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Meta Mensual */}
        <div className="lg:col-span-2 p-8 bg-zinc-900 dark:bg-white rounded-[2.5rem] text-white dark:text-zinc-900 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={120} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60">Objetivo de la Institución</h3>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-5xl font-black tracking-tighter italic">${gananciaActual.toLocaleString()}</span>
              <span className="text-xl font-bold opacity-40">/ ${META_MENSUAL.toLocaleString()}</span>
            </div>
            
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Progreso Mensual</span>
                <span>{progresoMeta.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-white/10 dark:bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progresoMeta}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Métrica Secundaria: Margen Promedio */}
        <div className="p-8 bg-emerald-500 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between italic">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/20 rounded-2xl"><DollarSign size={24} /></div>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Margen de Brokerage</p>
            <h3 className="text-4xl font-black tracking-tighter">18.4%</h3>
          </div>
        </div>
      </section>

      {/* ESTADO OPERATIVO (Embarques) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Package className="text-zinc-400" size={18} />
          <h2 className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.2em]">Flujo de Operación</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard label="Pendientes" value="04" icon={<Clock />} color="amber" />
          <StatusCard label="En Tránsito" value="12" icon={<Truck />} color="blue" />
          <StatusCard label="Por Facturar" value="07" icon={<FileText />} color="emerald" />
          <StatusCard label="Finalizados" value="48" icon={<CheckCircle2 />} color="zinc" />
        </div>
      </section>

      {/* ALERTAS Y PUNTOS CIEGOS */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-emerald-500" size={18} />
              <h2 className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Alertas Críticas</h2>
            </div>
            <button className="text-[9px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors">Ver todas</button>
          </div>
          
          <div className="space-y-3">
            <AlertItem 
              titulo="Seguro Vencido: Transportes Mexicanos" 
              sub="El transportista no puede cargar hasta actualizar póliza."
              urgencia="critica"
            />
            <AlertItem 
              titulo="Embarque #1024 - Retraso en Carga" 
              sub="Planta Monterrey reporta 3 horas de demora."
              urgencia="preventiva"
            />
          </div>
        </div>

        {/* RESUMEN DE CLIENTES TOP */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
             <Users size={16} className="text-emerald-500" /> Clientes Estratégicos
          </h2>
          <div className="space-y-4">
             {['Logística Industrial SA', 'Aceros del Norte', 'Distribuidora Regia'].map((cliente, i) => (
               <div key={i} className="flex justify-between items-center group cursor-pointer">
                 <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-500 transition-colors">{cliente}</span>
                 <span className="text-[10px] font-black text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">{(4 - i) * 12} Viajes</span>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// COMPONENTES AUXILIARES CON ESTÉTICA TÉCNICA
function StatusCard({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
  const colors: any = {
    amber: "text-amber-500 bg-amber-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    zinc: "text-zinc-400 bg-zinc-400/10"
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-400 transition-all group">
      <div className={cn("p-2 w-fit rounded-lg mb-4 transition-transform group-hover:scale-110", colors[color])}>
        {icon}
      </div>
      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter italic">{value}</h4>
    </div>
  );
}

function AlertItem({ titulo, sub, urgencia }: { titulo: string, sub: string, urgencia: 'critica' | 'preventiva' }) {
  return (
    <div className={cn(
      "p-4 border rounded-xl flex items-start gap-4 transition-all hover:translate-x-1",
      urgencia === 'critica' 
        ? "bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20" 
        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800"
    )}>
      <div className={cn("mt-1", urgencia === 'critica' ? "text-red-500" : "text-amber-500")}>
        <ShieldAlert size={16} />
      </div>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-tight text-zinc-900 dark:text-white">{titulo}</h4>
        <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}