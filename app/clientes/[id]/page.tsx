"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, User, Phone, Mail, MapPin, DollarSign, 
  Loader2, BookOpen, Route, Edit2, Save, X, Trash2, Calendar, 
  CheckCircle2, Clock, AlertCircle, Plus
} from "lucide-react";
import { supabase } from "../../../lib/supabase/client";
import { cn } from "../../../lib/utils";

export default function DetalleCliente() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'tarifas'>('info');
  
  // Estados de Datos
  const [cliente, setCliente] = useState<any>(null);
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [direcciones, setDirecciones] = useState<any[]>([]);
  
  // Estados de Edición y Formularios
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [clientFormData, setClientFormData] = useState<any>({});
  const [rateFormData, setRateFormData] = useState({
    origen_id: "",
    destino_id: "",
    precio_venta: "",
    moneda: "USD",
    estado: "Tarifa acordada",
    vigencia: ""
  });

  const estatusTarifas = ["Cotización solicitada", "Cotizada", "Tarifa acordada"];

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    setLoading(true);
    const { data: clientData } = await supabase.from('clientes').select('*').eq('id', params.id).single();
    const { data: ratesData } = await supabase
      .from('tarifas')
      .select(`*, origen:direcciones!origen_id(nombre_lugar), destino:direcciones!destino_id(nombre_lugar)`)
      .eq('cliente_id', params.id)
      .order('created_at', { ascending: false });
    const { data: dirs } = await supabase.from('direcciones').select('id, nombre_lugar').order('nombre_lugar');

    if (clientData) {
      setCliente(clientData);
      setClientFormData(clientData);
    }
    if (ratesData) setTarifas(ratesData);
    if (dirs) setDirecciones(dirs);
    setLoading(false);
  }

  // --- ACCIONES DE CLIENTE ---
  const handleSaveClient = async () => {
    setSaving(true);
    const { error } = await supabase.from('clientes').update(clientFormData).eq('id', params.id);
    if (!error) {
      setCliente(clientFormData);
      setIsEditingInfo(false);
      alert("Información del cliente actualizada.");
    }
    setSaving(false);
  };

  // --- ACCIONES DE TARIFAS ---
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no detectada.");

      const payload = {
        cliente_id: params.id,
        empresa_id: user.id,
        origen_id: rateFormData.origen_id,
        destino_id: rateFormData.destino_id,
        precio_venta: parseFloat(rateFormData.precio_venta),
        precio_costo: 0,
        moneda: rateFormData.moneda,
        estado: rateFormData.estado,
        vigencia: rateFormData.vigencia || null
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
      setRateFormData({ origen_id: "", destino_id: "", precio_venta: "", moneda: "USD", estado: "Tarifa acordada", vigencia: "" });
      fetchData();
      alert("Tarifa guardada correctamente.");
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditRate = (tarifa: any) => {
    setEditingRateId(tarifa.id);
    setRateFormData({
      origen_id: tarifa.origen_id,
      destino_id: tarifa.destino_id,
      precio_venta: tarifa.precio_venta.toString(),
      moneda: tarifa.moneda || "USD",
      estado: tarifa.estado || "Tarifa acordada",
      vigencia: tarifa.vigencia || ""
    });
    setShowRateForm(true);
  };

  const eliminarTarifa = async (id: string) => {
    if (!confirm("¿Eliminar esta tarifa?")) return;
    const { error } = await supabase.from('tarifas').delete().eq('id', id);
    if (!error) fetchData();
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Tarifa acordada": return <CheckCircle2 size={12} className="text-emerald-500" />;
      case "Cotizada": return <Clock size={12} className="text-blue-500" />;
      default: return <AlertCircle size={12} className="text-amber-500" />;
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase text-slate-400">Sincronizando Expediente...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-slate-200 pb-8 gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/clientes')} className="p-3 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">{cliente.razon_social}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Expediente Centralizado</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'info' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
          >
            Información
          </button>
          <button 
            onClick={() => setActiveTab('tarifas')}
            className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'tarifas' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
          >
            Tarifario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        
        {/* TAB 1: INFORMACIÓN BASE */}
        {activeTab === 'info' && (
          <div className="p-10 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Datos Maestros</h3>
              <button 
                onClick={() => isEditingInfo ? handleSaveClient() : setIsEditingInfo(true)}
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
                  <input readOnly={!isEditingInfo} value={clientFormData.razon_social} onChange={e => setClientFormData({...clientFormData, razon_social: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold uppercase outline-none transition-all", isEditingInfo ? "bg-slate-50 border-blue-200 border shadow-inner" : "bg-transparent border-transparent cursor-default")} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">RFC / Tax ID</label>
                  <input readOnly={!isEditingInfo} value={clientFormData.rfc} onChange={e => setClientFormData({...clientFormData, rfc: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold uppercase outline-none transition-all", isEditingInfo ? "bg-slate-50 border-blue-200 border" : "bg-transparent border-transparent cursor-default")} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Dirección Fiscal</label>
                  <input readOnly={!isEditingInfo} value={clientFormData.direccion} onChange={e => setClientFormData({...clientFormData, direccion: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold uppercase outline-none transition-all", isEditingInfo ? "bg-slate-50 border-blue-200 border" : "bg-transparent border-transparent cursor-default")} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Contacto de Operaciones</label>
                  <input readOnly={!isEditingInfo} value={clientFormData.contacto_nombre} onChange={e => setClientFormData({...clientFormData, contacto_nombre: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold outline-none transition-all", isEditingInfo ? "bg-slate-50 border-blue-200 border" : "bg-transparent border-transparent cursor-default")} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Email de Contacto</label>
                  <input readOnly={!isEditingInfo} value={clientFormData.contacto_email} onChange={e => setClientFormData({...clientFormData, contacto_email: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold outline-none transition-all", isEditingInfo ? "bg-slate-50 border-blue-200 border" : "bg-transparent border-transparent cursor-default")} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Teléfono</label>
                  <input readOnly={!isEditingInfo} value={clientFormData.contacto_telefono} onChange={e => setClientFormData({...clientFormData, contacto_telefono: e.target.value})} className={cn("w-full p-3 rounded-xl text-sm font-bold outline-none transition-all", isEditingInfo ? "bg-slate-50 border-blue-200 border" : "bg-transparent border-transparent cursor-default")} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TARIFARIO */}
        {activeTab === 'tarifas' && (
          <div className="animate-in fade-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Control de Rutas y Precios</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Gestión de cotizaciones y acuerdos de venta.</p>
              </div>
              <button 
                onClick={() => { setShowRateForm(!showRateForm); setEditingRateId(null); }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                {showRateForm ? <X size={14} /> : <Plus size={14} />}
                {showRateForm ? 'Cerrar Formulario' : 'Nueva Tarifa'}
              </button>
            </div>

            {/* FORMULARIO DE TARIFA */}
            {showRateForm && (
              <div className="p-10 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-4">
                <form onSubmit={handleSaveRate} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Origen</label>
                      <select required value={rateFormData.origen_id} onChange={e => setRateFormData({...rateFormData, origen_id: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black uppercase">
                        <option value="">-- Seleccionar --</option>
                        {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Destino</label>
                      <select required value={rateFormData.destino_id} onChange={e => setRateFormData({...rateFormData, destino_id: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black uppercase">
                        <option value="">-- Seleccionar --</option>
                        {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Divisa</label>
                      <select value={rateFormData.moneda} onChange={e => setRateFormData({...rateFormData, moneda: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black">
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Precio Venta</label>
                      <input type="number" required value={rateFormData.precio_venta} onChange={e => setRateFormData({...rateFormData, precio_venta: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-sm font-black" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Estatus de Ruta</label>
                    <select value={rateFormData.estado} onChange={e => setRateFormData({...rateFormData, estado: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-[10px] font-black uppercase">
                      {estatusTarifas.map(est => <option key={est} value={est}>{est}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Vigencia de Tarifa</label>
                    <input type="date" value={rateFormData.vigencia} onChange={e => setRateFormData({...rateFormData, vigencia: e.target.value})} className="w-full bg-white border p-3 rounded-xl text-sm font-bold" />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : editingRateId ? <Save size={14} /> : <Plus size={14} />}
                      {editingRateId ? 'Actualizar Tarifa' : 'Registrar Tarifa'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LISTADO DE TARIFAS */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <th className="p-6">Ruta Operativa</th>
                    <th className="p-6">Estatus</th>
                    <th className="p-6">Vigencia</th>
                    <th className="p-6 text-right">Precio</th>
                    <th className="p-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 font-bold uppercase">
                  {tarifas.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-400 text-xs tracking-widest">No hay rutas registradas.</td></tr>
                  ) : (
                    tarifas.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-[11px] font-black">
                            <span>{t.origen?.nombre_lugar}</span>
                            <Route size={12} className="text-blue-500" />
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
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                            <Calendar size={14} /> {t.vigencia ? new Date(t.vigencia).toLocaleDateString() : 'SIN FECHA'}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <span className="text-sm font-black text-slate-900">${t.precio_venta?.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 ml-1">{t.moneda}</span>
                        </td>
                        <td className="p-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEditRate(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => eliminarTarifa(t.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}