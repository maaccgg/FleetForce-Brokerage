"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Truck, User, Phone, Mail, MapPin, DollarSign, 
  Loader2, BookOpen, Route, Edit2, Save, X, Trash2, Calendar, 
  CheckCircle2, Clock, AlertCircle, Plus, ShieldCheck
} from "lucide-react";
import { supabase } from "../../../lib/supabase/client";
import { cn } from "../../../lib/utils";

export default function DetalleTransportista() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'tarifas'>('info');
  
  // Estados de Datos
  const [transportista, setTransportista] = useState<any>(null);
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [direcciones, setDirecciones] = useState<any[]>([]);
  
  // Estados de Edición y Formularios
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<any>({});
  const [rateForm, setRateForm] = useState({
    origen_id: "",
    destino_id: "",
    precio_costo: "",
    moneda: "USD",
    estado: "Tarifa acordada",
    vigencia: ""
  });

  const estatusCostos = ["Cotización solicitada", "Cotizada", "Tarifa acordada"];

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    setLoading(true);
    const { data: t } = await supabase.from('transportistas').select('*').eq('id', params.id).single();
    const { data: r } = await supabase
      .from('tarifas')
      .select(`*, origen:direcciones!origen_id(nombre_lugar), destino:direcciones!destino_id(nombre_lugar)`)
      .eq('transportista_id', params.id)
      .order('created_at', { ascending: false });
    const { data: d } = await supabase.from('direcciones').select('id, nombre_lugar').order('nombre_lugar');

    if (t) { setTransportista(t); setFormData(t); }
    if (r) setTarifas(r);
    if (d) setDirecciones(d);
    setLoading(false);
  }

  // --- ACCIONES DE INFORMACIÓN ---
  const handleSaveInfo = async () => {
    setSaving(true);
    const { error } = await supabase.from('transportistas').update(formData).eq('id', params.id);
    if (!error) {
      setTransportista(formData);
      setIsEditingInfo(false);
      alert("Expediente de línea actualizado.");
    }
    setSaving(false);
  };

  // --- ACCIONES DE COSTOS/TARIFAS ---
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        transportista_id: params.id,
        empresa_id: user?.id,
        origen_id: rateForm.origen_id,
        destino_id: rateForm.destino_id,
        precio_costo: parseFloat(rateForm.precio_costo),
        precio_venta: 0,
        moneda: rateForm.moneda,
        estado: rateForm.estado,
        vigencia: rateForm.vigencia || null
      };

      let error;
      if (editingRateId) {
        const { error: err } = await supabase.from('tarifas').update(payload).eq('id', editingRateId);
        error = err;
      } else {
        const { error: err } = await supabase.from('tarifas').insert([payload]);
        error = err;
      }

      if (error) throw error;

      setShowRateForm(false);
      setEditingRateId(null);
      setRateForm({ origen_id: "", destino_id: "", precio_costo: "", moneda: "USD", estado: "Tarifa acordada", vigencia: "" });
      fetchData();
      alert("Costo operativo registrado.");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditRate = (t: any) => {
    setEditingRateId(t.id);
    setRateForm({
      origen_id: t.origen_id,
      destino_id: t.destino_id,
      precio_costo: t.precio_costo.toString(),
      moneda: t.moneda || "USD",
      estado: t.estado || "Tarifa acordada",
      vigencia: t.vigencia || ""
    });
    setShowRateForm(true);
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Tarifa acordada": return <CheckCircle2 size={12} className="text-emerald-500" />;
      case "Cotizada": return <Clock size={12} className="text-blue-500" />;
      default: return <AlertCircle size={12} className="text-amber-500" />;
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase text-slate-400">Sincronizando Línea...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-slate-200 pb-8 gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/transportistas')} className="p-3 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">{transportista.razon_social}</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-2">
               <ShieldCheck size={12}/> Proveedor de Flota Activo
            </p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'info' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
          >
            Expediente
          </button>
          <button 
            onClick={() => setActiveTab('tarifas')}
            className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'tarifas' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
          >
            Costos / Rutas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        
        {/* --- TAB 1: EXPEDIENTE --- */}
        {activeTab === 'info' && (
          <div className="p-10 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Identidad y Contacto</h3>
              <button 
                onClick={() => isEditingInfo ? handleSaveInfo() : setIsEditingInfo(true)}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", isEditingInfo ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : isEditingInfo ? <Save size={14} /> : <Edit2 size={14} />}
                {isEditingInfo ? 'Guardar Cambios' : 'Editar Información'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Razón Social</label>
                  <input readOnly={!isEditingInfo} value={formData.razon_social} onChange={e => setFormData({...formData, razon_social: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold uppercase outline-none transition-all", isEditingInfo ? "bg-slate-50 border-emerald-200 border" : "bg-transparent border-transparent cursor-default")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">CAAT</label>
                    <input readOnly={!isEditingInfo} value={formData.caat} onChange={e => setFormData({...formData, caat: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold uppercase", isEditingInfo ? "bg-slate-50 border-emerald-200 border" : "bg-transparent border-transparent")} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">SCAC</label>
                    <input readOnly={!isEditingInfo} value={formData.scac} onChange={e => setFormData({...formData, scac: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold uppercase", isEditingInfo ? "bg-slate-50 border-emerald-200 border" : "bg-transparent border-transparent")} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Email Operativo</label>
                  <input readOnly={!isEditingInfo} value={formData.contacto_email} onChange={e => setFormData({...formData, contacto_email: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold", isEditingInfo ? "bg-slate-50 border-emerald-200 border" : "bg-transparent border-transparent")} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Tipo de Flota</label>
                  <select disabled={!isEditingInfo} value={formData.tipo_flota} onChange={e => setFormData({...formData, tipo_flota: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold outline-none appearance-none", isEditingInfo ? "bg-slate-50 border-emerald-200 border" : "bg-transparent border-transparent")}>
                    <option value="CAJA SECA 53">CAJA SECA 53'</option>
                    <option value="PLATAFORMA">PLATAFORMA</option>
                    <option value="REFRIGERADO">REFRIGERADO</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: COSTOS / RUTAS --- */}
        {activeTab === 'tarifas' && (
          <div className="animate-in fade-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Listado de Costos (Compra)</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Acuerdos de fletes con este transportista.</p>
              </div>
              <button 
                onClick={() => { setShowRateForm(!showRateForm); setEditingRateId(null); }}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                {showRateForm ? <X size={14} /> : <Plus size={14} />}
                {showRateForm ? 'Cerrar' : 'Nuevo Costo'}
              </button>
            </div>

            {showRateForm && (
              <div className="p-10 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-4">
                <form onSubmit={handleSaveRate} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Origen</label>
                      <select required value={rateForm.origen_id} onChange={e => setRateForm({...rateForm, origen_id: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black uppercase">
                        <option value="">-- Seleccionar --</option>
                        {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Destino</label>
                      <select required value={rateForm.destino_id} onChange={e => setRateForm({...rateForm, destino_id: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black uppercase">
                        <option value="">-- Seleccionar --</option>
                        {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Divisa</label>
                      <select value={rateForm.moneda} onChange={e => setRateForm({...rateForm, moneda: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black">
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Precio Costo</label>
                      <input type="number" required value={rateForm.precio_costo} onChange={e => setRateForm({...rateForm, precio_costo: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-sm font-black" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Estatus Cotización</label>
                    <select value={rateForm.estado} onChange={e => setRateForm({...rateForm, estado: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black uppercase">
                      {estatusCostos.map(est => <option key={est} value={est}>{est}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Vigencia</label>
                    <input type="date" value={rateForm.vigencia} onChange={e => setRateForm({...rateForm, vigencia: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-sm font-bold" />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : editingRateId ? <Save size={14} /> : <Plus size={14} />}
                      {editingRateId ? 'Actualizar Costo' : 'Guardar Costo'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                  <th className="p-6">Ruta Operativa</th>
                  <th className="p-6">Estatus</th>
                  <th className="p-6">Vigencia</th>
                  <th className="p-6 text-right">Costo</th>
                  <th className="p-6 text-center"></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 font-bold uppercase">
                {tarifas.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400 text-xs tracking-widest">Sin rutas registradas.</td></tr>
                ) : (
                  tarifas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-[11px] font-black">
                          <span>{t.origen?.nombre_lugar}</span>
                          <Route size={12} className="text-emerald-500" />
                          <span>{t.destino?.nombre_lugar}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border", 
                          t.estado === "Tarifa acordada" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                          t.estado === "Cotizada" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100")}>
                          {getStatusIcon(t.estado)} {t.estado}
                        </span>
                      </td>
                      <td className="p-6 text-[10px] text-slate-400">
                        {t.vigencia ? new Date(t.vigencia).toLocaleDateString() : 'SIN FECHA'}
                      </td>
                      <td className="p-6 text-right">
                        <span className="text-sm font-black text-slate-900">${t.precio_costo?.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 ml-1">{t.moneda}</span>
                      </td>
                      <td className="p-6 text-center">
                        <button onClick={() => handleEditRate(t)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}