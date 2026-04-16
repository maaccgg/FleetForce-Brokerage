"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Printer, Edit2, MapPin, 
  DollarSign, Truck, User, Building2, 
  CheckCircle2, Loader2, Globe, ExternalLink, Clock, FileText, Package, Calendar, Phone, ShieldAlert
} from "lucide-react";
import { supabase } from "../../../lib/supabase/client";
import { cn } from "../../../lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DetalleEmbarque() {
  const params = useParams();
  const router = useRouter();
  const [emb, setEmb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const estadosDisponibles = ['CREADO', 'COTIZACIONES RECIBIDAS', 'ASIGNADO', 'EN TRANSITO', 'COMPLETADO', 'FACTURADO'];

  useEffect(() => {
    fetchDetalle();
  }, [params.id]);

  async function fetchDetalle() {
    setLoading(true);
    const { data } = await supabase
      .from('embarques')
      .select(`*, clientes(razon_social, rfc), transportistas(razon_social, contacto_nombre)`)
      .eq('id', params.id)
      .single();

    if (data) setEmb(data);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase.from('perfil_empresa').select('logo_url, nombre_comercial').eq('id', user.id).single();
      if (perfil) {
        setEmb((prev: any) => ({ ...prev, logo_url: perfil.logo_url, nombre_broker: perfil.nombre_comercial }));
      }
    }
    setLoading(false);
  }

  const cambiarEstado = async (nuevoEstado: string) => {
    setActualizando(true);
    await supabase.from('embarques').update({ estado: nuevoEstado }).eq('id', emb.id);
    setEmb({ ...emb, estado: nuevoEstado });
    setActualizando(false);
  };

  const generarPDF = async () => {
    const elemento = document.getElementById("documento-imprimible");
    if (!elemento) return;
    setActualizando(true);
    try {
      const canvas = await html2canvas(elemento, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Carta_Instrucciones_${emb.folio}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setActualizando(false);
    }
  };
// Función para determinar los colores del estado del embarque
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'CREADO': return 'bg-slate-50 text-slate-400 border-slate-200';
      case 'EN TRANSITO': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLETADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FACTURADO': return 'bg-slate-900 text-white border-slate-900';
      case 'ASIGNADO': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };
  
  if (loading) return <div className="h-screen flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <>
      {/* ==========================================================
          PLANTILLA PDF PROFESIONAL (ALTO NIVEL)
          ========================================================== */}
      <div id="documento-imprimible" className="fixed top-[500vh] left-0 w-[800px] bg-white text-slate-900 p-12 font-sans border-[1px] border-slate-100">
        <div className="flex justify-between items-start border-b-8 border-slate-900 pb-8 mb-8">
          <div>
            {emb.logo_url ? <img src={emb.logo_url} crossOrigin="anonymous" className="h-16 mb-2" /> : <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">{emb.nombre_broker || 'FLEETFORCE'}</h1>}
            <p className="tracking-[0.3em] text-[9px] text-slate-400 font-black uppercase">Logistics & Brokerage Solutions</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Carta de Instrucciones</h2>
            <p className="text-blue-600 font-black text-xl">FOLIO: {emb.folio}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Fecha de Emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest border-b pb-2">Carrier & Driver Information</p>
            <div className="space-y-2 uppercase">
              <p className="text-sm font-black italic">{emb.transportistas?.razon_social || 'PENDIENTE ASIGNAR'}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 mt-4">
                <div>UNIT: <span className="text-slate-900 font-black">{emb.unidad || '---'}</span></div>
                <div>PLATES: <span className="text-slate-900 font-black">{emb.placas || '---'}</span></div>
                <div className="col-span-2">DRIVER: <span className="text-slate-900 font-black">{emb.operador || '---'}</span></div>
                <div className="col-span-2">TEL: <span className="text-slate-900 font-black">{emb.operador_telefono || '---'}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest border-b pb-2">Financial Breakdown</p>
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-400 font-black border-b border-slate-200">
                  <th className="pb-1">CONCEPTO</th>
                  <th className="pb-1 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="font-black italic">
                <tr><td className="py-2 uppercase">Flete Terrestre</td><td className="py-2 text-right">${emb.tarifa?.toLocaleString()} {emb.moneda}</td></tr>
                {/* Aquí podrías mapear otros cargos si existieran */}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
           <div className="border-l-4 border-emerald-500 pl-4">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pickup Information</p>
              <p className="text-sm font-black text-slate-900 uppercase italic">{emb.origen_ciudad}</p>
              <p className="text-[10px] font-bold text-slate-500 leading-tight uppercase">{emb.origen_direccion}</p>
              <p className="text-[11px] font-black text-slate-900 mt-2 bg-emerald-50 inline-block px-2">CITA: {new Date(emb.fecha_embarque).toLocaleDateString()} | {emb.cita_carga || '09:00 AM'}</p>
           </div>
           <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Delivery Information</p>
              <p className="text-sm font-black text-slate-900 uppercase italic">{emb.destino_ciudad}</p>
              <p className="text-[10px] font-bold text-slate-500 leading-tight uppercase">{emb.destino_direccion}</p>
              <p className="text-[11px] font-black text-slate-900 mt-2 bg-blue-50 inline-block px-2">CITA: {emb.cita_entrega || 'POR CONFIRMAR'}</p>
           </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-3xl mb-8 grid grid-cols-3 gap-4 text-center">
            <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Description</p><p className="text-xs font-black uppercase italic">{emb.tipo_carga || 'GENERAL'}</p></div>
            <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Weight (LBS)</p><p className="text-xs font-black uppercase italic">{emb.peso_lbs?.toLocaleString() || 'N/A'}</p></div>
            <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Seal Number</p><p className="text-xs font-black uppercase italic">{emb.sello || 'PENDIENTE'}</p></div>
        </div>

        <div className="border-2 border-slate-900 p-6 rounded-3xl italic text-[10px] font-bold uppercase leading-relaxed">
          <p className="text-blue-600 font-black mb-2 tracking-widest underline">Instrucciones de Seguridad:</p>
          {emb.instrucciones_seguridad || 'Sin instrucciones adicionales.'}
        </div>
      </div>

      {/* ==========================================================
          VISTA COMMAND CENTER (UI PÁGINA)
          ========================================================== */}
      <div className="max-w-6xl mx-auto pb-20 px-4 mt-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-5">
            <button onClick={() => router.push('/embarques')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 shadow-sm"><ArrowLeft size={24} className="text-slate-600" /></button>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{emb.folio}</h1>
                <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase border", getEstadoColor(emb.estado))}>{emb.estado}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={generarPDF} disabled={actualizando} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-600 transition-all">
              {actualizando ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Generar Carta de Instrucciones
            </button>
            <button onClick={() => router.push(`/embarques/editar/${emb.id}`)} className="p-4 bg-white border-2 border-slate-900 rounded-2xl hover:bg-slate-50 transition-all"><Edit2 size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* BOX 1: RUTA Y CITAS */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10"><Globe size={120} /></div>
               <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-10 tracking-[0.3em]">Logística de Tránsito</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl inline-flex items-center gap-2 text-[10px] font-black uppercase"><Clock size={14}/> Cita Carga: {emb.cita_carga || '09:00 AM'}</div>
                    <div className="space-y-1">
                      <p className="font-black text-2xl italic uppercase text-slate-900 tracking-tighter">{emb.origen_ciudad}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">{emb.origen_direccion}</p>
                    </div>
                  </div>
                  <div className="space-y-4 md:border-l border-slate-100 md:pl-10">
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl inline-flex items-center gap-2 text-[10px] font-black uppercase"><Clock size={14}/> Cita Entrega: {emb.cita_entrega || 'PDTE'}</div>
                    <div className="space-y-1">
                      <p className="font-black text-2xl italic uppercase text-slate-900 tracking-tighter">{emb.destino_ciudad}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">{emb.destino_direccion}</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* BOX 2: UNIDAD Y SEGURIDAD */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-[0.3em] flex items-center gap-2"><Truck size={14}/> Activos y Seguridad</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-5 bg-slate-50 rounded-[2rem] text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Unidad</p>
                    <p className="font-black text-lg italic text-slate-900 uppercase">{emb.unidad || '---'}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-[2rem] text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Sello/Seal</p>
                    <p className="font-black text-lg italic text-blue-600 uppercase">{emb.sello || '---'}</p>
                  </div>
                  <div className="p-5 bg-slate-900 text-white rounded-[2rem] text-center col-span-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Teléfono Operador</p>
                    <div className="flex items-center justify-center gap-2 font-black text-lg italic tracking-wider"><Phone size={16} className="text-emerald-400"/> {emb.operador_telefono || 'S/N'}</div>
                  </div>
               </div>
               <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                  <p className="text-[11px] font-bold text-amber-900 uppercase leading-relaxed italic">{emb.instrucciones_seguridad}</p>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarifa Carrier</p>
               <h4 className="text-5xl font-black italic tracking-tighter">${emb.tarifa?.toLocaleString()} <span className="text-sm not-italic text-slate-500">{emb.moneda}</span></h4>
               <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="text-blue-400" size={20} />
                    <p className="text-xs font-black uppercase tracking-tight truncate">{emb.clientes?.razon_social}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="text-emerald-400" size={20} />
                    <p className="text-xs font-black uppercase tracking-tight truncate">{emb.transportistas?.razon_social}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-[0.3em]">Carga</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2"><span className="text-[10px] font-black text-slate-400 uppercase">Peso</span><span className="font-black text-sm">{emb.peso_lbs?.toLocaleString()} LBS</span></div>
                  <div className="flex justify-between items-center border-b pb-2"><span className="text-[10px] font-black text-slate-400 uppercase">CMM</span><span className="font-black text-sm italic">{emb.cmm || 'GENERAL'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Dim</span><span className="font-black text-sm">LEGALES</span></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}