"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, Loader2, Trash2, Edit2, X, Building2, 
  Package, Globe, User, ExternalLink, Save, Plus, Search, ChevronRight 
} from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";

export default function InformacionPage() {
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Controles de Vista y Modal
  const [activeTab, setActiveTab] = useState<'TODOS' | 'ORIGEN' | 'DESTINO'>('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombre_lugar: "",
    direccion: "",
    ciudad: "",
    estado: "",
    cp: "",
    contacto_nombre: "",
    maps_link: "",
    tipo: "ORIGEN"
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
      tipo: dir.tipo || "ORIGEN"
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nombre_lugar: "", direccion: "", ciudad: "", estado: "", cp: "", contacto_nombre: "", maps_link: "", tipo: "ORIGEN"
    });
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

      closeModal();
      fetchDirecciones();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const eliminarDireccion = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta ubicación del directorio institucional?")) return;
    const { error } = await supabase.from('direcciones').delete().eq('id', id);
    if (!error) fetchDirecciones();
  };

  const filtradas = direcciones.filter(d => {
    const matchesSearch = d.nombre_lugar?.toLowerCase().includes(searchTerm.toLowerCase()) || d.ciudad?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'TODOS' || d.tipo === activeTab || d.tipo === 'AMBOS';
    return matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Directorio Operativo</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Puntos Estratégicos de la Institución</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={16} /> Nueva Ubicación
        </button>
      </div>

      {/* TABS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button onClick={() => setActiveTab('TODOS')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'TODOS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Catálogo</button>
          <button onClick={() => setActiveTab('ORIGEN')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'ORIGEN' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>Recolección</button>
          <button onClick={() => setActiveTab('DESTINO')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'DESTINO' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>Entrega</button>
        </div>
        <div className="w-full md:w-96 relative">
          <input 
            type="text" 
            placeholder="Buscar por Nombre o Ciudad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500 shadow-sm pl-10"
          />
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
      </div>

      {/* TABLA CENTRAL */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 font-black uppercase tracking-widest text-slate-500 border-b text-[9px]">
              <th className="p-6">Ubicación Operativa</th>
              <th className="p-6 text-center">Tipo</th>
              <th className="p-6">Contacto y Enlaces</th>
              <th className="p-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin inline text-blue-500" /></td></tr>
            ) : filtradas.map(d => (
              <tr key={d.id} className="hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => handleEdit(d)}>
                <td className="p-6">
                  <p className="font-black text-slate-900 uppercase italic text-base tracking-tighter">{d.nombre_lugar}</p>
                  <p className="text-slate-400 font-bold text-[10px] mt-1">{d.ciudad}, {d.estado}</p>
                </td>
                <td className="p-6 text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    d.tipo === 'AMBOS' ? "bg-slate-100 text-slate-600 border-slate-200" : 
                    d.tipo === 'ORIGEN' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                    "bg-blue-50 text-blue-700 border-blue-100"
                  )}>
                    {d.tipo}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-2">
                    {d.contacto_nombre && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase">
                        <User size={12} className="text-slate-400" /> {d.contacto_nombre}
                      </div>
                    )}
                    {d.maps_link && (
                      <a href={d.maps_link} target="_blank" onClick={(e) => e.stopPropagation()} rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] font-black text-blue-600 hover:underline tracking-tighter uppercase">
                        <Globe size={12} /> Google Maps <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={(e) => eliminarDireccion(e, d.id)} className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          MODAL (POP-UP) DE REGISTRO / EDICIÓN
          ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (Fondo desenfocado) */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModal}
          />
          
          {/* Contenedor del Modal */}
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  {editingId ? 'Editar Ubicación' : 'Nueva Ubicación'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Directorio Operativo FleetForce</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarDireccion} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Nombre Comercial</label>
                  <input type="text" required value={formData.nombre_lugar} onChange={e => setFormData({...formData, nombre_lugar: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-black uppercase outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Uso Operativo</label>
                  <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-emerald-500">
                    <option value="ORIGEN">RECOLECCIÓN (ORIGEN)</option>
                    <option value="DESTINO">ENTREGA (DESTINO)</option>
                    <option value="AMBOS">USO DUAL (AMBOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Dirección Completa</label>
                <input type="text" required value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Ciudad</label>
                  <input type="text" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Estado</label>
                  <input type="text" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Contacto en Sitio</label>
                  <div className="relative">
                    <input type="text" value={formData.contacto_nombre} onChange={e => setFormData({...formData, contacto_nombre: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 pl-10" />
                    <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1">Enlace Google Maps</label>
                  <div className="relative">
                    <input type="text" value={formData.maps_link} onChange={e => setFormData({...formData, maps_link: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-[10px] text-blue-600 outline-none focus:border-emerald-500 pl-10" />
                    <Globe size={14} className="absolute left-3.5 top-3.5 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-slate-100">
                  Cerrar
                </button>
                <button type="submit" disabled={saving} className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl">
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                  {editingId ? "Actualizar" : "Guardar Ubicación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}