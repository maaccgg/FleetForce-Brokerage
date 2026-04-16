"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Truck, Save, Loader2, Edit2, Trash2, X, 
  Plus, Search, ChevronRight, Building2, Layers
} from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";

export default function TransportistasPage() {
  const router = useRouter();
  const [transportistas, setTransportistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    razon_social: "", rfc: "", caat: "", scac: "", direccion: "", 
    tipo_flota: "CAJA SECA 53", contacto_nombre: "", contacto_email: ""
  });

  useEffect(() => { fetchTransportistas(); }, []);

  const fetchTransportistas = async () => {
    setLoading(true);
    const { data } = await supabase.from('transportistas').select('*').order('razon_social', { ascending: true }); 
    if (data) setTransportistas(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      razon_social: t.razon_social || "", rfc: t.rfc || "", caat: t.caat || "", 
      scac: t.scac || "", direccion: t.direccion || "", tipo_flota: t.tipo_flota || "CAJA SECA 53", 
      contacto_nombre: t.contacto_nombre || "", contacto_email: t.contacto_email || ""
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      razon_social: "", rfc: "", caat: "", scac: "", direccion: "", 
      tipo_flota: "CAJA SECA 53", contacto_nombre: "", contacto_email: ""
    });
  };

  const eliminarTransportista = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Deseas eliminar permanentemente esta línea de la red?")) return;
    const { error } = await supabase.from('transportistas').delete().eq('id', id);
    if (!error) fetchTransportistas();
  };

  const guardarTransportista = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        empresa_id: user?.id,
        razon_social: formData.razon_social.toUpperCase(),
        rfc: formData.rfc.toUpperCase(),
        caat: formData.caat.toUpperCase(),
        scac: formData.scac.toUpperCase(),
        direccion: formData.direccion.toUpperCase(),
        tipo_flota: formData.tipo_flota,
        contacto_nombre: formData.contacto_nombre.toUpperCase(), 
        contacto_email: formData.contacto_email.toLowerCase()
      };
      if (editingId) await supabase.from('transportistas').update(payload).eq('id', editingId);
      else await supabase.from('transportistas').insert([payload]);
      closeModal();
      fetchTransportistas();
    } catch (error) {
      alert("Error: " + error.message);
    } finally { setSaving(false); }
  };

  // Función para determinar el equipo con más unidades
  const getFlotaPrincipal = (t) => {
    const unidades = [
      { label: "Nissan", count: t.unidades_nissan || 0 },
      { label: "3.5 Ton", count: t.unidades_3_5 || 0 },
      { label: "Rabón", count: t.unidades_rabon || 0 },
      { label: "Torthon", count: t.unidades_torton || 0 },
      { label: "Caja 53'", count: t.unidades_caja_53 || 0 }
    ];
    
    // Buscar el que tiene el número mayor
    const principal = unidades.reduce((max, current) => (current.count > max.count ? current : max), unidades[0]);
    
    if (principal.count === 0) return { label: "Sin inventario", count: 0 };
    return principal;
  };

  const filtrados = transportistas.filter(t => 
    t.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      {/* HEADER LIMPIO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Líneas de Transporte
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide uppercase">Directorio</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
            Gestión de Proveedores de Flota
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Nueva Línea
        </button>
      </div>

      {/* BÚSQUEDA */}
      <div className="mb-6 w-full md:w-96 relative">
        <input 
          type="text" 
          placeholder="Buscar por nombre o RFC..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all text-slate-800 placeholder:text-slate-400"
        />
        <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
      </div>

      {/* TABLA SIMPLIFICADA */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Nombre Comercial</th>
              <th className="py-4 px-6">RFC</th>
              <th className="py-4 px-6">Principal Unidad</th>
              <th className="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-sm font-medium text-slate-400">No se encontraron líneas de transporte.</td></tr>
            ) : filtrados.map((t) => {
              const flotaPrincipal = getFlotaPrincipal(t);
              
              return (
                <tr 
                  key={t.id} 
                  onClick={() => router.push(`/transportistas/${t.id}`)} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  {/* COLUMNA 1: NOMBRE COMERCIAL */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shrink-0">
                        <Building2 size={18} />
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">
                        {t.razon_social}
                      </span>
                    </div>
                  </td>

                  {/* COLUMNA 2: RFC */}
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-slate-600 tracking-wide uppercase">
                      {t.rfc || 'S/N'}
                    </span>
                  </td>

                  {/* COLUMNA 3: PRINCIPAL UNIDAD (Dinámica) */}
                  <td className="py-4 px-6">
                    {flotaPrincipal.count > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1.5 rounded-md bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                          {flotaPrincipal.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Layers size={14} className="text-slate-400"/> ({flotaPrincipal.count})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">Sin inventario</span>
                    )}
                  </td>

                  {/* COLUMNA 4: ACCIONES */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={(e) => eliminarTransportista(e, t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all ml-2" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVA LÍNEA (LIMPIO) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100"><Truck size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Actualizar Línea' : 'Nueva Línea de Transporte'}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expediente Institucional</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-800 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={guardarTransportista} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Razón Social</label>
                  <input type="text" required name="razon_social" value={formData.razon_social} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase text-slate-800" placeholder="Nombre de la empresa" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Flota</label>
                  <select name="tipo_flota" value={formData.tipo_flota} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800">
                    <option value="NISSAN">NISSAN</option>
                    <option value="3.5 TON">3.5 TON</option>
                    <option value="RABON">RABON</option>
                    <option value="TORTON">TORTON</option>
                    <option value="CAJA SECA 53">CAJA SECA 53'</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RFC</label><input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase text-slate-800" placeholder="AAA010101AAA" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CAAT</label><input type="text" name="caat" value={formData.caat} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase text-slate-800" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SCAC</label><input type="text" name="scac" value={formData.scac} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase text-slate-800" /></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre del Contacto</label><input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800" placeholder="Responsable" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label><input type="email" name="contacto_email" value={formData.contacto_email} onChange={handleChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800" placeholder="email@empresa.com" /></div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {editingId ? "Guardar Cambios" : "Agregar a la Red"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}