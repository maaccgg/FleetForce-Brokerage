"use client";

import { useState, useEffect } from "react";
import { Users, Save, Loader2, Building2, Phone, Mail } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    razon_social: "",
    rfc: "",
    contacto_nombre: "",
    contacto_email: "",
    contacto_telefono: "",
  });

  // 1. Inicializar datos
useEffect(() => {
  async function checkUser() {
    const { data, error } = await supabase.auth.getSession();
    console.log("Estado de la sesión:", data.session);
    if (error) console.error("Error de Auth:", error.message);
    
    if (!data.session) {
      console.warn("No hay sesión activa. Redirigiendo...");
      // router.push('/login'); // Opcional: activar después de probar
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
        .order('created_at', { ascending: false });
      
      if (data) setClientes(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Guardar nuevo cliente
  const guardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return alert("Error de sesión.");
    
    setSaving(true);
    const { error } = await supabase
      .from('clientes')
      .insert([{ 
        empresa_id: empresaId,
        ...formData 
      }]);

    setSaving(false);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      // Limpiar formulario y recargar tabla
      setFormData({ razon_social: "", rfc: "", contacto_nombre: "", contacto_email: "", contacto_telefono: "" });
      fetchClientes();
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
        
        {/* COLUMNA IZQUIERDA: FORMULARIO DE ALTA */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Building2 className="text-blue-600" size={20} />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Nuevo Registro</h2>
            </div>
            
            <form onSubmit={guardarCliente} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Razón Social *</label>
                <input type="text" name="razon_social" required value={formData.razon_social} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 uppercase" placeholder="Ej. LUBRICANTES DE AMERICA SA DE CV" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">RFC / TAX ID</label>
                <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 uppercase" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Nombre de Contacto</label>
                <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Teléfono</label>
                  <input type="text" name="contacto_telefono" value={formData.contacto_telefono} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Email</label>
                  <input type="email" name="contacto_email" value={formData.contacto_email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 lowercase" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Registrando...' : 'Agregar Cliente'}
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
                    <th className="p-4 font-black text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></td>
                    </tr>
                  ) : clientes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">Sin clientes en la Institución.</td>
                    </tr>
                  ) : (
                    clientes.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-slate-900 uppercase">
                          {c.razon_social}
                          <span className="block text-[10px] font-bold text-slate-400 mt-1">RFC: {c.rfc || 'N/D'}</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="flex items-center gap-1 font-bold uppercase text-xs mb-1">
                            <Users size={12} className="text-slate-400"/> {c.contacto_nombre || 'N/D'}
                          </div>
                          <div className="flex items-center gap-3 text-[10px]">
                            {c.contacto_telefono && <span className="flex items-center gap-1"><Phone size={10}/> {c.contacto_telefono}</span>}
                            {c.contacto_email && <span className="flex items-center gap-1 lowercase"><Mail size={10}/> {c.contacto_email}</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-bold uppercase tracking-widest">Editar</button>
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