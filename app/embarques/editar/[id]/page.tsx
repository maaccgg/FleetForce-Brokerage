"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Truck, MapPin, DollarSign, Save, Loader2, BookOpen, X, Calendar, Package, FileText } from "lucide-react";
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
  const [tarifasCatalogo, setTarifasCatalogo] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    folio: "",
    fecha_embarque: "",
    cliente_id: "",
    transportista_id: "",
    unidad: "",
    placas: "",
    operador: "",
    origen_direccion: "",
    origen_ciudad: "",
    origen_contacto: "",
    destino_direccion: "",
    destino_ciudad: "",
    destino_contacto: "",
    cmm: "GENERAL",
    peso_lbs: "",
    dimensiones: "LEGALES",
    tarifa: "",
    moneda: "USD",
    concepto_servicio: "FLETE TERRESTRE",
    detalle_servicio: "EXPORTACIÓN",
    notas_especiales: ""
  });

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      
      // 1. Cargar Catálogos
      const { data: c } = await supabase.from('clientes').select('id, razon_social');
      const { data: t } = await supabase.from('transportistas').select('id, razon_social');
      const { data: d } = await supabase.from('direcciones').select('*').order('nombre_lugar');
      const { data: trf } = await supabase
        .from('tarifas')
        .select('*, transportistas(razon_social), origen:direcciones!origen_id(nombre_lugar), destino:direcciones!destino_id(nombre_lugar)');

      if (c) setClientes(c);
      if (t) setTransportistas(t);
      if (d) setDirecciones(d);
      if (trf) setTarifasCatalogo(trf.filter(i => i.precio_costo > 0));

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
          fecha_embarque: emb.fecha_embarque || new Date().toISOString().split('T')[0]
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
      [`${prefix}_contacto`]: lugar.contacto_nombre || ""
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400 animate-pulse">Sincronizando...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Editar Embarque</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actualización de Carta de Instrucción</p>
        </div>
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
          <X size={28} />
        </button>
      </div>

      <form onSubmit={actualizarEmbarque} className="space-y-6">
        
        {/* BLOQUE 1: IDENTIDAD Y FECHA */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Folio</label>
               <input type="text" name="folio" readOnly value={formData.folio} className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl text-sm font-black uppercase outline-none opacity-70 cursor-not-allowed" />
             </div>
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Fecha del Servicio</label>
               <input type="date" name="fecha_embarque" value={formData.fecha_embarque} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all" />
             </div>
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Cliente / Billing</label>
               <select name="cliente_id" required value={formData.cliente_id} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500">
                  <option value="">-- Seleccionar --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
               </select>
             </div>
           </div>
        </div>

        {/* BLOQUE 2: ASIGNACIÓN DE CARRIER Y EQUIPO */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
           <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 border-b pb-2">
             <Truck size={14}/> 1. Datos de Carrier y Unidad
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Línea Transportista</label>
               <select name="transportista_id" required value={formData.transportista_id} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500">
                  <option value="">-- Línea Asignada --</option>
                  {transportistas.map(t => <option key={t.id} value={t.id}>{t.razon_social}</option>)}
               </select>
             </div>
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Nombre del Operador</label>
               <input type="text" name="operador" value={formData.operador} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm uppercase font-bold outline-none focus:border-emerald-500 transition-all" />
             </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Número de Unidad (Eco)</label>
               <input type="text" name="unidad" value={formData.unidad} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm uppercase font-bold outline-none focus:border-emerald-500 transition-all" />
             </div>
             <div>
               <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Placas de la Unidad</label>
               <input type="text" name="placas" value={formData.placas} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm uppercase font-bold outline-none focus:border-emerald-500 transition-all" />
             </div>
           </div>
        </div>

        {/* BLOQUE 3: ESPECIFICACIONES DE CARGA */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
            <Package size={14}/> 2. Especificaciones de Mercancía
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">CMM / Mercancía</label>
              <input type="text" name="cmm" value={formData.cmm} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Dimensiones</label>
              <input type="text" name="dimensiones" value={formData.dimensiones} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Peso Est. (LBS)</label>
              <input type="number" name="peso_lbs" value={formData.peso_lbs} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all" />
            </div>
          </div>
        </div>

        {/* BLOQUE 4: RUTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase text-emerald-600 border-b pb-2 flex items-center gap-2">
              <MapPin size={14}/> 3. Origen / Recolección
            </h3>
            <select onChange={(e) => handleAutoFill(e.target.value, 'origen')} className="w-full bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-[10px] font-black uppercase text-emerald-800 outline-none transition-all">
                <option value="">-- Cargar de Directorio --</option>
                {direcciones.filter(d => d.tipo !== 'DESTINO').map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
            </select>
            <input type="text" name="origen_direccion" value={formData.origen_direccion} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
            <input type="text" name="origen_ciudad" value={formData.origen_ciudad} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase text-blue-600 border-b pb-2 flex items-center gap-2">
              <MapPin size={14}/> 4. Destino / Entrega
            </h3>
            <select onChange={(e) => handleAutoFill(e.target.value, 'destino')} className="w-full bg-blue-50 border border-blue-100 p-2.5 rounded-lg text-[10px] font-black uppercase text-blue-800 outline-none transition-all">
                <option value="">-- Cargar de Directorio --</option>
                {direcciones.filter(d => d.tipo !== 'ORIGEN').map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
            </select>
            <input type="text" name="destino_direccion" value={formData.destino_direccion} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs font-bold outline-none focus:border-blue-500 transition-all" />
            <input type="text" name="destino_ciudad" value={formData.destino_ciudad} onChange={handleChange} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs font-bold outline-none focus:border-blue-500 transition-all" />
          </div>
        </div>

        {/* BLOQUE 5: NOTAS Y TARIFA */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                <FileText size={14}/> Notas e Instrucciones Especiales
              </label>
              <textarea name="notas_especiales" value={formData.notas_especiales} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm min-h-[100px] outline-none focus:border-blue-500 font-medium transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                <DollarSign size={14}/> Tarifa de Costo (Pagar a Carrier)
              </label>
              <select name="tarifa" required value={formData.tarifa} onChange={handleChange} className="w-full bg-emerald-50 border-emerald-100 border p-4 rounded-xl text-sm font-black text-emerald-900 uppercase outline-none transition-all">
                <option value="">-- Seleccionar Tarifa Guardada --</option>
                {/* Agregamos la tarifa actual por si fue capturada manualmente o ya no existe en el catálogo */}
                {formData.tarifa && !tarifasCatalogo.find(t => t.precio_costo.toString() === formData.tarifa) && (
                  <option value={formData.tarifa}>TARIFA ACTUAL: ${formData.tarifa}</option>
                )}
                {tarifasCatalogo.map(t => (
                  <option key={t.id} value={t.precio_costo}>
                    ${t.precio_costo} {t.moneda} - {t.transportistas?.razon_social} ({t.origen?.nombre_lugar} {t.destino?.nombre_lugar})
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 mt-2 italic">* Esta tarifa es la que aparecerá estampada en el PDF para el transportista.</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={saving} className="w-full md:w-auto bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
              {saving ? "Actualizando..." : "Guardar Cambios Operativos"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}