"use client";

import { useState, useEffect } from "react";
import { Users, Save, Loader2, Building2, Phone, Mail, Edit2, Trash2, X } from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    razon_social: "",
    rfc: "",
    contacto_nombre: "",
    contacto_email: "",
    contacto_telefono: "",
  });

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error de Auth:", error.message);
      if (!data.session) {
        console.warn("No hay sesión activa.");
      }
    }
    checkUser();
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setEmpresaId(user.id);
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .order('razon_social', { ascending: true }); 
      
      if (data) setClientes(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (cliente: any) => {
    setEditingId(cliente.id);
    setFormData({
      razon_social: cliente.razon_social || "",
      rfc: cliente.rfc || "",
      contacto_nombre: cliente.contacto_nombre || "",
      contacto_email: cliente.contacto_email || "",
      contacto_telefono: cliente.contacto_telefono || "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      razon_social: "", rfc: "", contacto_nombre: "", contacto_email: "", contacto_telefono: ""
    });
  };

  const eliminarCliente = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente? Se perderá la referencia en futuras consultas.")) return;
    
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) alert("Error al eliminar: " + error.message);
    else {
      if (editingId === id) resetForm();
      fetchClientes();
    }
  };

  const guardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return alert("Error de sesión.");
    
    setSaving(true);
    
    // Mantenemos la lógica de backend para guardar limpio, 
    // pero el usuario escribe de forma natural en la UI.
    const payload = {
      empresa_id: empresaId,
      razon_social: formData.razon_social.toUpperCase(),
      rfc: formData.rfc.toUpperCase(),
      contacto_nombre: formData.contacto_nombre, // Permitimos minúsculas/mayúsculas naturales en el nombre
      contacto_email: formData.contacto_email.toLowerCase(),
      contacto_telefono: formData.contacto_telefono
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('clientes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clientes').insert([payload]);
        if (error) throw error;
      }

      resetForm();
      fetchClientes();
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
          Directorio de Clientes
        </h1>
        <p className="text-sm text-slate-500 font-medium">Gestión de empresas expedidoras y consignatarias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-1">
          <div className={cn(
            "p-6 rounded-2xl shadow-sm border sticky top-8 transition-all duration-300",
            editingId ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
          )}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className={editingId ? "text-amber-600" : "text-blue-600"} size={20} />
                <h2 className={cn("text-sm font-bold uppercase tracking-wide", editingId ? "text-amber-900" : "text-slate-900")}>
                  {editingId ? 'Editando Perfil' : 'Nuevo Registro'}
                </h2>
              </div>
              {editingId && (
                <button onClick={resetForm} className="text-amber-600 hover:text-amber-800 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
            
            <form onSubmit={guardarCliente} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Razón Social *</label>
                {/* Eliminada clase uppercase, mantenemos font-bold */}
                <input type="text" name="razon_social" required value={formData.razon_social} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 font-bold" placeholder="Ejemplo: Lubricantes de América S.A. de C.V." />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">RFC / TAX ID</label>
                <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Nombre de Contacto</label>
                <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="Ej: Montserrat Presas" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Teléfono</label>
                  <input type="text" name="contacto_telefono" value={formData.contacto_telefono} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Email</label>
                  <input type="email" name="contacto_email" value={formData.contacto_email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className={cn(
                  "w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg",
                  editingId ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
                )}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Procesando...' : editingId ? 'Actualizar Cliente' : 'Agregar Cliente'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: TABLA DE CATÁLOGO */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="p-4 font-black">Razón Social</th>
                    <th className="p-4 font-black">Contacto</th>
                    <th className="p-4 font-black text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></td>
                    </tr>
                  ) : clientes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Sin clientes registrados.</td>
                    </tr>
                  ) : (
                    clientes.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4 font-black text-slate-900">
                          {c.razon_social}
                          <span className="block text-[10px] font-bold text-slate-400 mt-1 uppercase">RFC: {c.rfc || 'N/D'}</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="flex items-center gap-1 font-bold text-xs mb-1">
                            <Users size={12} className="text-slate-400"/> {c.contacto_nombre || 'N/D'}
                          </div>
                          <div className="flex flex-col gap-1 text-[10px]">
                            {c.contacto_telefono && <span className="flex items-center gap-1 font-bold"><Phone size={10} className="text-slate-400"/> {c.contacto_telefono}</span>}
                            {c.contacto_email && <span className="flex items-center gap-1 text-blue-600 font-medium"><Mail size={10} className="text-blue-400"/> {c.contacto_email}</span>}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(c)} 
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" 
                              title="Editar Perfil"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => eliminarCliente(c.id)} 
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                              title="Eliminar Cliente"
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
    </div>
  );
}