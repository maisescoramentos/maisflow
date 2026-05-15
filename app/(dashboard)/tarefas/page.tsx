"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import TarefaModal from "@/components/tarefas/TarefaModal";
import { STATUS_CORES, STATUS_LABELS, PRIORIDADE_CORES, PRIORIDADE_LABELS } from "@/lib/constants";
import { formatarData, estaAtrasado } from "@/lib/utils";
import type { TarefaComDetalhes, UserBasico } from "@/types";

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<TarefaComDetalhes[]>([]);
  const [usuarios, setUsuarios] = useState<UserBasico[]>([]);
  const [loading, setLoading] = useState(true);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaComDetalhes | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "pendentes" | "concluidas" | "atrasadas">("pendentes");

  async function carregar() {
    const [tRes, uRes] = await Promise.all([
      fetch("/api/tarefas/minhas"),
      fetch("/api/usuarios"),
    ]);
    if (tRes.ok) setTarefas(await tRes.json());
    if (uRes.ok) setUsuarios(await uRes.json());
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtro === "pendentes") return t.status !== "CONCLUIDO";
    if (filtro === "concluidas") return t.status === "CONCLUIDO";
    if (filtro === "atrasadas") return estaAtrasado(t.dataVenc) && t.status !== "CONCLUIDO";
    return true;
  });

  const abas = [
    { id: "pendentes", label: "Pendentes", count: tarefas.filter((t) => t.status !== "CONCLUIDO").length },
    { id: "atrasadas", label: "Atrasadas", count: tarefas.filter((t) => estaAtrasado(t.dataVenc) && t.status !== "CONCLUIDO").length },
    { id: "concluidas", label: "Concluídas", count: tarefas.filter((t) => t.status === "CONCLUIDO").length },
    { id: "todas", label: "Todas", count: tarefas.length },
  ] as const;

  return (
    <div>
      <Header titulo="Minhas Tarefas" subtitulo="Tarefas atribuídas a você" />

      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-fit">
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setFiltro(aba.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filtro === aba.id ? "bg-[#1400FF] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {aba.label}
            <span className={`rounded-full px-1.5 text-xs ${filtro === aba.id ? "bg-white/30" : "bg-gray-100"}`}>
              {aba.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : tarefasFiltradas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {filtro === "atrasadas" ? "Nenhuma tarefa atrasada 🎉" : "Nenhuma tarefa nesta categoria"}
        </div>
      ) : (
        <div className="space-y-2">
          {tarefasFiltradas.map((t) => {
            const atrasado = estaAtrasado(t.dataVenc) && t.status !== "CONCLUIDO";
            return (
              <Card
                key={t.id}
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${atrasado ? "border-red-200" : ""}`}
                onClick={() => setTarefaSelecionada(t)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {atrasado && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                      <p className="text-sm font-medium text-gray-900 truncate">{t.titulo}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {t.projeto && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.projeto.cor }} />
                          {t.projeto.nome}
                        </span>
                      )}
                      {t.dataVenc && (
                        <span className={`text-xs ${atrasado ? "text-red-500 font-medium" : "text-gray-400"}`}>
                          Vence {formatarData(t.dataVenc)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={PRIORIDADE_CORES[t.prioridade]}>{PRIORIDADE_LABELS[t.prioridade]}</Badge>
                    <Badge className={STATUS_CORES[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tarefaSelecionada && (
        <TarefaModal
          open={!!tarefaSelecionada}
          onClose={() => setTarefaSelecionada(null)}
          tarefa={tarefaSelecionada}
          projetoId={tarefaSelecionada.projetoId}
          usuarios={usuarios}
          onSaved={carregar}
        />
      )}
    </div>
  );
}
