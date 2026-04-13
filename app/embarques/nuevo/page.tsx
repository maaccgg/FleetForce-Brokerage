"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin, DollarSign, Save, Loader2, Building2 } from "lucide-react";
import { supabase } from "../../../lib/supabase/client"; 

export default function NuevoEmbarque() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  
  // Catálogos extraídos de la base de datos
  const [clientes, setClientes] = useState<any[]>([]);
  const [transportistas, setTransportistas] = useState<any[]>([]);

  // Estado del formulario (Ahora usa IDs relacionales)
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
    destino_direccion: "",
    destino_ciudad: "",
    tipo_carga: "GENERAL",
    peso_lbs: "",
  });

  // 1. Cargar datos maestros al iniciar la pantalla
  useEffect(() => {
    async function inicializarEntorno() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmpresaId(user.id); // Usamos el ID del usuario como Tenant ID por ahora
        
        // Consultar catálogos
        const { data: clientesData } = await supabase.from('clientes').select('id, razon_social');
        const { data: transportistasData } = await supabase.from('transportistas').select('id, razon_social');
        
        if (clientesData) setClientes(clientesData);
        if (transportistasData) setTransportistas(transportistasData);
      }
    }
    inicializarEntorno();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Ejecutar la inserción relacional
  const guardarEmbarque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return alert("Error: Sesión no detectada.");
    
    setLoading(true);

    const { error } = await supabase
      .from('embarques')
      .insert([
        {
          empresa_id: empresaId,
          folio: formData.folio,
          ejecutivo: formData.ejecutivo,
          cliente_id: formData.cliente_id || null,
          transportista_id: formData.transportista_id || null,
          unidad: formData.unidad,
          placas: formData.placas,
          operador: formData.operador,
          origen_direccion: formData.origen_direccion,
          origen_ciudad: formData.origen_ciudad,
          destino_direccion: formData.destino_direccion,
          destino_ciudad: formData.destino_ciudad,
          tipo_carga: formData.tipo_carga,
          peso_lbs: formData.peso_lbs ? parseFloat(formData.peso_lbs) : null,
        }
      ]);

    setLoading(false);

    if (error) {
      alert("Falla en la inserción: " + error.message);
    } else {
      alert("Folio generado y sellado en la base de datos.");
      router.push("/embarques");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
          Despacho Operativo
        </h1>
        <p className="text-sm text-slate-500 font-medium">Asignación de unidades y generación de Carta de Instrucciones.</p>
      </div>

      <form onSubmit={guardarEmbarque} className="space-y-6">
        
        {/* BLOQUE 1: ASIGNACIÓN LOGÍSTICA */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Truck className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">1. Estructura del Servicio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Folio T-DASH</label>
              <input type="text" name="folio" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="Ej. TDL004" />
            </div>
            
            {/* MENÚ RELACIONAL: CLIENTES */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Cliente (Expedidor/Consignatario)</label>
              <select name="cliente_id" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer">
                <option value="">-- Seleccione un Cliente Maestro --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.razon_social}</option>
                ))}
              </select>
            </div>

            {/* MENÚ RELACIONAL: TRANSPORTISTAS */}
            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Línea Transportista Asignada</label>
              <select name="transportista_id" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer">
                <option value="">-- Seleccione un Transportista --</option>
                {transportistas.map(t => (
                  <option key={t.id} value={t.id}>{t.razon_social}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Unidad</label>
              <input type="text" name="unidad" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="Ej. DV53" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Placas</label>
              <input type="text" name="placas" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Operador (Driver)</label>
              <input type="text" name="operador" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: RUTA OPERATIVA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <MapPin className="text-emerald-600" size={24} />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Origen</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Dirección de Carga</label>
                <input type="text" name="origen_direccion" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Ciudad / Estado</label>
                <input type="text" name="origen_ciudad" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <MapPin className="text-blue-600" size={24} />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Destino</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Dirección de Entrega</label>
                <input type="text" name="destino_direccion" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Ciudad / Estado</label>
                <input type="text" name="destino_ciudad" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'Sincronizando...' : 'Generar Carta de Instrucciones'}
          </button>
        </div>

      </form>
    </div>
  );
}