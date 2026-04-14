"use client";

import { useState, useEffect, FormEvent } from "react";
import { Truck, Save, Loader2, Edit2, Trash2, X, MapPin, Mail, Phone, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";

export default function TransportistasPage() {
  const [transportistas, setTransportistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

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
    async function checkUser() {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error de Auth:", error.message);
    }
    checkUser();
    fetchTransportistas();
  }, []);

  const fetchTransportistas = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmpresaId(user.id);
      const { data } = await supabase
        .from('transportistas')
        .select('*')
        .order('razon_social', { ascending: true }); 
      if (data) setTransportistas(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (transportista: any) => {
    setEditingId(transportista.id);
    setFormData({
      razon_social: transportista.razon_social || "",
      rfc: transportista.rfc || "",
      caat: transportista.caat || "",
      scac: transportista.scac || "",
      direccion: transportista.direccion || "",
      tipo_flota: transportista.tipo_flota || "CAJA SECA 53",
      contacto_nombre: transportista.contacto_nombre || "",
      contacto_email: transportista.contacto_email || ""
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      razon_social: "", rfc: "", caat: "", scac: "", direccion: "", tipo_flota: "CAJA SECA 53", contacto_nombre: "", contacto_email: ""
    });
  };

  const eliminarTransportista = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este transportista?")) return;
    
    const { error } = await supabase.from('transportistas').delete().eq('id', id);
    if (error) alert("Error al eliminar: " + error.message);
    else {
      if (editingId === id) resetForm();
      fetchTransportistas();
    }
  };

  const guardarTransportista = async (e: FormEvent) => {
    e.preventDefault();
    if (!empresaId) return alert("Sesión expirada.");
    
    setSaving(true);

    // Estandarización de datos para la Institución
    const payload = {
      empresa_id: empresaId,
      razon_social: formData.razon_social.toUpperCase(),
      rfc: formData.rfc.toUpperCase(),
      caat: formData.caat.toUpperCase(),
      scac: formData.scac.toUpperCase(),
      direccion: formData.direccion.toUpperCase(),
      tipo_flota: formData.tipo_flota,
      contacto_nombre: formData.contacto_nombre, 
      contacto_email: formData.contacto_email.toLowerCase()
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('transportistas').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transportistas').insert([payload]);
        if (error) throw error;
      }

      resetForm();
      fetchTransportistas();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
          Líneas Transportistas
        </h1>
        <p className="text-sm text-slate-500 font-medium text-[10px] uppercase tracking-widest">Catálogo maestro de proveedores de flota.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE ALTA / EDICIÓN */}
        <div className="lg:col-span-1">
          <div className={cn(
            "p-6 rounded-2xl border shadow-sm sticky top-8 transition-all duration-300",
            editingId ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Truck className={editingId ? "text-amber-600" : "text-emerald-500"} size={20} />
                <h2 className={cn("text-xs font-black uppercase tracking-widest", editingId ? "text-amber-900" : "text-slate-900")}>
                  {editingId ? 'Editando Línea' : 'Nuevo Transportista'}
                </h2>
              </div>
              {editingId && (
                <button onClick={resetForm} className="text-amber-600 hover:text-amber-800 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
            
            <form onSubmit={guardarTransportista} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Razón Social *</label>
                <input type="text" name="razon_social" required value={formData.razon_social} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 font-bold transition-all" placeholder="Ejemplo: Transportes TRGA" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Dirección Fiscal / Operativa</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" placeholder="Calle, Número, Ciudad, Estado" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">RFC</label>
                  <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">CAAT</label>
                  <input type="text" name="caat" value={formData.caat} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">SCAC</label>
                  <input type="text" name="scac" value={formData.scac} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Tipo de Flota</label>
                <select name="tipo_flota" value={formData.tipo_flota} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 font-bold">
                  <option value="CAJA SECA 53">CAJA SECA 53'</option>
                  <option value="PLATAFORMA">PLATAFORMA</option>
                  <option value="REFRIGERADO">REFRIGERADO</option>
                  <option value="FULL">FULL</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Contacto</label>
                  <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" placeholder="Nombre" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Email</label>
                  <input type="email" name="contacto_email" value={formData.contacto_email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" placeholder="@" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className={cn(
                  "w-full mt-4 flex items-center justify-center gap-2 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl",
                  editingId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
                )}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Procesando...' : editingId ? 'Actualizar Línea' : 'Agregar a la Red'}
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO DE TRANSPORTISTAS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-4 font-black">Transportista & Fiscal</th>
                  <th className="p-4 font-black">Operativa & Contacto</th>
                  <th className="p-4 font-black text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="p-10 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" size={32} /></td></tr>
                ) : transportistas.length === 0 ? (
                  <tr><td colSpan={3} className="p-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No hay líneas registradas.</td></tr>
                ) : (
                  transportistas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      
                      {/* COLUMNA 1: IDENTIDAD Y FISCAL */}
                      <td className="p-4 align-top">
                        <div className="font-black text-slate-900 uppercase italic tracking-tighter">{t.razon_social}</div>
                        {t.direccion && (
                          <div className="flex items-start gap-1 mt-1.5 text-[10px] text-slate-500 font-medium max-w-[250px] leading-tight">
                            <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5"/>
                            <span>{t.direccion}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-bold mt-2">
                          RFC: <span className="uppercase text-slate-600">{t.rfc || 'N/D'}</span>
                        </div>
                      </td>

                      {/* COLUMNA 2: OPERATIVA Y CONTACTO */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-[9px] font-black text-emerald-700 border border-emerald-100">
                            {t.tipo_flota}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase mb-2">
                          {t.caat && <span title="Código Alfanumérico Armonizado del Transportista">CAAT: <span className="text-slate-900">{t.caat}</span></span>}
                          {t.scac && <span title="Standard Carrier Alpha Code">SCAC: <span className="text-slate-900">{t.scac}</span></span>}
                        </div>
                        <div className="space-y-1 text-[10px]">
                          {t.contacto_nombre && (
                            <div className="font-bold text-slate-600">Cto: <span className="text-slate-900">{t.contacto_nombre}</span></div>
                          )}
                          {t.contacto_email && (
                            <div className="flex items-center gap-1 lowercase text-blue-600 font-medium">
                              <Mail size={10} className="text-blue-400"/> {t.contacto_email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* COLUMNA 3: ACCIONES */}
                      <td className="p-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(t)} 
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" 
                            title="Editar Transportista"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => eliminarTransportista(t.id)} 
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                            title="Eliminar Transportista"
                          >
                            <Trash2 size={18} />
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