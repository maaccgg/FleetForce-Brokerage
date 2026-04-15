"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Building2, User, Phone, Mail, Loader2, X, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false); // Controla el formulario desplegable
  const router = useRouter();

  const [formData, setFormData] = useState({
    razon_social: "",
    rfc: "",
    direccion: "",
    contacto_nombre: "",
    contacto_email: "",
    contacto_telefono: ""
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    setLoading(true);
    const { data, error } = await supabase.from('clientes').select('*').order('razon_social', { ascending: true });
    if (data) setClientes(data);
    setLoading(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('clientes').insert([{ ...formData, empresa_id: user?.id }]);
    
    if (!error) {
      setFormData({ razon_social: "", rfc: "", direccion: "", contacto_nombre: "", contacto_email: "", contacto_telefono: "" });
      setShowForm(false);
      fetchClientes();
    } else {
      alert("Error: " + error.message);
    }
    setSaving(false);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* HEADER Y BOTÓN DESPLEGABLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Directorio de Clientes</h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest text-[10px]">Gestión de Cuentas Comerciales</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-600/20"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} 
          {showForm ? "Cancelar Registro" : "Nuevo Cliente"}
        </button>
      </div>

      {/* FORMULARIO DESPLEGABLE (Colapsable) */}
      {showForm && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 size={14} className="text-blue-500"/> Registrar Nueva Cuenta
          </h3>
          <form onSubmit={guardarCliente} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Razón Social / Nombre</label>
              <input type="text" name="razon_social" required value={formData.razon_social} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">RFC / TAX ID</label>
              <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-blue-500" />
            </div>
            <div className="md:col-span-3">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Dirección Fiscal</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold uppercase outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Contacto Principal</label>
              <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Correo Electrónico</label>
              <input type="email" name="contacto_email" value={formData.contacto_email} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Teléfono</label>
              <input type="text" name="contacto_telefono" value={formData.contacto_telefono} onChange={handleChange} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button type="submit" disabled={saving} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-md flex items-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />} Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar cliente por nombre o RFC..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm font-bold uppercase"
        />
      </div>

      {/* TABLA MAESTRA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                <th className="p-5">Razón Social</th>
                <th className="p-5">RFC</th>
                <th className="p-5">Contacto</th>
                <th className="p-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 font-bold">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No hay clientes registrados.</td></tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr 
                    key={cliente.id} 
                    onClick={() => router.push(`/clientes/${cliente.id}`)} 
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="p-5 font-black text-slate-900 uppercase text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Building2 size={14} />
                      </div>
                      {cliente.razon_social}
                    </td>
                    <td className="p-5 text-slate-500 uppercase text-xs">{cliente.rfc || 'N/A'}</td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                        {cliente.contacto_nombre && <span className="flex items-center gap-1"><User size={10}/> {cliente.contacto_nombre}</span>}
                        {cliente.contacto_email && <span className="flex items-center gap-1"><Mail size={10}/> {cliente.contacto_email}</span>}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <ChevronRight size={20} className="inline text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}