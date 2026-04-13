"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase/client";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CartaInstruccionesPDF() {
  const params = useParams();
  const [embarque, setEmbarque] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetalle() {
      if (!params.id) return;
      
      const { data, error } = await supabase
        .from('embarques')
        .select(`
          *,
          clientes ( razon_social, rfc, contacto_nombre ),
          transportistas ( razon_social, caat_scac, contacto_nombre )
        `)
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setEmbarque(data);
      }
      setLoading(false);
    }
    fetchDetalle();
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-900" size={32} /></div>;
  }

  if (!embarque) {
    return <div className="p-10 text-center text-red-600 font-bold">Folio no encontrado en la Institución.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:py-0 print:bg-white font-sans">
      
      {/* CONTROLES (SE OCULTAN AL IMPRIMIR) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/embarques" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} /> Volver
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs shadow-lg hover:bg-slate-800"
        >
          <Printer size={16} /> Imprimir PDF
        </button>
      </div>

      {/* HOJA A4 (EL DOCUMENTO REAL) */}
      <div className="max-w-4xl mx-auto bg-white p-12 shadow-2xl print:shadow-none print:p-0 print:max-w-none text-slate-900">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Fleet<span className="text-slate-400">Force</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-1">Institución Logística</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase">Carta de Instrucciones</h2>
            <p className="text-sm font-bold mt-1">FOLIO: <span className="text-slate-500">{embarque.folio}</span></p>
            <p className="text-xs text-slate-500 uppercase mt-1">Ejecutivo: {embarque.ejecutivo || 'Asignado por Sistema'}</p>
          </div>
        </div>

        {/* ASIGNACIÓN (CARRIER) */}
        <div className="mb-8">
          <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest p-2 mb-2">Asignación Transportista</div>
          <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 text-sm">
            <div>
              <p><span className="font-bold text-slate-500 text-xs">LÍNEA:</span> <span className="font-bold uppercase">{embarque.transportistas?.razon_social}</span></p>
              <p className="mt-1"><span className="font-bold text-slate-500 text-xs">CONTACTO:</span> <span className="uppercase">{embarque.transportistas?.contacto_nombre || 'N/D'}</span></p>
            </div>
            <div>
              <p><span className="font-bold text-slate-500 text-xs">UNIDAD:</span> <span className="font-bold uppercase">{embarque.unidad || 'Por Asignar'}</span></p>
              <p className="mt-1"><span className="font-bold text-slate-500 text-xs">PLACAS:</span> <span className="uppercase">{embarque.placas || 'Por Asignar'}</span></p>
              <p className="mt-1"><span className="font-bold text-slate-500 text-xs">OPERADOR:</span> <span className="uppercase">{embarque.operador || 'Por Asignar'}</span></p>
            </div>
          </div>
        </div>

        {/* LOGÍSTICA */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* ORIGEN */}
          <div>
            <div className="bg-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest p-2 mb-2">Origen (Expedidor)</div>
            <div className="border border-slate-300 p-4 text-sm min-h-[160px]">
              <p className="font-black uppercase mb-2 text-base">{embarque.clientes?.razon_social}</p>
              <p className="uppercase text-xs leading-relaxed"><span className="font-bold text-slate-500">Dirección:</span> {embarque.origen_direccion}</p>
              <p className="uppercase text-xs leading-relaxed mt-1"><span className="font-bold text-slate-500">Ciudad/Edo:</span> {embarque.origen_ciudad} {embarque.origen_estado}</p>
              <p className="uppercase text-xs leading-relaxed mt-1"><span className="font-bold text-slate-500">C.P.:</span> {embarque.origen_cp || 'N/D'}</p>
            </div>
          </div>

          {/* DESTINO */}
          <div>
            <div className="bg-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest p-2 mb-2">Destino (Consignatario)</div>
            <div className="border border-slate-300 p-4 text-sm min-h-[160px]">
              <p className="font-black uppercase mb-2 text-base">Pendiente (Mismo Cliente por defecto)</p>
              <p className="uppercase text-xs leading-relaxed"><span className="font-bold text-slate-500">Dirección:</span> {embarque.destino_direccion}</p>
              <p className="uppercase text-xs leading-relaxed mt-1"><span className="font-bold text-slate-500">Ciudad/Edo:</span> {embarque.destino_ciudad} {embarque.destino_estado}</p>
              <p className="uppercase text-xs leading-relaxed mt-1"><span className="font-bold text-slate-500">C.P.:</span> {embarque.destino_cp || 'N/D'}</p>
            </div>
          </div>
        </div>

        {/* DETALLES DE CARGA */}
        <div>
          <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest p-2 mb-2">Especificaciones de Carga</div>
          <table className="w-full text-sm border-collapse border border-slate-300 text-center">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <th className="border border-slate-300 p-2">Tipo de Carga</th>
                <th className="border border-slate-300 p-2">Peso (Lbs/Kg)</th>
                <th className="border border-slate-300 p-2">Dimensiones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-3 font-bold uppercase">{embarque.tipo_carga}</td>
                <td className="border border-slate-300 p-3 uppercase">{embarque.peso_lbs ? `${embarque.peso_lbs} LBS` : 'N/D'}</td>
                <td className="border border-slate-300 p-3 uppercase">{embarque.dimensiones || 'LEGALES'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER / FIRMAS */}
        <div className="mt-16 pt-8 border-t border-slate-300 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enviar evidencia al cargar y descargar. Finalizado el servicio enviar prueba de entrega legible.</p>
        </div>

      </div>
    </div>
  );
}