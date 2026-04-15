"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, FileText, Loader2, MapPin, Search, Edit2, Trash2, Filter, FileDown, X 
} from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { cn } from "../../lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function EmbarquesPage() {
  const [embarques, setEmbarques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [embParaPDF, setEmbParaPDF] = useState<any>(null);

  const router = useRouter();

  const estadosDisponibles = [
    'TODOS', 'CREADO', 'COTIZACIONES RECIBIDAS', 'ASIGNADO', 'EN TRANSITO', 'COMPLETADO', 'FACTURADO'
  ];

  useEffect(() => {
    fetchEmbarques();
    fetchPerfil();
  }, []);

  async function fetchPerfil() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('perfil_empresa').select('*').eq('id', user.id).single();
      if (data) setPerfil(data);
    }
  }

  async function fetchEmbarques() {
    setLoading(true);
    const { data, error } = await supabase
      .from('embarques')
      .select(`
        *,
        clientes ( razon_social, rfc ),
        transportistas ( razon_social, contacto_nombre )
      `)
      .order('created_at', { ascending: false });

    if (data) setEmbarques(data);
    setLoading(false);
  }

  const descargarPDFDirecto = async (e: React.MouseEvent, emb: any) => {
    e.stopPropagation();
    setIsGenerating(emb.id);
    setEmbParaPDF(emb);

    setTimeout(async () => {
      const elemento = document.getElementById("plantilla-pdf-global");
      if (!elemento) return;

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
        pdf.save(`Carta_${emb.folio}.pdf`);
      } catch (err) {
        console.error("Error PDF:", err);
      } finally {
        setIsGenerating(null);
        setEmbParaPDF(null);
      }
    }, 500);
  };

  const eliminarEmbarque = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("¿Deseas eliminar este despacho permanentemente?")) return;
    const { error } = await supabase.from('embarques').delete().eq('id', id);
    if (!error) fetchEmbarques();
    else alert(error.message);
  };

  const getStatusStyles = (estado: string) => {
    switch (estado) {
      case 'CREADO': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'EN TRANSITO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COMPLETADO': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  const embarquesFiltrados = embarques.filter(emb => {
    const matchesSearch = 
      emb.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emb.clientes?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emb.origen_ciudad?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "TODOS" || emb.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Panel de Embarques</h1>
          <p className="text-sm text-slate-500 font-medium font-bold uppercase tracking-widest text-[10px]">Logística e Instrucciones</p>
        </div>
        <Link href="/embarques/nuevo" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg">
          <Plus size={16} /> Nuevo Embarque
        </Link>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Folio, Cliente o Ciudad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-bold uppercase"
          />
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <Filter className="text-slate-400" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
          >
            {estadosDisponibles.map(est => <option key={est} value={est}>{est}</option>)}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                <th className="p-5">Folio</th>
                <th className="p-5">Cliente</th>
                <th className="p-5">Carrier</th>
                <th className="p-5">Ruta</th>
                <th className="p-5 text-center">Estatus</th>
                <th className="p-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 font-bold">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : (
                embarquesFiltrados.map((emb) => (
                  <tr key={emb.id} onClick={() => router.push(`/embarques/${emb.id}`)} className="hover:bg-slate-50/80 cursor-pointer transition-colors group">
                    <td className="p-5 font-black text-slate-900 italic tracking-tighter text-base">{emb.folio}</td>
                    <td className="p-5 text-slate-700 uppercase text-xs">{emb.clientes?.razon_social}</td>
                    <td className="p-5 text-slate-500 uppercase text-[11px]">{emb.transportistas?.razon_social || 'PENDIENTE'}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase italic">
                        <span>{emb.origen_ciudad}</span> <MapPin size={10} /> <span>{emb.destino_ciudad}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border", getStatusStyles(emb.estado))}>
                        {emb.estado}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* BOTÓN DESCARGA (Icono Nuevo) */}
                        <button 
                          onClick={(e) => descargarPDFDirecto(e, emb)} 
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Descargar Carta De Instrucciones"
                        >
                          {isGenerating === emb.id ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={18} />}
                        </button>

                        {/* BOTÓN EDITAR */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); router.push(`/embarques/editar/${emb.id}`); }} 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* BOTÓN ELIMINAR (Restaurado) */}
                        <button 
                          onClick={(e) => eliminarEmbarque(e, emb.id)} 
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          PLANTILLA PDF GLOBAL (ESTRUCTURA CORREGIDA SEGÚN TU PDF)
          ========================================================================= */}
      {embParaPDF && (
        <div id="plantilla-pdf-global" className="fixed top-[200vh] left-0 w-[800px] bg-white text-black p-12 font-sans uppercase font-bold border-[10px] border-white">
          
          <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
            <div>
              {perfil?.logo_url ? (
                <img src={perfil.logo_url} crossOrigin="anonymous" className="h-20 object-contain mb-2" />
              ) : (
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">{perfil?.nombre_comercial || 'FLEETFORCE'}</h1>
              )}
              <p className="tracking-[0.4em] text-[10px] text-gray-400 font-black">LOGISTICS & BROKERAGE</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black tracking-tighter border-b-2 border-black mb-2 pb-1">CARTA DE INSTRUCCIONES</h2>
              <div className="text-xs space-y-1">
                <p>FECHA: <span className="font-black">{new Date(embParaPDF.fecha_embarque || embParaPDF.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                <p>EJECUTIVO: <span className="font-black">{perfil?.nombre_comercial || 'GUSTAVO DÁVILA'}</span></p>
                <p className="text-lg mt-2">FOLIO: <span className="text-blue-600 font-black">{embParaPDF.folio}</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-black p-4 bg-gray-50/50">
              <p className="text-[9px] font-black text-gray-500 mb-2 tracking-widest">CARRIER / TRANSPORTISTA</p>
              <p className="text-sm font-black mb-1">{embParaPDF.transportistas?.razon_social}</p>
              <p className="text-[10px]">CONTACTO: {embParaPDF.transportistas?.contacto_nombre || 'N/A'}</p>
            </div>
            <div className="border-2 border-black p-4 bg-gray-50/50">
              <p className="text-[9px] font-black text-gray-500 mb-2 tracking-widest">DATOS DE UNIDAD</p>
              <div className="grid grid-cols-2 gap-y-1 text-[10px]">
                <p>UNIDAD: <span className="font-black">{embParaPDF.unidad || 'PDTE'}</span></p>
                <p>PLACAS: <span className="font-black">{embParaPDF.placas || 'PDTE'}</span></p>
                <p className="col-span-2 mt-1">OPERADOR: <span className="font-black">{embParaPDF.operador || 'PDTE'}</span></p>
              </div>
            </div>
          </div>

          <div className="border-2 border-black p-4 mb-6 bg-gray-50/50">
            <p className="text-[9px] font-black text-gray-500 mb-2 tracking-widest text-center">DESCRIPCIÓN DE CARGA</p>
            <div className="grid grid-cols-3 text-center text-[10px] font-black">
              <p>CMM: {embParaPDF.cmm || 'GENERAL'}</p>
              <p>PESO: {embParaPDF.peso_lbs?.toLocaleString()} LBS</p>
              <p>DIMS: {embParaPDF.dimensiones || 'LEGALES'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-black relative pt-8 p-4">
              <div className="absolute top-0 left-0 right-0 bg-black text-white text-[10px] font-black text-center py-1">ORIGEN / EXPEDIDOR</div>
              <p className="text-[11px] font-black mb-2">{embParaPDF.origen_ciudad}</p>
              <p className="text-[10px] font-medium leading-tight">{embParaPDF.origen_direccion}</p>
              <p className="text-[10px] mt-2">CTO: {embParaPDF.origen_contacto || 'PDTE'}</p>
            </div>
            <div className="border-2 border-black relative pt-8 p-4">
              <div className="absolute top-0 left-0 right-0 bg-black text-white text-[10px] font-black text-center py-1">DESTINO / CONSIGNATARIO</div>
              <p className="text-[11px] font-black mb-2">{embParaPDF.destino_ciudad}</p>
              <p className="text-[10px] font-medium leading-tight">{embParaPDF.destino_direccion}</p>
              <p className="text-[10px] mt-2">CTO: {embParaPDF.destino_contacto || 'PDTE'}</p>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-black mb-6 text-center text-[10px] font-black">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-2 border border-black">CONCEPTO</th>
                <th className="p-2 border border-black">DETALLE</th>
                <th className="p-2 border border-black">TARIFA</th>
                <th className="p-2 border border-black">MONEDA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-black">{embParaPDF.concepto_servicio || 'FLETE TERRESTRE'}</td>
                <td className="p-3 border border-black">{embParaPDF.detalle_servicio || 'EXPORTACIÓN'}</td>
                <td className="p-3 border border-black text-sm">${embParaPDF.tarifa?.toLocaleString()}</td>
                <td className="p-3 border border-black">{embParaPDF.moneda || 'USD'}</td>
              </tr>
            </tbody>
          </table>

          <div className="border-2 border-black p-4 text-[9px] leading-relaxed italic bg-gray-50/30">
            <p className="font-black not-italic mb-2 text-gray-400">NOTAS E INSTRUCCIONES ESPECIALES:</p>
            {embParaPDF.notas_especiales || "Favor de enviar evidencia al cargar y descargar. El pago está sujeto a la entrega de la prueba de entrega sellada y legible."}
          </div>
        </div>
      )}
    </div>
  );
}