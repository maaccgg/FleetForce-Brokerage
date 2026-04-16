"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Truck, User, Phone, Mail, MapPin, DollarSign, 
  Loader2, Route, Edit2, Save, X, CheckCircle2, 
  Clock, AlertCircle, Plus, ShieldCheck, Globe, Building2, Map, Layers
} from "lucide-react";
import { supabase } from "../../../lib/supabase/client";
import { cn } from "../../../lib/utils";

export default function DetalleTransportista() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  
  const [transportista, setTransportista] = useState(null);
  const [tarifas, setTarifas] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRateId, setEditingRateId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isManualRoute, setIsManualRoute] = useState(false);

  const [formData, setFormData] = useState({});
  const [rateForm, setRateForm] = useState({
    origen_id: "", destino_id: "", origen_manual: "", destino_manual: "", 
    precio_costo: "", moneda: "USD", estado: "Tarifa acordada", vigencia: "",
    tipo_equipo_tarifa: "3.5 TON"
  });

  const estatusCostos = ["Cotización solicitada", "Cotizada", "Tarifa acordada"];
  const equiposDisponibles = ["NISSAN", "3.5 TON", "RABON", "TORTON", "CAJA SECA 53"];

  useEffect(() => { fetchData(); }, [params.id]);

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
    if (r) setTarifas(r || []);
    if (d) setDirecciones(d || []);
    setLoading(false);
  }

  const handleEditRate = (t) => {
    setEditingRateId(t.id);
    setIsManualRoute(!!t.origen_manual);
    setRateForm({
      origen_id: t.origen_id || "",
      destino_id: t.destino_id || "",
      origen_manual: t.origen_manual || "",
      destino_manual: t.destino_manual || "",
      precio_costo: t.precio_costo.toString(),
      moneda: t.moneda || "USD",
      estado: t.estado || "Tarifa acordada",
      vigencia: t.vigencia || "",
      tipo_equipo_tarifa: t.tipo_equipo_tarifa || "3.5 TON"
    });
    setShowRateModal(true);
  };

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('transportistas').update({
        ...formData,
        zonas_interes: formData.zonas_interes?.toUpperCase()
      }).eq('id', params.id);
      
      if (error) throw error;
      setTransportista(formData);
      setIsEditingInfo(false);
    } catch (e) { alert("Error: " + e.message); } finally { setSaving(false); }
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        transportista_id: params.id,
        empresa_id: user?.id,
        ...rateForm,
        precio_costo: parseFloat(rateForm.precio_costo),
        origen_id: isManualRoute ? null : rateForm.origen_id,
        destino_id: isManualRoute ? null : rateForm.destino_id,
        precio_venta: 0
      };
      if (editingRateId) await supabase.from('tarifas').update(payload).eq('id', editingRateId);
      else await supabase.from('tarifas').insert([payload]);
      setShowRateModal(false);
      fetchData();
    } catch (error) { alert("Error: " + error.message); } finally { setSaving(false); }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "Tarifa acordada": return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "Cotizada": return <Clock size={14} className="text-blue-500" />;
      default: return <AlertCircle size={14} className="text-amber-500" />;
    }
  };

  if (loading) return <div className="p-20 text-center font-medium text-slate-500">Cargando expediente...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-slate-200 pb-6 mt-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/transportistas')} className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-slate-500 hover:text-slate-900">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {transportista.razon_social} <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide">PROVEEDOR</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
               <ShieldCheck size={16} className="text-emerald-500"/> Expediente Operativo
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('info')} className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'info' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 font-semibold hover:text-slate-700")}>Información</button>
          <button onClick={() => setActiveTab('tarifas')} className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'tarifas' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 font-semibold hover:text-slate-700")}>Tarifario</button>
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'info' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            
            {/* IDENTIDAD COMERCIAL (Acento Azul) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex justify-between items-center mb-6 pl-2">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Building2 size={16} /></div>
                  Identidad Comercial
                </h3>
                <button onClick={() => isEditingInfo ? handleSaveInfo() : setIsEditingInfo(true)} className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm", isEditingInfo ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50")}>
                  {isEditingInfo ? 'Guardar Cambios' : 'Editar Datos'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-2">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Razón Social</label>
                  <input readOnly={!isEditingInfo} value={formData.razon_social || ''} onChange={e => setFormData({...formData, razon_social: e.target.value.toUpperCase()})} className={cn("w-full px-4 py-3 rounded-xl text-sm outline-none transition-all", isEditingInfo ? "bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-900 font-semibold" : "bg-slate-50 border border-slate-100 text-slate-800 font-medium")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RFC</label>
                  <input readOnly={!isEditingInfo} value={formData.rfc || ''} onChange={e => setFormData({...formData, rfc: e.target.value.toUpperCase()})} className={cn("w-full px-4 py-3 rounded-xl text-sm outline-none transition-all", isEditingInfo ? "bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-900 font-semibold" : "bg-slate-50 border border-slate-100 text-slate-800 font-medium")} />
                </div>
              </div>
            </div>

            {/* UNIDADES DISPONIBLES (Acentos Tonales) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h3 className="text-sm font-semibold text-slate-800 mb-6 pl-2 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Layers size={16} /></div>
                Unidades Disponibles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pl-2">
                {[
                  { label: "Nissan", key: "unidades_nissan", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", labelColor: "text-blue-600" },
                  { label: "3.5 Ton", key: "unidades_3_5", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", labelColor: "text-blue-600" },
                  { label: "Rabón", key: "unidades_rabon", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", labelColor: "text-blue-600" },
                  { label: "Torthon", key: "unidades_torton", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", labelColor: "text-blue-600" },
                  { label: "Caja 53'", key: "unidades_caja_53", bg: "bg-blue-50", border: "border-teal-100", text: "text-blue-700", labelColor: "text-blue-600" },
                ].map((item) => (
                  <div key={item.key} className={cn("p-4 rounded-xl border flex flex-col items-center transition-all", item.bg, item.border)}>
                    <label className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", item.labelColor)}>{item.label}</label>
                    <input 
                      type="number"
                      readOnly={!isEditingInfo}
                      value={formData[item.key] || 0}
                      onChange={e => setFormData({...formData, [item.key]: parseInt(e.target.value) || 0})}
                      className={cn("text-2xl font-bold w-full text-center outline-none bg-transparent", item.text, isEditingInfo ? "border-b border-black/10 pb-1" : "")}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* MAPA Y CONTACTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* COBERTURA (Acento Indigo) */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h3 className="text-sm font-semibold text-slate-800 mb-4 pl-2 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Map size={16} /></div>
                  Coberura Operativa
                </h3>
                <div className="flex-1 pl-2">
                  <textarea 
                    readOnly={!isEditingInfo}
                    value={formData.zonas_interes || ''}
                    onChange={e => setFormData({...formData, zonas_interes: e.target.value})}
                    className={cn("w-full h-full min-h-[140px] p-4 rounded-xl text-sm text-slate-700 outline-none resize-none transition-all leading-relaxed", isEditingInfo ? "bg-white border border-indigo-300 focus:ring-2 focus:ring-indigo-100" : "bg-slate-50 border border-slate-100")}
                    placeholder="Ej. Monterrey, Laredo, Rutas del Bajío..."
                  />
                </div>
              </div>

              {/* CONTACTO (Iconos Coloridos) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
                <h3 className="text-sm font-semibold text-slate-800 mb-6 pl-2 flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg"><User size={16} /></div>
                  Contacto Directo
                </h3>
                <div className="space-y-4 pl-2 flex-1">
                   <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><User size={16}/></div>
                      <input readOnly={!isEditingInfo} value={formData.contacto_nombre || ''} onChange={e => setFormData({...formData, contacto_nombre: e.target.value})} className={cn("w-full pl-14 pr-4 py-3 text-sm rounded-xl outline-none transition-all", isEditingInfo ? "bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100" : "bg-slate-50 border border-slate-100 text-slate-800 font-medium")} placeholder="Nombre responsable"/>
                   </div>
                   <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Mail size={16}/></div>
                      <input readOnly={!isEditingInfo} value={formData.contacto_email || ''} onChange={e => setFormData({...formData, contacto_email: e.target.value})} className={cn("w-full pl-14 pr-4 py-3 text-sm rounded-xl outline-none transition-all", isEditingInfo ? "bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100" : "bg-slate-50 border border-slate-100 text-slate-800 font-medium")} placeholder="Correo electrónico"/>
                   </div>
                   <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Phone size={16}/></div>
                      <input readOnly={!isEditingInfo} value={formData.contacto_telefono || ''} onChange={e => setFormData({...formData, contacto_telefono: e.target.value})} className={cn("w-full pl-14 pr-4 py-3 text-sm rounded-xl outline-none transition-all", isEditingInfo ? "bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100" : "bg-slate-50 border border-slate-100 text-slate-800 font-medium")} placeholder="Teléfono directo"/>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: TARIFARIO COSTOS (Se mantiene limpio) --- */}
        {activeTab === 'tarifas' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={18} /></div>
                 <h3 className="text-sm font-semibold text-slate-800">Acuerdos Financieros</h3>
              </div>
              <button onClick={() => { setEditingRateId(null); setShowRateModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm">
                <Plus size={16} /> Agregar Tarifa
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruta y Especificación</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estatus</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Costo Neto</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tarifas.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center text-sm font-medium text-slate-400">No hay tarifas registradas para este proveedor.</td></tr>
                  ) : tarifas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0"><Route size={18} /></div>
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">
                              {t.origen_manual || t.origen?.nombre_lugar} <span className="text-slate-400 mx-1">➔</span> {t.destino_manual || t.destino?.nombre_lugar}
                            </span>
                            <span className="text-xs text-slate-500">{t.tipo_equipo_tarifa || '3.5 TON'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium", t.estado === "Tarifa acordada" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700")}>
                          {getStatusIcon(t.estado)} {t.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-semibold text-lg text-slate-900">${t.precio_costo?.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 ml-1 font-medium">{t.moneda}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => handleEditRate(t)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL COSTOS */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowRateModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><DollarSign size={20} /></div>
                 <h3 className="text-lg font-bold text-slate-900">{editingRateId ? 'Modificar Tarifa' : 'Nueva Tarifa'}</h3>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setIsManualRoute(!isManualRoute)} className="text-xs font-semibold text-blue-600 hover:underline">
                  {isManualRoute ? 'Usar Catálogo' : 'Entrada Manual'}
                </button>
                <button type="button" onClick={() => setShowRateModal(false)} className="text-slate-400 hover:text-slate-700 transition-all"><X size={20} /></button>
              </div>
            </div>
            
            <form onSubmit={handleSaveRate} className="p-6 space-y-5 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Origen</label>
                  {isManualRoute ? (
                    <input required value={rateForm.origen_manual} onChange={e => setRateForm({...rateForm, origen_manual: e.target.value.toUpperCase()})} className="w-full bg-white p-3 rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Ej. Ciudad o Planta" />
                  ) : (
                    <select required value={rateForm.origen_id} onChange={e => setRateForm({...rateForm, origen_id: e.target.value})} className="w-full bg-white p-3 rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800">
                      <option value="">Seleccionar ubicación...</option>
                      {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
                    </select>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Destino</label>
                  {isManualRoute ? (
                    <input required value={rateForm.destino_manual} onChange={e => setRateForm({...rateForm, destino_manual: e.target.value.toUpperCase()})} className="w-full bg-white p-3 rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Ej. Ciudad o Planta" />
                  ) : (
                    <select required value={rateForm.destino_id} onChange={e => setRateForm({...rateForm, destino_id: e.target.value})} className="w-full bg-white p-3 rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800">
                      <option value="">Seleccionar ubicación...</option>
                      {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Equipo Requerido</label>
                  <select value={rateForm.tipo_equipo_tarifa} onChange={e => setRateForm({...rateForm, tipo_equipo_tarifa: e.target.value})} className="w-full bg-white p-3 rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800">
                    {equiposDisponibles.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Estatus de Negociación</label>
                  <select value={rateForm.estado} onChange={e => setRateForm({...rateForm, estado: e.target.value})} className="w-full bg-white p-3 rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800">
                    {estatusCostos.map(est => <option key={est} value={est}>{est}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-200 pt-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Costo Neto (Carrier)</label>
                  <div className="flex gap-2">
                    <select value={rateForm.moneda} onChange={e => setRateForm({...rateForm, moneda: e.target.value})} className="bg-slate-50 text-slate-700 p-3 rounded-xl text-sm font-medium border border-slate-200 outline-none w-24 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><option value="USD">USD</option><option value="MXN">MXN</option></select>
                    <input type="number" required value={rateForm.precio_costo} onChange={e => setRateForm({...rateForm, precio_costo: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-lg font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Vigencia Tarifa</label>
                  <input type="date" value={rateForm.vigencia} onChange={e => setRateForm({...rateForm, vigencia: e.target.value})} className="w-full bg-white p-3 rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700" />
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowRateModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                  {editingRateId ? 'Guardar Cambios' : 'Registrar Tarifa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}