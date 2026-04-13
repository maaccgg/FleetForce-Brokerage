"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase/client";
import { Loader2, Printer, ArrowLeft, Map } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CartaInstruccionesFinal() {
  const params = useParams();
  const [emb, setEmb] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetalle() {
      const { data, error } = await supabase
        .from('embarques')
        .select(`*, clientes(razon_social, rfc), transportistas(razon_social, contacto_nombre)`)
        .eq('id', params.id)
        .single();

      if (data) setEmb(data);
      setLoading(false);
    }
    fetchDetalle();
  }, [params.id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!emb) return <div className="p-20 text-center uppercase font-black">Folio no localizado.</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white">
      
      {/* BOTONES DE CONTROL (OCULTOS AL IMPRIMIR) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between print:hidden">
        <Link href="/embarques" className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg font-bold text-xs uppercase border border-slate-200 shadow-sm">
          <ArrowLeft size={14} /> Panel General
        </Link>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg">
          <Printer size={14} className="inline mr-2" /> Emitir PDF Oficial
        </button>
      </div>

      {/* CUERPO DEL DOCUMENTO */}
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-2xl print:shadow-none print:p-0 text-[11px] text-slate-900 font-sans leading-tight">
        
        {/* ENCABEZADO ESTILO PDF */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">FLEETFORCE</h1>
            <p className="font-bold uppercase tracking-[0.3em] text-[8px] mt-1 text-slate-500">Logistics & Brokerage</p>
          </div>
          <div className="text-right uppercase">
            <h2 className="text-xl font-black">Carta de Instrucciones</h2>
            <p className="font-bold">Folio T-Dash: <span className="text-blue-600">{emb.folio}</span></p>
            <p className="text-[9px] text-slate-400">Fecha: {new Date(emb.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* INFO EJECUTIVO Y CARRIER */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-slate-900 p-3">
            <p className="font-black text-[9px] text-slate-400 uppercase mb-1">Carrier / Transportista</p>
            <p className="text-sm font-black">{emb.transportistas?.razon_social}</p>
            <p className="font-bold">Contacto: {emb.transportistas?.contacto_nombre || 'Pendiente'}</p>
          </div>
          <div className="border border-slate-900 p-3">
            <p className="font-black text-[9px] text-slate-400 uppercase mb-1">Ejecutivo de Cuenta</p>
            <p className="text-sm font-black uppercase">{emb.ejecutivo || 'Marco Cantu'}</p>
          </div>
        </div>

        {/* DATOS DE UNIDAD */}
        <div className="mb-6">
          <div className="bg-slate-900 text-white font-black p-1 px-3 uppercase tracking-widest text-[9px]">Datos de Unidad y Driver</div>
          <div className="grid grid-cols-3 border border-slate-900 border-t-0 p-3 italic">
            <p><span className="font-bold not-italic">Unidad:</span> {emb.unidad || 'PDTE'}</p>
            <p><span className="font-bold not-italic">Placas:</span> {emb.placas || 'PDTE'}</p>
            <p><span className="font-bold not-italic">Operador:</span> {emb.operador || 'PDTE'}</p>
          </div>
        </div>

        {/* LOGÍSTICA DE CARGA Y ENTREGA */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* ORIGEN */}
          <div className="flex flex-col">
            <div className="bg-slate-100 border border-slate-900 border-b-2 font-black p-1 px-3 uppercase text-[9px]">Origen (Expedidor)</div>
            <div className="border border-slate-900 border-t-0 p-4 flex-1 space-y-1">
              <p className="font-black text-xs uppercase">{emb.clientes?.razon_social}</p>
              <p className="text-slate-600">{emb.origen_direccion}</p>
              <p className="font-bold">{emb.origen_ciudad}</p>
              <p className="pt-2"><span className="font-bold">Contacto:</span> {emb.origen_contacto || 'PDTE'}</p>
              {emb.origen_maps_link && (
                <a href={emb.origen_maps_link} target="_blank" className="text-blue-600 font-bold flex items-center gap-1 mt-2 underline">
                  <Map size={10} /> Link Google Maps
                </a>
              )}
            </div>
          </div>

          {/* DESTINO */}
          <div className="flex flex-col">
            <div className="bg-slate-100 border border-slate-900 border-b-2 font-black p-1 px-3 uppercase text-[9px]">Destino (Consignatario)</div>
            <div className="border border-slate-900 border-t-0 p-4 flex-1 space-y-1">
              <p className="font-black text-xs uppercase">Zuniga Logistics / Consignatario</p>
              <p className="text-slate-600">{emb.destino_direccion}</p>
              <p className="font-bold">{emb.destino_ciudad}</p>
              <p className="pt-2"><span className="font-bold">Contacto:</span> {emb.destino_contacto || 'PDTE'}</p>
              {emb.destino_maps_link && (
                <a href={emb.destino_maps_link} target="_blank" className="text-blue-600 font-bold flex items-center gap-1 mt-2 underline">
                  <Map size={10} /> Link Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* CARGA Y FINANZAS */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-slate-900">
            <thead className="bg-slate-900 text-white text-[9px] uppercase">
              <tr>
                <th className="p-2 border border-slate-900">Concepto</th>
                <th className="p-2 border border-slate-900">Detalle</th>
                <th className="p-2 border border-slate-900">Peso</th>
                <th className="p-2 border border-slate-900">Tarifa</th>
              </tr>
            </thead>
            <tbody className="text-center font-bold">
              <tr>
                <td className="p-3 border border-slate-900">{emb.concepto_servicio}</td>
                <td className="p-3 border border-slate-900">{emb.detalle_servicio}</td>
                <td className="p-3 border border-slate-900 uppercase">{emb.peso_lbs} LBS / LEGALES</td>
                <td className="p-3 border border-slate-900 text-blue-600 text-sm">
                  ${emb.tarifa?.toLocaleString()} {emb.moneda}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* REQUISITOS DE FACTURACIÓN */}
        <div className="bg-slate-50 border border-dashed border-slate-400 p-4 text-[9px] italic">
          <p className="font-black uppercase mb-1 not-italic">Requisitos de Facturación:</p>
          <p>{emb.requisitos_facturacion}</p>
        </div>

        <div className="mt-10 pt-4 border-t border-slate-200 text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">FleetForce Institutional Brokerage Service - 2026</p>
        </div>

      </div>
    </div>
  );
}