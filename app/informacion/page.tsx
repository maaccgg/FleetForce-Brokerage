"use client";

import { useState, useEffect } from "react";
import { MapPin, Save, Loader2, Search, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

export default function InformacionPage() {
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const guardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('direcciones').insert([{ 
      empresa_id: user?.id, 
      ...formData,
      nombre_lugar: formData.nombre_lugar.toUpperCase(),
      direccion: formData.direccion.toUpperCase()
    }]);

    if (!error) {
      setFormData({ nombre_lugar: "", direccion: "", ciudad: "", estado: "", cp: "", contacto_nombre: "", maps_link: "", tipo: "AMBOS" });
      fetchDirecciones();
    }
    setSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-8">
        Directorio de Ubicaciones
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="lg:col-span-1">
          <form onSubmit={guardarDireccion} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <input type="text" placeholder="Nombre del Lugar (Ej: Bodega NL)" required className="w-full bg-slate-50 dark:bg-slate-950 border p-3 rounded-xl text-sm" value={formData.nombre_lugar} onChange={e => setFormData({...formData, nombre_lugar: e.target.value})} />
            <input type="text" placeholder="Dirección Exacta" required className="w-full bg-slate-50 dark:bg-slate-950 border p-3 rounded-xl text-sm" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Ciudad" className="bg-slate-50 dark:bg-slate-950 border p-3 rounded-xl text-sm" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
              <input type="text" placeholder="Estado" className="bg-slate-50 dark:bg-slate-950 border p-3 rounded-xl text-sm" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} />
            </div>
            <input type="text" placeholder="Link de Maps" className="w-full bg-slate-50 dark:bg-slate-950 border p-3 rounded-xl text-sm" value={formData.maps_link} onChange={e => setFormData({...formData, maps_link: e.target.value})} />
            
            <select className="w-full bg-slate-50 dark:bg-slate-950 border p-3 rounded-xl text-sm font-bold" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
              <option value="AMBOS">USAR COMO ORIGEN Y DESTINO</option>
              <option value="ORIGEN">SOLO ORIGEN</option>
              <option value="DESTINO">SOLO DESTINO</option>
            </select>

            <button type="submit" disabled={saving} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">
              {saving ? <Loader2 className="animate-spin mx-auto" /> : "Registrar Ubicación"}
            </button>
          </form>
        </div>

        {/* TABLA */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="p-4">Lugar</th>
                  <th className="p-4">Dirección / Ciudad</th>
                  <th className="p-4">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {direcciones.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-black text-slate-900 dark:text-white uppercase">{d.nombre_lugar}</td>
                    <td className="p-4 text-slate-500">{d.direccion} <br/> <span className="font-bold text-slate-400">{d.ciudad}, {d.estado}</span></td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[9px]">{d.tipo}</span>
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