"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  Truck, Save, Loader2, Edit2, Trash2, X, MapPin, 
  Mail, ShieldCheck, Plus, Search, User, ChevronRight 
} from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";

export default function TransportistasPage() {
  const router = useRouter();
  const [transportistas, setTransportistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Controles del Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    razon_social: "",
    rfc: "",
    caat: "",
    scac: "",
    direccion: "",
    tipo_flota: "CAJA SECA 53",
    contacto_nombre: "",
    contacto_email: ""
  });

  useEffect(() => {
    fetchTransportistas();
  }, []);

  const fetchTransportistas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('transportistas')
      .select('*')
      .order('razon_social', { ascending: true }); 
    if (data) setTransportistas(data);
    setLoading(false);
  };

  // Función vital para el funcionamiento del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({
      razon_social: t.razon_social || "",
      rfc: t.rfc || "",
      caat: t.caat || "",
      scac: t.scac || "",
      direccion: t.direccion || "",
      tipo_flota: t.tipo_flota || "CAJA SECA 53",
      contacto_nombre: t.contacto_nombre || "",
      contacto_email: t.contacto_email || ""
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      razon_social: "", rfc: "", caat: "", scac: "", direccion: "", tipo_flota: "CAJA SECA 53", contacto_nombre: "", contacto_email: ""
    });
  };

  const eliminarTransportista = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("¿Deseas eliminar permanentemente esta línea de la red?")) return;
    const { error } = await supabase.from('transportistas').delete().eq('id', id);
    if (!error) fetchTransportistas();
  };

  const guardarTransportista = async (e: FormEvent) => {
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

      if (editingId) {
        await supabase.from('transportistas').update(payload).eq('id', editingId);
      } else {
        await supabase.from('transportistas').insert([payload]);
      }
      closeModal();
      fetchTransportistas();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filtrados = transportistas.filter(t => 
    t.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.scac?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Líneas de Transporte</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Catálogo Maestro de Proveedores</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={16} /> Nueva Línea
        </button>
      </div>

      {/* BÚSQUEDA */}
      <div className="mb-8 w-full md:w-96 relative">
        <input 
          type="text" 
          placeholder="Buscar por Nombre o Identificador..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500 shadow-sm pl-10"
        />
        <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
      </div>

      {/* TABLA CON DETALLES RESTAURADOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">
              <th className="p-6">Transportista & Fiscal</th>
              <th className="p-6">Operativa & Flota</th>
              <th className="p-6">Contacto</th>
              <th className="p-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" size={32} /></td></tr>
            ) : filtrados.map((t) => (
              <tr 
                key={t.id} 
                onClick={() => router.push(`/transportistas/${t.id}`)} 
                className="hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                {/* COLUMNA 1: IDENTIDAD Y FISCAL (ITÁLICAS Y TRACKING TIGHTER) */}
                <td className="p-6 align-top">
                  <div className="font-black text-slate-900 uppercase italic tracking-tighter text-base flex items-center gap-2">
                    {t.razon_social}
                    <ShieldCheck size={14} className="text-emerald-500" />
                  </div>
                  {t.direccion && (
                    <div className="flex items-start gap-1 mt-1.5 text-[10px] text-slate-500 font-medium max-w-[250px] leading-tight uppercase">
                      <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5"/>
                      <span>{t.direccion}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-bold mt-2">
                    RFC: <span className="uppercase text-slate-600">{t.rfc || 'N/D'}</span>
                  </div>
                </td>

                {/* COLUMNA 2: IDENTIFICADORES (DISEÑO SLATE-100) */}
                <td className="p-6 align-top">
                  <div className="mb-3">
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-[9px] font-black text-emerald-700 border border-emerald-100 uppercase tracking-widest">
                      {t.tipo_flota}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                    <div className="flex items-center gap-2">
                      <span className="w-8">CAAT:</span>
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{t.caat || '---'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8">SCAC:</span>
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{t.scac || '---'}</span>
                    </div>
                  </div>
                </td>

                {/* COLUMNA 3: CONTACTO */}
                <td className="p-6 align-top">
                  <div className="space-y-2 text-[10px]">
                    <div className="flex items-center gap-2 font-bold text-slate-600 uppercase">
                      <User size={12} className="text-slate-400" /> {t.contacto_nombre || 'S/C'}
                    </div>
                    {t.contacto_email && (
                      <div className="flex items-center gap-2 lowercase text-blue-600 font-medium tracking-wide">
                        <Mail size={12} className="text-blue-300"/> {t.contacto_email}
                      </div>
                    )}
                  </div>
                </td>

                {/* COLUMNA 4: ACCIONES (OPACITY ON HOVER) */}
                <td className="p-6 text-right align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(t); }} 
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => eliminarTransportista(e, t.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:text-emerald-500 ml-2" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL POP-UP (DISEÑO FLEETFORCE) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                    {editingId ? 'Modificar Línea' : 'Nueva Línea'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expediente de Flota Institucional</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={guardarTransportista} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Razón Social</label>
                  <input type="text" required name="razon_social" value={formData.razon_social} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-black uppercase outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Tipo de Flota</label>
                  <select name="tipo_flota" value={formData.tipo_flota} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-emerald-500">
                    <option value="CAJA SECA 53">CAJA SECA 53'</option>
                    <option value="PLATAFORMA">PLATAFORMA</option>
                    <option value="REFRIGERADO">REFRIGERADO</option>
                    <option value="FULL">FULL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Dirección Fiscal</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">RFC</label>
                  <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">CAAT</label>
                  <input type="text" name="caat" value={formData.caat} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">SCAC</label>
                  <input type="text" name="scac" value={formData.scac} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-black uppercase outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Contacto</label>
                  <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Email</label>
                  <input type="email" name="contacto_email" value={formData.contacto_email} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={16} />}
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