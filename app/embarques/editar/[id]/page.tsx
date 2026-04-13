"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Truck, MapPin, DollarSign, Save, Loader2, BookOpen, X, ArrowLeft } from "lucide-react";
import { supabase } from "../../../../lib/supabase/client"; 

export default function EditarEmbarque() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Catálogos
  const [clientes, setClientes] = useState<any[]>([]);
  const [transportistas, setTransportistas] = useState<any[]>([]);
  const [direcciones, setDirecciones] = useState<any[]>([]);

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
    async function loadInitialData() {
      setLoading(true);
      // 1. Cargar Catálogos
      const { data: c } = await supabase.from('clientes').select('id, razon_social');
      const { data: t } = await supabase.from('transportistas').select('id, razon_social');
      const { data: d } = await supabase.from('direcciones').select('*').order('nombre_lugar');
      if (c) setClientes(c);
      if (t) setTransportistas(t);
      if (d) setDirecciones(d);

      // 2. Cargar Datos del Embarque Actual
      const { data: emb, error } = await supabase
        .from('embarques')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        alert("Error al cargar embarque");
        router.push("/embarques");
      } else if (emb) {
        setFormData({
          ...emb,
          peso_lbs: emb.peso_lbs?.toString() || "",
          tarifa: emb.tarifa?.toString() || "",
        });
      }
      setLoading(false);
    }
    loadInitialData();
  }, [params.id]);

  const handleAutoFill = (id: string, campo: 'origen' | 'destino') => {
    const lugar = direcciones.find(d => d.id === id);
    if (!lugar) return;
    const prefix = campo === 'origen' ? 'origen' : 'destino';
    setFormData(prev => ({
      ...prev,
      [`${prefix}_direccion`]: lugar.direccion,
      [`${prefix}_ciudad`]: lugar.ciudad,
      [`${prefix}_contacto`]: lugar.contacto_nombre || "",
      [`${prefix}_maps_link`]: lugar.maps_link || ""
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const actualizarEmbarque = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('embarques')
      .update({
        ...formData,
        peso_lbs: formData.peso_lbs ? parseFloat(formData.peso_lbs) : null,
        tarifa: formData.tarifa ? parseFloat(formData.tarifa) : null,
      })
      .eq('id', params.id);

    if (!error) {
        router.push(`/embarques/${params.id}`);
    } else {
        alert(error.message);
        setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Cargando datos operativos...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Editar Folio {formData.folio}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ajuste de parámetros institucionales</p>
        </div>
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={28} />
        </button>
      </div>

      <form onSubmit={actualizarEmbarque} className="space-y-6">
        {/* BLOQUE ASIGNACIÓN */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Folio del Servicio</label>
             <input type="text" name="folio" required value={formData.folio} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" />
           </div>
           <div>
             <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Cliente</label>
             <select name="cliente_id" value={formData.cliente_id} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold">
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
             </select>
           </div>
           <div>
             <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Transportista</label>
             <select name="transportista_id" value={formData.transportista_id} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold">
                {transportistas.map(t => <option key={t.id} value={t.id}>{t.razon_social}</option>)}
             </select>
           </div>
           <div>
             <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Nombre Operador</label>
             <input type="text" name="operador" value={formData.operador} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm" />
           </div>
        </div>

        {/* LOGÍSTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase text-emerald-600 border-b pb-2">1. Origen</h3>
            <select onChange={(e) => handleAutoFill(e.target.value, 'origen')} className="w-full bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-[10px] font-black uppercase">
                <option value="">-- Usar Ubicación Guardada --</option>
                {direcciones.filter(d => d.tipo !== 'DESTINO').map(d => (
                  <option key={d.id} value={d.id}>{d.nombre_lugar}</option>
                ))}
            </select>
            <input type="text" name="origen_direccion" placeholder="Dirección" value={formData.origen_direccion} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
            <input type="text" name="origen_ciudad" placeholder="Ciudad" value={formData.origen_ciudad} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase text-blue-600 border-b pb-2">2. Destino</h3>
            <select onChange={(e) => handleAutoFill(e.target.value, 'destino')} className="w-full bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-[10px] font-black uppercase">
                <option value="">-- Usar Ubicación Guardada --</option>
                {direcciones.filter(d => d.tipo !== 'ORIGEN').map(d => (
                  <option key={d.id} value={d.id}>{d.nombre_lugar}</option>
                ))}
            </select>
            <input type="text" name="destino_direccion" placeholder="Dirección" value={formData.destino_direccion} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
            <input type="text" name="destino_ciudad" placeholder="Ciudad" value={formData.destino_ciudad} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
          </div>
        </div>

        {/* FINANZAS */}
        <div className="bg-slate-900 p-8 rounded-2xl text-white grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block">Tarifa Acordada (USD)</label>
            <input type="number" name="tarifa" value={formData.tarifa} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm font-black text-blue-400" />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl">
              {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Actualizar Información"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}