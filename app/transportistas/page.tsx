"use client";

import { useState, useEffect, FormEvent } from "react";
import { Truck, Save, Loader2, Building2, Phone, Mail, Hash } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

export default function TransportistasPage() {
  const [transportistas, setTransportistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    razon_social: "",
    rfc: "",
    caat_scac: "",
    tipo_flota: "CAJA SECA 53",
    contacto_nombre: "",
  });

  useEffect(() => {
    fetchTransportistas();
  }, []);

  const fetchTransportistas = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('transportistas')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTransportistas(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarTransportista = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Sesión expirada.");
      setSaving(false);
      return;
    }
    
    const { error } = await supabase
      .from('transportistas')
      .insert([{ 
        empresa_id: user.id,
        razon_social: formData.razon_social.toUpperCase(),
        rfc: formData.rfc.toUpperCase(),
        caat_scac: formData.caat_scac.toUpperCase(),
        tipo_flota: formData.tipo_flota,
        contacto_nombre: formData.contacto_nombre.toUpperCase()
      }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setFormData({ razon_social: "", rfc: "", caat_scac: "", tipo_flota: "CAJA SECA 53", contacto_nombre: "" });
      fetchTransportistas();
    }
    setSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
          Líneas Transportistas
        </h1>
        <p className="text-sm text-slate-500 font-medium text-[10px] uppercase tracking-widest">Catálogo maestro de proveedores de flota.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE ALTA */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Truck className="text-emerald-500" size={20} />
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Nuevo Transportista</h2>
            </div>
            
            <form onSubmit={guardarTransportista} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Razón Social *</label>
                <input type="text" name="razon_social" required value={formData.razon_social} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 dark:text-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">RFC</label>
                  <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">CAAT / SCAC</label>
                  <input type="text" name="caat_scac" value={formData.caat_scac} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Tipo de Flota</label>
                <select name="tipo_flota" value={formData.tipo_flota} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 dark:text-white">
                  <option value="CAJA SECA 53">CAJA SECA 53'</option>
                  <option value="PLATAFORMA">PLATAFORMA</option>
                  <option value="REFRIGERADO">REFRIGERADO</option>
                  <option value="FULL">FULL</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Contacto Principal</label>
                <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 dark:text-white" />
              </div>

              <button type="submit" disabled={saving} className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl hover:scale-[1.02]">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Registrando...' : 'Agregar a la Red'}
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO DE TRANSPORTISTAS */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-4 font-black">Transportista</th>
                  <th className="p-4 font-black">Especialidad</th>
                  <th className="p-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={3} className="p-10 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" size={32} /></td></tr>
                ) : transportistas.length === 0 ? (
                  <tr><td colSpan={3} className="p-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No hay líneas registradas.</td></tr>
                ) : (
                  transportistas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4">
                        <div className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{t.razon_social}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">RFC: {t.rfc || 'N/D'} | SCAC: {t.caat_scac || 'N/D'}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {t.tipo_flota}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700">Detalles</button>
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