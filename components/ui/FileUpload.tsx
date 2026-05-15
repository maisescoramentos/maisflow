"use client";

import { useState, useRef } from "react";
import { Paperclip, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ArquivoUpload {
  url: string;
  nome: string;
  tamanho: number;
  tipo: string;
}

interface Props {
  arquivos: ArquivoUpload[];
  onChange: (arquivos: ArquivoUpload[]) => void;
  maxArquivos?: number;
  className?: string;
}

function iconeArquivo(tipo: string) {
  if (tipo.startsWith("image/")) return <ImageIcon size={14} className="text-blue-500" />;
  return <FileText size={14} className="text-gray-500" />;
}

function tamanhoLegivel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FileUpload({ arquivos, onChange, maxArquivos = 5, className }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (arquivos.length + files.length > maxArquivos) {
      toast.error(`Máximo de ${maxArquivos} arquivos`);
      return;
    }

    setUploading(true);
    const novos: ArquivoUpload[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        novos.push(await res.json());
      } else {
        const err = await res.json();
        toast.error(err.error || `Erro ao enviar ${file.name}`);
      }
    }

    setUploading(false);
    onChange([...arquivos, ...novos]);
  }

  function remover(index: number) {
    onChange(arquivos.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-2", className)}>
      {arquivos.length > 0 && (
        <div className="space-y-1.5">
          {arquivos.map((a, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
              {iconeArquivo(a.tipo)}
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-gray-700 hover:text-[#1400FF] truncate min-w-0">
                {a.nome}
              </a>
              <span className="text-xs text-gray-400 flex-shrink-0">{tamanhoLegivel(a.tamanho)}</span>
              <button type="button" onClick={() => remover(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {arquivos.length < maxArquivos && (
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1400FF] disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
            {uploading ? "Enviando..." : "Anexar arquivo"}
          </button>
        </div>
      )}
    </div>
  );
}
