"use client";

import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import { AvatarGroup } from "@/components/ui/Avatar";
import { PROJETO_STATUS_LABELS, PROJETO_STATUS_CORES } from "@/lib/constants";
import { formatarData, calcularProgresso } from "@/lib/utils";
import type { ProjetoComMembros } from "@/types";

interface Props {
  projeto: ProjetoComMembros & {
    tarefas?: { status: string }[];
    _count?: { tarefas: number };
  };
}

export default function ProjetoCard({ projeto }: Props) {
  const total = projeto.tarefas?.length ?? 0;
  const concluidas = projeto.tarefas?.filter((t) => t.status === "CONCLUIDO").length ?? 0;
  const progresso = calcularProgresso(total, concluidas);

  return (
    <Link href={`/projetos/${projeto.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ backgroundColor: projeto.cor }}
            >
              {projeto.nome[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{projeto.nome}</h3>
              {projeto.clienteNome && (
                <p className="text-xs text-gray-500 truncate">{projeto.clienteNome}</p>
              )}
            </div>
          </div>
          <Badge className={PROJETO_STATUS_CORES[projeto.status]}>
            {PROJETO_STATUS_LABELS[projeto.status]}
          </Badge>
        </div>

        {projeto.descricao && (
          <p className="text-sm text-gray-500 line-clamp-2">{projeto.descricao}</p>
        )}

        <div className="mt-auto space-y-3">
          {total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{concluidas} de {total} tarefas</span>
                <span>{progresso}%</span>
              </div>
              <Progress value={progresso} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <AvatarGroup users={projeto.membros.map((m) => m.user)} max={4} />
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {projeto.dataFim && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatarData(projeto.dataFim)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={12} />
                {projeto.membros.length}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
