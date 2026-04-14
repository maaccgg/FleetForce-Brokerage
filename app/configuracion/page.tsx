"use client";

import { useState, useEffect } from "react";
import { Upload, Save, Loader2, Building, Image as ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

export default function ConfiguracionPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmpresaId(user.id);
      const { data } = await supabase
        .from('perfil_empresa')
        .select('logo_url')
        .eq('id', user.id)
        .single();
      
      if (data?.logo_url) setLogoUrl(data.logo_url);
    }
  };

  const subirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Renombramos el archivo con el ID de la empresa para evitar duplicados
      const fileName = `logo_${empresaId}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir a Supabase Storage (Bucket: 'logos')
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      // 3. Guardar en la tabla perfil_empresa
      const { error: dbError } = await supabase
        .from('perfil_empresa')
        .upsert({ 
          id: empresaId, 
          logo_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      setLogoUrl(publicUrl);
      alert("Logo actualizado con éxito.");

    } catch (error: any) {
      alert("Error al subir imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
          Configuración Institucional
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Identidad y Parámetros del Broker</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <Building className="text-blue-600" size={24} />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Identidad Visual</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* VISUALIZADOR DEL LOGO */}
          <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
            <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 relative overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Empresa" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-bold uppercase">Sin Logo</p>
                </div>
              )}
            </div>
          </div>

          {/* CONTROLES DE SUBIDA */}
          <div className="w-full md:w-2/3 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 mb-2">Logotipo en Carta de Instrucciones</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Este logo reemplazará el texto "FLEETFORCE" en la esquina superior izquierda de tus documentos PDF generados. Se recomienda usar formato PNG con fondo transparente.
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  onChange={subirLogo}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button 
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg hover:bg-slate-800 w-full md:w-auto disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploading ? 'Procesando...' : 'Subir Nuevo Logo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}