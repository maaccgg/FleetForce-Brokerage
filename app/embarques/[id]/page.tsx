"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Printer, Edit2, MapPin, 
  DollarSign, Truck, User, Building2, 
  CheckCircle2, Loader2, Globe, ExternalLink, Clock,
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

  const estadosDisponibles = [
    'CREADO', 
    'COTIZACIONES RECIBIDAS', 
    'ASIGNADO', 
    'EN TRANSITO', 
    'COMPLETADO', 
    'FACTURADO'
  ];

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

    if (error) console.error("Error:", error.message);
    if (data) setEmb(data);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase.from('perfil_empresa').select('logo_url').eq('id', user.id).single();
      if (perfil?.logo_url) {
        setEmb((prev: any) => ({ ...prev, logo_url: perfil.logo_url }));
      }
    }
    setLoading(false);
  }

  const cambiarEstado = async (nuevoEstado: string) => {
    setActualizando(true);
    const { error } = await supabase
      .from('embarques')
      .update({ estado: nuevoEstado })
      .eq('id', emb.id);

    if (error) {
      alert("Error al actualizar estado: " + error.message);
    } else {
      setEmb({ ...emb, estado: nuevoEstado });
    }
    setActualizando(false);
  };

  const generarPDF = async () => {
    // Apuntamos a la plantilla oculta
    const elemento = document.getElementById("documento-imprimible");
    if (!elemento) return;

    setActualizando(true);

    try {
      const canvas = await html2canvas(elemento, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff" 
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Carta_Instrucciones_${emb.folio}.pdf`);
    } catch (error) {
      alert("Error al generar el documento PDF.");
      console.error(error);
    } finally {
      setActualizando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'CREADO': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'COTIZACIONES RECIBIDAS': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'ASIGNADO': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'EN TRANSITO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COMPLETADO': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'FACTURADO': return 'bg-cyan-100 text-cyan-600 border-cyan-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
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
      {/* =========================================================================
          PLANTILLA OCULTA PARA PDF (Formato TDL004)
          Se renderiza fuera de la pantalla (top-[200vh]) solo para el html2canvas
          ========================================================================= */}
      <div 
        id="documento-imprimible" 
        className="fixed top-[200vh] left-0 w-[800px] bg-white text-black p-12 font-sans"
      >
        {/* ENCABEZADO */}
<div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
          <div>
            {emb.logo_url ? (
              /* IMPORTANTE: crossOrigin="anonymous" es vital para que html2canvas no bloquee la imagen */
              <img 
                src={emb.logo_url} 
                alt="Logo Institucional" 
                crossOrigin="anonymous" 
                className="h-16 object-contain" 
              />
            ) : (
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">FLEETFORCE</h1>
            )}
            <p className="font-bold uppercase tracking-[0.3em] text-[10px] mt-2 text-gray-500">Logistics & Brokerage</p>
          </div>
          <div className="text-right uppercase">
            <h2 className="text-2xl font-black mb-2">Carta de Instrucciones</h2>
            <p className="font-bold text-sm">Folio T-Dash: <span className="text-blue-600 font-black">{emb.folio}</span></p>
            <p className="text-[10px] text-gray-500 font-bold mt-1">Fecha: {new Date(emb.created_at).toLocaleDateString()}</p>
            <p className="text-[10px] text-gray-500 font-bold">Ejecutivo: {emb.ejecutivo || 'Marco Cantu'}</p>
          </div>
        </div>

        {/* DATOS DE CARRIER Y UNIDAD */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-black p-4">
            <p className="font-black text-[10px] text-gray-500 uppercase tracking-widest mb-2">Carrier</p>
            <p className="font-black text-sm uppercase">{emb.transportistas?.razon_social || 'Pendiente'}</p>
            <p className="font-bold text-xs uppercase mt-1">Contacto: {emb.transportistas?.contacto_nombre || 'N/A'}</p>
          </div>
          <div className="border border-black p-4">
            <p className="font-black text-[10px] text-gray-500 uppercase tracking-widest mb-2">Datos de Unidad</p>
            <div className="grid grid-cols-2 gap-2 text-xs uppercase font-bold">
              <p>Unidad: <span className="font-black">{emb.unidad || 'PDTE'}</span></p>
              <p>Placas: <span className="font-black">{emb.placas || 'PDTE'}</span></p>
              <p className="col-span-2">Driver: <span className="font-black">{emb.operador || 'PDTE'}</span></p>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN DE CARGA */}
        <div className="mb-6 border border-black p-4">
           <p className="font-black text-[10px] text-gray-500 uppercase tracking-widest mb-2">Descripción de Carga</p>
           <div className="grid grid-cols-3 gap-4 text-xs uppercase">
              <p className="font-bold">CMM: <span className="font-black">{emb.tipo_carga}</span></p>
              <p className="font-bold">Peso: <span className="font-black">{emb.peso_lbs ? `${emb.peso_lbs.toLocaleString()} LBS` : 'N/A'}</span></p>
              <p className="font-bold">Dimensiones: <span className="font-black">Legales</span></p>
           </div>
        </div>

        {/* ORIGEN Y DESTINO */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-black p-4">
            <div className="bg-black text-white text-center font-black py-1 uppercase text-xs mb-3">Origen / Expedidor</div>
            <p className="font-black text-xs uppercase mb-2">{emb.clientes?.razon_social}</p>
            <div className="text-[11px] uppercase font-bold space-y-1">
              <p>Dirección: <span className="font-medium">{emb.origen_direccion}</span></p>
              <p>Ciudad/Estado: <span className="font-medium">{emb.origen_ciudad}</span></p>
              <p>Contacto: <span className="font-medium">{emb.origen_contacto || 'PDTE'}</span></p>
              {emb.origen_maps_link && <p className="text-blue-600 mt-2 lowercase">{emb.origen_maps_link}</p>}
            </div>
          </div>
          <div className="border border-black p-4">
            <div className="bg-black text-white text-center font-black py-1 uppercase text-xs mb-3">Destino / Consignatario</div>
            <p className="font-black text-xs uppercase mb-2">ZUNIGA LOGISTICS (DEFAULT)</p>
            <div className="text-[11px] uppercase font-bold space-y-1">
              <p>Dirección: <span className="font-medium">{emb.destino_direccion}</span></p>
              <p>Ciudad/Estado: <span className="font-medium">{emb.destino_ciudad}</span></p>
              <p>Contacto: <span className="font-medium">{emb.destino_contacto || 'PDTE'}</span></p>
              {emb.destino_maps_link && <p className="text-blue-600 mt-2 lowercase">{emb.destino_maps_link}</p>}
            </div>
          </div>
        </div>

        {/* TABLA FINANCIERA */}
        <table className="w-full border-collapse border border-black mb-8 text-xs text-center uppercase font-bold">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2 border border-black">Concepto</th>
              <th className="p-2 border border-black">Detalle</th>
              <th className="p-2 border border-black">Cantidad</th>
              <th className="p-2 border border-black">Moneda</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-black">{emb.concepto_servicio}</td>
              <td className="p-3 border border-black">{emb.detalle_servicio}</td>
              <td className="p-3 border border-black font-black">${emb.tarifa?.toLocaleString()}</td>
              <td className="p-3 border border-black">{emb.moneda || 'USD'}</td>
            </tr>
          </tbody>
        </table>

        {/* NOTAS FINALES */}
        <div className="border border-black p-4 text-[10px] font-bold uppercase">
          <p className="mb-2">Requisitos para Facturación:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Prueba de entrega firmada y sellada.</li>
            <li>Carta de Instrucciones FleetForce Logistics.</li>
            <li>Entregar EIR de vacío.</li>
            <li>Enviar factura al correo establecido. Los días de crédito comienzan a partir de la recepción.</li>
          </ol>
        </div>
      </div>
      {/* ========================================================================= */}


      {/* COMMAND CENTER (Vista Principal) */}
      <div className="max-w-6xl mx-auto pb-20 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b pb-8">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.push('/embarques')} 
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200"
            >
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                  {emb.folio}
                </h1>
                <div className="relative inline-block">
                  <select 
                    value={emb.estado || 'CREADO'} 
                    disabled={actualizando}
                    onChange={(e) => cambiarEstado(e.target.value)}
                    className={cn(
                      "appearance-none cursor-pointer px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border transition-all pr-10 outline-none",
                      getEstadoColor(emb.estado || 'CREADO')
                    )}
                  >
                    {estadosDisponibles.map(est => (
                      <option key={est} value={est} className="bg-white text-slate-900">{est}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    {actualizando ? <Loader2 size={12} className="animate-spin" /> : "▼"}
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Registrado el {new Date(emb.created_at).toLocaleDateString()} • Por {emb.ejecutivo || 'Sistema'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* BOTÓN DESCARGAR PDF */}
            <button 
              onClick={generarPDF} 
              disabled={actualizando}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm disabled:opacity-50"
            >
              {actualizando ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
              Descargar PDF
            </button>
            <button 
              onClick={() => router.push(`/embarques/editar/${emb.id}`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
              <Edit2 size={16} /> Editar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* COLUMNA IZQUIERDA: LOGÍSTICA (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-10 flex items-center gap-2">
                <Globe size={14} className="text-blue-500" /> Plan de Ruta y Logística
              </h3>
              <div className="flex flex-col gap-12 relative">
                <div className="absolute left-[19px] top-[24px] bottom-[24px] w-0.5 border-l-2 border-slate-100 border-dashed" />
                <div className="flex gap-8 relative z-10">
                  <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-wider">Origen / Expedidor</p>
                    <p className="font-black text-slate-900 uppercase italic text-xl tracking-tight mb-1">{emb.origen_ciudad}</p>
                    <p className="text-sm text-slate-500 font-medium max-w-md leading-relaxed mb-3">{emb.origen_direccion}</p>
                    <div className="flex flex-wrap gap-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg border">
                        <User size={12} /> {emb.origen_contacto || 'Por definir'}
                      </span>
                      {emb.origen_maps_link && (
                        <a href={emb.origen_maps_link} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase hover:underline">
                          <ExternalLink size={12} /> Abrir Mapa
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-8 relative z-10">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 -rotate-3 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-wider">Destino / Entrega</p>
                    <p className="font-black text-slate-900 uppercase italic text-xl tracking-tight mb-1">{emb.destino_ciudad}</p>
                    <p className="text-sm text-slate-500 font-medium max-w-md leading-relaxed mb-3">{emb.destino_direccion}</p>
                    <div className="flex flex-wrap gap-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg border">
                        <User size={12} /> {emb.destino_contacto || 'Por definir'}
                      </span>
                      {emb.destino_maps_link && (
                        <a href={emb.destino_maps_link} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase hover:underline">
                          <ExternalLink size={12} /> Abrir Mapa
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-8">Especificaciones de Equipo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidad Asignada</p>
                  <div className="flex items-center gap-3">
                    <Truck className="text-slate-900" size={18} />
                    <p className="font-black text-slate-900 uppercase italic">{emb.unidad || 'PDTE'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Placas / Eco</p>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-blue-500" size={18} />
                    <p className="font-black text-slate-900 uppercase italic">{emb.placas || 'PDTE'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operador Responsable</p>
                  <div className="flex items-center gap-3">
                    <User className="text-emerald-500" size={18} />
                    <p className="font-black text-slate-900 uppercase italic">{emb.operador || 'SIN ASIGNAR'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: FINANZAS Y ALIADOS (1/3) */}
          <div className="space-y-8">
            <div className="bg-slate-950 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-slate-800">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.25em] mb-8">Análisis Financiero</h3>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Ingreso por Servicio</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black italic tracking-tighter text-blue-400">
                      ${emb.tarifa?.toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-slate-600 uppercase tracking-widest">
                      {emb.moneda || 'USD'}
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-800 space-y-6">
                  <div className="flex items-start gap-4">
                    <Building2 size={20} className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cliente Facturable</p>
                      <p className="text-sm font-black uppercase italic leading-tight">{emb.clientes?.razon_social}</p>
                      <p className="text-[10px] text-slate-600 mt-1 font-bold">RFC: {emb.clientes?.rfc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Truck size={20} className="text-emerald-500 mt-1" />
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Línea de Transporte</p>
                      <p className="text-sm font-black uppercase italic leading-tight">{emb.transportistas?.razon_social}</p>
                      <p className="text-[10px] text-slate-600 mt-1 font-bold">Contacto: {emb.transportistas?.contacto_nombre}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-6">Instrucciones Especiales</h3>
               <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-600 leading-relaxed font-medium">
                   "{emb.tipo_carga} - PESO: {emb.peso_lbs?.toLocaleString()} LBS. NOTA: {emb.concepto_servicio}."
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase px-2">
                   <Clock size={12} /> Última mod: {new Date(emb.created_at).toLocaleTimeString()}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}