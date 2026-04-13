"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin, DollarSign, Save, Loader2, Link as LinkIcon, PhoneCall } from "lucide-react";
import { supabase } from "../../../lib/supabase/client"; 

export default function NuevoEmbarque() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [transportistas, setTransportistas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    folio: "",
    ejecutivo: "",
    cliente_id: "",
    transportista_id: "",
    unidad: "",
    placas: "",
    operador: "",
    // Origen Avanzado
    origen_direccion: "",
    origen_ciudad: "",
    origen_contacto: "",
    origen_maps_link: "",
    // Destino Avanzado
    destino_direccion: "",
    destino_ciudad: "",
    destino_contacto: "",
    destino_maps_link: "",
    // Detalles de Carga y Finanzas
    tipo_carga: "GENERAL",
    peso_lbs: "",
    tarifa: "",
    concepto_servicio: "FLETE TERRESTRE",
    detalle_servicio: "EXPORTACIÓN",
  });

  useEffect(() => {
    async function loadCatalogs() {
      const { data: c } = await supabase.from('clientes').select('id, razon_social');
      const { data: t } = await supabase.from('transportistas').select('id, razon_social');
      if (c) setClientes(c);
      if (t) setTransportistas(t);
    }
    loadCatalogs();
  }, []);

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

    setLoading(false);
    if (error) alert(error.message);
    else router.push("/embarques");
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">
        Nueva Operación Institucional
      </h1>

      <form onSubmit={guardarEmbarque} className="space-y-6">
        {/* BLOQUE 1: ASIGNACIÓN */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Truck className="text-blue-600" size={20} />
            <h2 className="text-xs font-black uppercase tracking-widest">Asignación de Servicio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" name="folio" required placeholder="Folio (Ej. TDL004)" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none focus:border-blue-500" />
            <input type="text" name="ejecutivo" placeholder="Ejecutivo Responsable" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none focus:border-blue-500" />
            <select name="cliente_id" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm">
              <option value="">-- Seleccionar Cliente --</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
            </select>
            <select name="transportista_id" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm">
              <option value="">-- Seleccionar Transportista --</option>
              {transportistas.map(t => <option key={t.id} value={t.id}>{t.razon_social}</option>)}
            </select>
          </div>
        </div>

        {/* BLOQUE 2: LOGÍSTICA DETALLADA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ORIGEN */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase mb-4 text-emerald-600 flex items-center gap-2">
              <MapPin size={14}/> Datos de Origen
            </h3>
            <div className="space-y-3">
              <input type="text" name="origen_direccion" placeholder="Dirección Completa" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
              <input type="text" name="origen_ciudad" placeholder="Ciudad y Estado" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
              <input type="text" name="origen_contacto" placeholder="Nombre de Contacto en Carga" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
              <input type="text" name="origen_maps_link" placeholder="Link de Google Maps" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
            </div>
          </div>

          {/* DESTINO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase mb-4 text-blue-600 flex items-center gap-2">
              <MapPin size={14}/> Datos de Destino
            </h3>
            <div className="space-y-3">
              <input type="text" name="destino_direccion" placeholder="Dirección Completa" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
              <input type="text" name="destino_ciudad" placeholder="Ciudad y Estado" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
              <input type="text" name="destino_contacto" placeholder="Nombre de Contacto en Entrega" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
              <input type="text" name="destino_maps_link" placeholder="Link de Google Maps" onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none" />
            </div>
          </div>
        </div>

        {/* BLOQUE 3: CARGA Y FINANZAS */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <DollarSign className="text-slate-900" size={20} />
            <h2 className="text-xs font-black uppercase tracking-widest">Carga y Tarifas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input type="text" name="tipo_carga" defaultValue="GENERAL" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none" />
            <input type="number" name="peso_lbs" placeholder="Peso (LBS)" onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none" />
            <input type="number" name="tarifa" placeholder="Tarifa (USD)" onChange={handleChange} className="w-full bg-emerald-50 border-emerald-200 border p-3 rounded-xl text-sm font-bold text-emerald-900" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl">
          {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sellar Embarque y Generar Folio"}
        </button>
      </form>
    </div>
  );
}