"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CloudSun, Users, FolderKanban } from "lucide-react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import EntradaForm from "@/components/diario/EntradaForm";
import Skeleton from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import { formatarDataHora } from "@/lib/utils";
import type { DiarioInput } from "@/lib/validations/diario";
import type { ProjetoComMembros } from "@/types";

interface Entrada {
  id: string;
  titulo: string;
  conteudo: string;
  clima: string | null;
  workers: number | null;
  projetoId: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export default function DiarioPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [projetos, setProjetos] = useState<ProjetoComMembros[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const [eRes, pRes] = await Promise.all([
      fetch("/api/diario"),
      fetch("/api/projetos"),
    ]);
    if (eRes.ok) setEntradas(await eRes.json());
    if (pRes.ok) setProjetos(await pRes.json());
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function salvarEntrada(data: DiarioInput) {
    setSalvando(true);
    const res = await fetch("/api/diario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSalvando(false);
    if (res.ok) {
      toast.success("Entrada salva no diário!");
      carregar();
    } else {
      toast.error("Erro ao salvar");
    }
  }

  const projetoMap = projetos.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, ProjetoComMembros>);

  return (
    <div className="max-w-4xl">
      <Header titulo="Diário de Obras" subtitulo="Registros diários das obras" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Nova entrada</h2>
            <EntradaForm projetos={projetos} onSubmit={salvarEntrada} loading={salvando} />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)
          ) : entradas.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              Nenhuma entrada no diário ainda
            </div>
          ) : (
            entradas.map((e) => {
              const projeto = e.projetoId ? projetoMap[e.projetoId] : null;
              return (
                <Card key={e.id} className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar nome={e.user.name} avatarUrl={e.user.avatarUrl} size="sm" />
                      <div>
                        <p className="font-semibold text-gray-900">{e.titulo}</p>
                        <p className="text-xs text-gray-400">{formatarDataHora(e.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {e.clima && (
                        <span className="flex items-center gap-1"><CloudSun size={13} /> {e.clima}</span>
                      )}
                      {e.workers != null && (
                        <span className="flex items-center gap-1"><Users size={13} /> {e.workers} trabalhadores</span>
                      )}
                      {projeto && (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: projeto.cor }} />
                          {projeto.nome}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{e.conteudo}</p>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
