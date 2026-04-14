"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin, DollarSign, Save, Loader2, Search, BookOpen, X } from "lucide-react";
import { supabase } from "../../../lib/supabase/client"; 

export default function NuevoEmbarque() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Catálogos
  const [clientes, setClientes] = useState<any[]>([]);
  const [transportistas, setTransportistas] = useState<any[]>([]);
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [tarifasCatalogo, setTarifasCatalogo] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    folio: "",
    ejecutivo: "",
    cliente_id: "",
    transportista_id: "",
    unidad: "",
    placas: "",
    operador: "",
    origen_direccion: "",
    origen_ciudad: "",
    origen_contacto: "",
    origen_maps_link: "",
    destino_direccion: "",
    destino_ciudad: "",
    destino_contacto: "",
    destino_maps_link: "",
    tipo_carga: "GENERAL",
    peso_lbs: "",
    tarifa: "",
    concepto_servicio: "FLETE TERRESTRE",
    detalle_servicio: "EXPORTACIÓN",
  });

  useEffect(() => {
    async function loadData() {
      const { data: c } = await supabase.from('clientes').select('id, razon_social');
      const { data: t } = await supabase.from('transportistas').select('id, razon_social');
      const { data: d } = await supabase.from('direcciones').select('*').order('nombre_lugar');
      
      // Fetch relacional de tarifas (igual que en tu módulo de tarifas)
      const { data: trf } = await supabase
        .from('tarifas')
        .select('*, transportistas(razon_social), origen:direcciones!origen_id(nombre_lugar), destino:direcciones!destino_id(nombre_lugar)');

      if (c) setClientes(c);
      if (t) setTransportistas(t);
      if (d) setDirecciones(d);
      if (trf) setTarifasCatalogo(trf);
    }
    loadData();
  }, []);

  const handleAutoFill = (id: string, campo: 'origen' | 'destino') => {
    const lugar = direcciones.find(d => d.id === id);
    if (!lugar) return;

    if (campo === 'origen') {
      setFormData(prev => ({
        ...prev,
        origen_direccion: lugar.direccion,
        origen_ciudad: lugar.ciudad,
        origen_contacto: lugar.contacto_nombre || "",
        origen_maps_link: lugar.maps_link || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        destino_direccion: lugar.direccion,
        destino_ciudad: lugar.ciudad,
        destino_contacto: lugar.contacto_nombre || "",
        destino_maps_link: lugar.maps_link || ""
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarEmbarque = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('embarques').insert([{
      empresa_id: user?.id,
      ...formData,
      peso_lbs: formData.peso_lbs ? parseFloat(formData.peso_lbs) : null,
      tarifa: formData.tarifa ? parseFloat(formData.tarifa) : null,
    }]);

    if (!error) router.push("/embarques");
    else {
        alert(error.message);
        setLoading(false);
    }
  };

  // Filtrado inteligente: Solo mostramos tarifas de compra (transportistas) para la carta de instrucciones
  const tarifasTransportistas = tarifasCatalogo.filter(t => t.precio_costo > 0);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Despacho Institucional</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Generación de Carta de Instrucciones</p>
        </div>
        <button 
          onClick={() => router.push('/embarques')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
        >
          <X size={28} />
        </button>
      </div>

      <form onSubmit={guardarEmbarque} className="space-y-6">
        
        {/* BLOQUE 1: IDENTIFICACIÓN Y ASIGNACIÓN */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <input type="text" name="folio" required placeholder="Folio (Ej. TDL004)" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm uppercase font-black" />
             <select name="cliente_id" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold">
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
             </select>
             <select name="transportista_id" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold">
                <option value="">-- Seleccionar Transportista --</option>
                {transportistas.map(t => <option key={t.id} value={t.id}>{t.razon_social}</option>)}
             </select>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Unidad Asignada</label>
               <input type="text" name="unidad" placeholder="Ej. DV53" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm uppercase" />
             </div>
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Placas</label>
               <input type="text" name="placas" placeholder="Ej. pdte" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm uppercase" />
             </div>
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Nombre del Operador</label>
               <input type="text" name="operador" placeholder="Ej. pdte" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm uppercase" />
             </div>
           </div>
        </div>

        {/* BLOQUE 2: LOGÍSTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-2 border-b pb-2">
              <MapPin size={14}/> 1. Punto de Recolección
            </h3>
            <div className="relative">
              <select 
                onChange={(e) => handleAutoFill(e.target.value, 'origen')}
                className="w-full bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-[10px] font-black text-emerald-800 uppercase outline-none focus:ring-2 ring-emerald-500"
              >
                <option value="">-- Directorio de Orígenes --</option>
                {direcciones.filter(d => d.tipo !== 'DESTINO').map(d => (
                  <option key={d.id} value={d.id}>{d.nombre_lugar}</option>
                ))}
              </select>
              <BookOpen className="absolute right-3 top-2.5 text-emerald-400" size={14} />
            </div>
            <input type="text" name="origen_direccion" placeholder="Dirección" value={formData.origen_direccion} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
            <input type="text" name="origen_ciudad" placeholder="Ciudad" value={formData.origen_ciudad} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
            <input type="text" name="origen_contacto" placeholder="Contacto" value={formData.origen_contacto} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2 border-b pb-2">
              <MapPin size={14}/> 2. Punto de Entrega
            </h3>
            <div className="relative">
              <select 
                onChange={(e) => handleAutoFill(e.target.value, 'destino')}
                className="w-full bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-[10px] font-black text-blue-800 uppercase outline-none focus:ring-2 ring-blue-500"
              >
                <option value="">-- Directorio de Destinos --</option>
                {direcciones.filter(d => d.tipo !== 'ORIGEN').map(d => (
                  <option key={d.id} value={d.id}>{d.nombre_lugar}</option>
                ))}
              </select>
              <BookOpen className="absolute right-3 top-2.5 text-blue-400" size={14} />
            </div>
            <input type="text" name="destino_direccion" placeholder="Dirección" value={formData.destino_direccion} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
            <input type="text" name="destino_ciudad" placeholder="Ciudad" value={formData.destino_ciudad} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
            <input type="text" name="destino_contacto" placeholder="Contacto" value={formData.destino_contacto} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
          </div>
        </div>

        {/* BLOQUE 3: FINANZAS */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Peso Estimado (LBS)</label>
            <input type="number" name="peso_lbs" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm" />
          </div>
          
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Tarifa Acordada (USD)</label>
            <select 
              name="tarifa" 
              onChange={handleChange} 
              className="w-full bg-emerald-50 border-emerald-200 border p-3 rounded-xl text-sm font-bold text-emerald-900 outline-none focus:ring-2 ring-emerald-500"
            >
              <option value="">-- Seleccionar Tarifa --</option>
              {tarifasTransportistas.map(t => (
                <option key={t.id} value={t.precio_costo}>
                  ${t.precio_costo} {t.moneda} - {t.transportistas?.razon_social || 'General'} ({t.origen?.nombre_lugar} a {t.destino?.nombre_lugar})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Emitir Instrucción"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}