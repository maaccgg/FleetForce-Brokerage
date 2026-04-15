"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Printer, Edit2, MapPin, 
  DollarSign, Truck, User, Building2, 
  CheckCircle2, Loader2, Globe, ExternalLink, Clock, FileText, Package, Calendar
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
    const { data, error } = await supabase
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
    const { error } = await supabase.from('embarques').update({ estado: nuevoEstado }).eq('id', emb.id);
    if (!error) setEmb({ ...emb, estado: nuevoEstado });
    setActualizando(false);
  };

  const generarPDF = async () => {
    const elemento = document.getElementById("documento-imprimible");
    if (!elemento) return;
    setActualizando(true);
    try {
      const canvas = await html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Carta_${emb.folio}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setActualizando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'CREADO': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'EN TRANSITO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COMPLETADO': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sincronizando Operación...</p>
    </div>
  );

  if (!emb) return <div className="p-20 text-center font-black uppercase">Folio no localizado.</div>;

  return (
    <>
      {/* PLANTILLA PDF (HIDDEN) */}
      <div id="documento-imprimible" className="fixed top-[200vh] left-0 w-[800px] bg-white text-black p-12 font-sans uppercase font-bold border-[10px] border-white">
        <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
          <div>
            {emb.logo_url ? (
              <img src={emb.logo_url} crossOrigin="anonymous" className="h-20 object-contain mb-2" />
            ) : (
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">{emb.nombre_broker || 'FLEETFORCE'}</h1>
            )}
            <p className="tracking-[0.4em] text-[10px] text-gray-400 font-black">LOGISTICS & BROKERAGE</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black tracking-tighter border-b-2 border-black mb-2 pb-1">CARTA DE INSTRUCCIONES</h2>
            <div className="text-xs space-y-1">
              <p>FECHA: <span className="font-black">{new Date(emb.fecha_embarque || emb.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
              <p className="text-lg mt-2">FOLIO: <span className="text-blue-600 font-black">{emb.folio}</span></p>
            </div>
          </div>
        </div>
        {/* ... Resto de la plantilla sigue la misma lógica dinámica ... */}
      </div>

      {/* VISTA COMMAND CENTER (PÁGINA) */}
      <div className="max-w-6xl mx-auto pb-20 px-4">
        
        {/* HEADER DE ACCIONES */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-5">
            <button onClick={() => router.push('/embarques')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200">
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{emb.folio}</h1>
                <select 
                  value={emb.estado} 
                  onChange={(e) => cambiarEstado(e.target.value)} 
                  className={cn("px-5 py-2 rounded-full text-[10px] font-black uppercase border outline-none cursor-pointer", getEstadoColor(emb.estado))}
                >
                  {estadosDisponibles.map(est => <option key={est} value={est} className="bg-white text-slate-900">{est}</option>)}
                </select>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <Calendar size={12}/> Servicio programado: {new Date(emb.fecha_embarque || emb.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={generarPDF} disabled={actualizando} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm">
              {actualizando ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Descargar PDF
            </button>
            <button onClick={() => router.push(`/embarques/editar/${emb.id}`)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
              <Edit2 size={16} /> Editar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUMNA IZQUIERDA: LOGÍSTICA Y EQUIPO */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* RUTA */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-10 tracking-[0.2em]">
                 <Globe size={14} className="text-blue-500" /> Plan de Ruta Institucional
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Origen</p>
                    <p className="font-black text-xl italic uppercase text-slate-900 tracking-tight">{emb.origen_ciudad}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{emb.origen_direccion}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">CTO: {emb.origen_contacto || 'PENDIENTE'}</p>
                  </div>
                  <div className="space-y-2 text-right md:border-l border-slate-100 md:pl-10">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Destino</p>
                    <p className="font-black text-xl italic uppercase text-slate-900 tracking-tight">{emb.destino_ciudad}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{emb.destino_direccion}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">CTO: {emb.destino_contacto || 'PENDIENTE'}</p>
                  </div>
               </div>
            </div>

            {/* EQUIPO Y OPERADOR (Corrección Placas) */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em]">Unidad y Operador Asignado</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Unidad (Eco)</p>
                    <p className="font-black italic text-lg text-slate-900 uppercase">{emb.unidad || 'PDTE'}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border-x border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Placas</p>
                    <p className="font-black italic text-lg text-slate-900 uppercase">{emb.placas || 'PDTE'}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Operador</p>
                    <p className="font-black italic text-lg text-slate-900 uppercase">{emb.operador || 'SIN ASIGNAR'}</p>
                 </div>
              </div>
            </div>

            {/* NOTAS ESPECIALES (Corrección Dinámica) */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2 tracking-[0.2em]">
                <FileText size={14} className="text-amber-500"/> Notas e Instrucciones Especiales
              </h3>
              <div className="p-8 bg-amber-50/50 rounded-3xl italic text-slate-700 border border-amber-100 leading-relaxed font-medium text-sm">
                {emb.notas_especiales ? (
                  emb.notas_especiales
                ) : (
                  <span className="text-slate-400">No se registraron instrucciones especiales para este despacho.</span>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: FINANZAS Y CARGA */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em]">Liquidación Carrier</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Tarifa Acordada (Costo)</p>
               <div className="flex items-baseline gap-3 mb-10">
                  <span className="text-5xl font-black italic text-emerald-600 tracking-tighter">${emb.tarifa?.toLocaleString()}</span>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{emb.moneda || 'USD'}</span>
               </div>
               <div className="space-y-6 pt-8 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</p>
                      <p className="text-sm font-black uppercase italic leading-tight text-slate-900">{emb.clientes?.razon_social}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Línea</p>
                      <p className="text-sm font-black uppercase italic leading-tight text-slate-900">{emb.transportistas?.razon_social}</p>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2 tracking-[0.2em]">
                 <Package size={14} className="text-blue-500"/> Detalles de Carga
               </h3>
               <div className="space-y-4 text-xs font-bold uppercase">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">CMM:</span>
                    <span className="text-slate-900">{emb.cmm || emb.tipo_carga}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Peso:</span>
                    <span className="text-slate-900">{emb.peso_lbs?.toLocaleString()} LBS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensiones:</span>
                    <span className="text-slate-900">{emb.dimensiones || 'LEGALES'}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}