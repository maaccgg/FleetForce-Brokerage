"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, Trash2, Edit2, X, ArrowRight, Building2, Package } from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";

export default function InformacionPage() {
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Controles de Vista y Edición
  const [activeTab, setActiveTab] = useState<'TODOS' | 'ORIGEN' | 'DESTINO'>('TODOS');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre_lugar: "",
    direccion: "",
    ciudad: "",
    estado: "",
    cp: "",
    contacto_nombre: "",
    maps_link: "",
    tipo: "AMBOS"
  });

  useEffect(() => {
    fetchDirecciones();
  }, []);

  const fetchDirecciones = async () => {
    setLoading(true);
    const { data } = await supabase.from('direcciones').select('*').order('nombre_lugar');
    if (data) setDirecciones(data);
    setLoading(false);
  };

  const handleEdit = (dir: any) => {
    setEditingId(dir.id);
    setFormData({
      nombre_lugar: dir.nombre_lugar || "",
      direccion: dir.direccion || "",
      ciudad: dir.ciudad || "",
      estado: dir.estado || "",
      cp: dir.cp || "",
      contacto_nombre: dir.contacto_nombre || "",
      maps_link: dir.maps_link || "",
      tipo: dir.tipo || "AMBOS"
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombre_lugar: "", direccion: "", ciudad: "", estado: "", cp: "", contacto_nombre: "", maps_link: "", tipo: "AMBOS"
    });
  };

  const eliminarDireccion = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta ubicación del directorio?")) return;
    
    const { error } = await supabase.from('direcciones').delete().eq('id', id);
    if (error) alert("Error al eliminar: " + error.message);
    else {
      if (editingId === id) resetForm();
      fetchDirecciones();
    }
  };

  const guardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        empresa_id: user?.id, 
        ...formData,
        nombre_lugar: formData.nombre_lugar.toUpperCase(),
        direccion: formData.direccion.toUpperCase(),
        ciudad: formData.ciudad.toUpperCase(),
        estado: formData.estado.toUpperCase()
      };

      if (editingId) {
        const { error } = await supabase.from('direcciones').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('direcciones').insert([payload]);
        if (error) throw error;
      }

      resetForm();
      fetchDirecciones();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Lógica de filtrado para las pestañas
  const direccionesFiltradas = direcciones.filter(d => {
    if (activeTab === 'TODOS') return true;
    if (activeTab === 'ORIGEN') return d.tipo === 'ORIGEN' || d.tipo === 'AMBOS';
    if (activeTab === 'DESTINO') return d.tipo === 'DESTINO' || d.tipo === 'AMBOS';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
          Directorio Operativo
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gestión de Puntos de Carga y Descarga</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO (ALTA / EDICIÓN) */}
        <div className="lg:col-span-1">
          <form onSubmit={guardarDireccion} className={cn(
            "p-6 rounded-2xl border space-y-4 shadow-sm sticky top-8 transition-all duration-300",
            editingId ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2">
                <MapPin size={14}/> 
                {editingId ? 'Editando Ubicación' : 'Nueva Ubicación'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-amber-600 hover:text-amber-800">
                  <X size={16} />
                </button>
              )}
            </div>

            <input type="text" placeholder="Nombre Comercial (Ejmplo: Bodega NL)" required className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={formData.nombre_lugar} onChange={e => setFormData({...formData, nombre_lugar: e.target.value})} />
            <input type="text" placeholder="Dirección" required className="w-full bg-slate-50 border p-3 rounded-xl text-sm " value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Ciudad" className="bg-slate-50 border p-3 rounded-xl text-sm" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
              <input type="text" placeholder="Estado" className="bg-slate-50 border p-3 rounded-xl text-sm" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} />
            </div>

            <input type="text" placeholder="Nombre de Contacto" className="w-full bg-slate-50 border p-3 rounded-xl text-sm" value={formData.contacto_nombre} onChange={e => setFormData({...formData, contacto_nombre: e.target.value})} />
            <input type="text" placeholder="Link de Google Maps" className="w-full bg-slate-50 border p-3 rounded-xl text-sm" value={formData.maps_link} onChange={e => setFormData({...formData, maps_link: e.target.value})} />
            
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Clasificación Operativa</label>
              <select className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-black" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                <option value="ORIGEN">Solo Origen (Recolección)</option>
                <option value="DESTINO">Solo Destino (Entrega)</option>
              </select>
            </div>

            <button type="submit" disabled={saving} className={cn(
              "w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg",
              editingId ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-slate-900 text-white hover:bg-blue-600"
            )}>
              {saving ? <Loader2 className="animate-spin mx-auto" /> : editingId ? "Actualizar Registro" : "Guardar Ubicación"}
            </button>
          </form>
        </div>

        {/* CONTENEDOR DE TABLA Y TABS */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* TABS DE FILTRADO */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button 
              onClick={() => setActiveTab('TODOS')}
              className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'TODOS' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
            >
              Catálogo Completo
            </button>
            <button 
              onClick={() => setActiveTab('ORIGEN')}
              className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'ORIGEN' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
            >
              <Package size={14} /> Solo Orígenes
            </button>
            <button 
              onClick={() => setActiveTab('DESTINO')}
              className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'DESTINO' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
            >
              <Building2 size={14} /> Solo Destinos
            </button>
          </div>

          {/* TABLA DE DIRECTORIO */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-50 font-black uppercase tracking-widest text-slate-500 border-b">
                <tr>
                  <th className="p-4">Ubicación Operativa</th>
                  <th className="p-4">Logística</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold uppercase"><Loader2 className="animate-spin inline mr-2" size={16}/> Sincronizando...</td></tr>
                ) : direccionesFiltradas.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No hay registros para esta categoría</td></tr>
                ) : (
                  direccionesFiltradas.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <p className="font-black text-slate-900 uppercase italic text-sm tracking-tight">{d.nombre_lugar}</p>
                        <p className="text-slate-500 font-medium mt-0.5">{d.direccion}</p>
                        <p className="font-bold text-slate-400 mt-0.5">{d.ciudad}, {d.estado}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                            d.tipo === 'AMBOS' ? "bg-slate-100 text-slate-600" : 
                            d.tipo === 'ORIGEN' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                            "bg-blue-50 text-blue-600 border border-blue-100"
                          )}>
                            {d.tipo}
                          </span>
                          {d.contacto_nombre && (
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">
                              Cto: <span className="text-slate-900">{d.contacto_nombre}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(d)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => eliminarDireccion(d.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}