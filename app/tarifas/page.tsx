"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, Save, Loader2, ArrowRight, Users, Truck, Edit2, X, Trash2 
} from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";

export default function TarifasPage() {
  const [activeTab, setActiveTab] = useState<'clientes' | 'proveedores'>('clientes');
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [transportistas, setTransportistas] = useState<any[]>([]);
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cliente_id: "",
    transportista_id: "",
    origen_id: "",
    destino_id: "",
    precio_costo: "0",
    precio_venta: "0",
    moneda: "USD"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: t } = await supabase.from('tarifas').select('*, clientes(razon_social), transportistas(razon_social), origen:direcciones!origen_id(nombre_lugar), destino:direcciones!destino_id(nombre_lugar)');
    const { data: c } = await supabase.from('clientes').select('id, razon_social');
    const { data: tr } = await supabase.from('transportistas').select('id, razon_social');
    const { data: d } = await supabase.from('direcciones').select('id, nombre_lugar');
    
    if (t) setTarifas(t);
    if (c) setClientes(c);
    if (tr) setTransportistas(tr);
    if (d) setDirecciones(d);
    setLoading(false);
  };

  const handleEdit = (tarifa: any) => {
    setEditingId(tarifa.id);
    setFormData({
      cliente_id: tarifa.cliente_id || "",
      transportista_id: tarifa.transportista_id || "",
      origen_id: tarifa.origen_id || "",
      destino_id: tarifa.destino_id || "",
      precio_costo: tarifa.precio_costo.toString(),
      precio_venta: tarifa.precio_venta.toString(),
      moneda: tarifa.moneda
    });
    if (tarifa.precio_venta > 0) setActiveTab('clientes');
    else setActiveTab('proveedores');
  };

  const eliminarTarifa = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarifa permanentemente?")) return;
    
    try {
      const { error } = await supabase.from('tarifas').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      cliente_id: "",
      transportista_id: "",
      origen_id: "",
      destino_id: "",
      precio_costo: "0",
      precio_venta: "0",
      moneda: "USD"
    });
  };

  const guardarTarifa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no detectada.");

      const payload = {
        empresa_id: user.id,
        origen_id: formData.origen_id || null,
        destino_id: formData.destino_id || null,
        cliente_id: activeTab === 'clientes' ? formData.cliente_id : null,
        transportista_id: activeTab === 'proveedores' ? formData.transportista_id : null,
        precio_costo: activeTab === 'proveedores' ? parseFloat(formData.precio_costo) : 0,
        precio_venta: activeTab === 'clientes' ? parseFloat(formData.precio_venta) : 0,
        moneda: formData.moneda
      };

      if (editingId) {
        const { error } = await supabase.from('tarifas').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tarifas').insert([payload]);
        if (error) throw error;
      }

      resetForm();
      loadData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
          Control de Tarifas
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-1">
          <form onSubmit={guardarTarifa} className={cn(
            "p-6 rounded-2xl border space-y-4 shadow-xl sticky top-8 transition-all duration-300",
            editingId ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          )}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2">
                <DollarSign size={14}/> 
                {editingId ? 'Editando Tarifa' : `Nueva Tarifa ${activeTab === 'clientes' ? 'Venta' : 'Compra'}`}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-amber-600 hover:text-amber-800">
                  <X size={16} />
                </button>
              )}
            </div>
            
            {activeTab === 'clientes' ? (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Cliente</label>
                <select name="cliente_id" required value={formData.cliente_id} onChange={e => setFormData({...formData, cliente_id: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold">
                  <option value="">-- Seleccionar --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Transportista</label>
                <select name="transportista_id" required value={formData.transportista_id} onChange={e => setFormData({...formData, transportista_id: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold">
                  <option value="">-- Seleccionar --</option>
                  {transportistas.map(tr => <option key={tr.id} value={tr.id}>{tr.razon_social}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase block">Ruta</label>
              <select name="origen_id" required value={formData.origen_id} onChange={e => setFormData({...formData, origen_id: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-[10px] font-bold">
                <option value="">-- Origen --</option>
                {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
              </select>
              <select name="destino_id" required value={formData.destino_id} onChange={e => setFormData({...formData, destino_id: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-[10px] font-bold">
                <option value="">-- Destino --</option>
                {direcciones.map(d => <option key={d.id} value={d.id}>{d.nombre_lugar}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Precio</label>
                <input 
                  type="number" 
                  value={activeTab === 'clientes' ? formData.precio_venta : formData.precio_costo} 
                  onChange={e => setFormData({...formData, [activeTab === 'clientes' ? 'precio_venta' : 'precio_costo']: e.target.value})} 
                  className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold" 
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Divisa</label>
                <select name="moneda" value={formData.moneda} onChange={e => setFormData({...formData, moneda: e.target.value})} className="w-full bg-slate-100 border p-3 rounded-xl text-xs font-black">
                  <option value="USD">USD</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving} className={cn(
              "w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all",
              editingId ? "bg-amber-600 text-white hover:bg-amber-500" : "bg-slate-900 text-white hover:bg-blue-600"
            )}>
              {saving ? <Loader2 className="animate-spin mx-auto" /> : editingId ? "Actualizar" : "Registrar"}
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit shadow-sm">
            <button onClick={() => { setActiveTab('clientes'); resetForm(); }} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'clientes' ? "bg-blue-600 text-white shadow-md" : "text-slate-500")}>
              <Users size={14} /> Venta
            </button>
            <button onClick={() => { setActiveTab('proveedores'); resetForm(); }} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'proveedores' ? "bg-slate-900 text-white shadow-md" : "text-slate-500")}>
              <Truck size={14} /> Compra
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-50 dark:bg-slate-800 font-black uppercase tracking-widest text-slate-500 border-b">
                <tr>
                  <th className="p-5">Ruta</th>
                  <th className="p-5">{activeTab === 'clientes' ? 'Cliente' : 'Transportista'}</th>
                  <th className="p-5 text-right">Tarifa</th>
                  <th className="p-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tarifas
                  .filter(t => activeTab === 'clientes' ? t.precio_venta > 0 : t.precio_costo > 0)
                  .map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors italic font-bold">
                      <td className="p-5">
                        {t.origen?.nombre_lugar} <ArrowRight size={10} className="inline mx-1 text-blue-500"/> {t.destino?.nombre_lugar}
                      </td>
                      <td className="p-5 uppercase text-slate-500">
                        {activeTab === 'clientes' ? (t.clientes?.razon_social || 'N/A') : (t.transportistas?.razon_social || 'N/A')}
                      </td>
                      <td className="p-5 text-right">
                        <span className="px-3 py-1.5 rounded-lg font-black text-sm bg-slate-50">
                          ${activeTab === 'clientes' ? t.precio_venta : t.precio_costo} <span className="text-[9px]">{t.moneda}</span>
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => eliminarTarifa(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}