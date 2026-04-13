"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Loader2, MapPin, Search, Edit2, Trash2 } from "lucide-react"; // Añadimos iconos
import { supabase } from "../../lib/supabase/client";

export default function EmbarquesPage() {
  const [embarques, setEmbarques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEmbarques() {
    setLoading(true);
    const { data, error } = await supabase
      .from('embarques')
      .select(`
        id,
        folio,
        estado,
        origen_ciudad,
        destino_ciudad,
        created_at, 
        clientes ( razon_social ),
        transportistas ( razon_social )
      `)
      .order('created_at', { ascending: false });

    if (error) console.error("Error al obtener embarques:", error.message);
    if (data) setEmbarques(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchEmbarques();
  }, []);

  const eliminarEmbarque = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este despacho? Esta acción es irreversible.")) return;
    
    const { error } = await supabase
      .from('embarques')
      .delete()
      .eq('id', id);

    if (error) alert("Error al eliminar: " + error.message);
    else fetchEmbarques();
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Panel de Embarques</h1>
          <p className="text-sm text-slate-500 font-medium">Control de folios y cartas de instrucción activas.</p>
        </div>
        <Link 
          href="/embarques/nuevo"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} /> Nuevo Embarque
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input type="text" placeholder="Buscar por Folio, Cliente o Ciudad..." className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
                <th className="p-4 font-black">Folio</th>
                <th className="p-4 font-black">Cliente</th>
                <th className="p-4 font-black">Línea</th>
                <th className="p-4 font-black">Ruta</th>
                <th className="p-4 font-black">Estado</th>
                <th className="p-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {!loading && embarques.map((emb) => (
                <tr key={emb.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-black text-slate-900">{emb.folio}</td>
                  <td className="p-4 text-slate-700 font-medium">{emb.clientes?.razon_social || 'N/A'}</td>
                  <td className="p-4 text-slate-600">{emb.transportistas?.razon_social || 'N/A'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="text-emerald-600">{emb.origen_ciudad}</span>
                      <MapPin size={12} className="text-slate-300" />
                      <span className="text-blue-600">{emb.destino_ciudad}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">{emb.estado}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/embarques/${emb.id}`} title="Ver PDF" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FileText size={18} />
                      </Link>
                      {/* Enlace de edición (deberás crear la página /embarques/editar/[id]) */}
                      <Link href={`/embarques/editar/${emb.id}`} title="Editar" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => eliminarEmbarque(emb.id)} 
                        title="Eliminar"
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}