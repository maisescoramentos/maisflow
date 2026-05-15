"use client";

import { Calendar, MessageSquare, Layers } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import Badge from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/Avatar";
import { PRIORIDADE_LABELS, PRIORIDADE_CORES } from "@/lib/constants";
import { formatarData, estaAtrasado } from "@/lib/utils";
import type { TarefaComDetalhes } from "@/types";

interface Props {
  tarefa: TarefaComDetalhes;
  index: number;
  onClick: (tarefa: TarefaComDetalhes) => void;
}

export default function KanbanCard({ tarefa, index, onClick }: Props) {
  const atrasado = estaAtrasado(tarefa.dataVenc);

  return (
    <Draggable draggableId={tarefa.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(tarefa)}
          className={`bg-white rounded-xl border border-gray-200 p-3 cursor-pointer select-none transition-shadow ${
            snapshot.isDragging ? "shadow-lg rotate-1" : "hover:shadow-md"
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{tarefa.titulo}</p>
            <Badge className={`${PRIORIDADE_CORES[tarefa.prioridade]} flex-shrink-0`}>
              {PRIORIDADE_LABELS[tarefa.prioridade]}
            </Badge>
          </div>

          {tarefa.descricao && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{tarefa.descricao}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <AvatarGroup users={tarefa.responsaveis.map((r) => r.user)} max={3} />
            <div className="flex items-center gap-2 text-gray-400">
              {(tarefa._count?.subtarefas ?? 0) > 0 && (
                <span className="flex items-center gap-0.5 text-xs">
                  <Layers size={12} />
                  {tarefa._count?.subtarefas}
                </span>
              )}
              {(tarefa._count?.comentarios ?? 0) > 0 && (
                <span className="flex items-center gap-0.5 text-xs">
                  <MessageSquare size={12} />
                  {tarefa._count?.comentarios}
                </span>
              )}
              {tarefa.dataVenc && (
                <span className={`flex items-center gap-0.5 text-xs ${atrasado ? "text-red-500" : ""}`}>
                  <Calendar size={12} />
                  {formatarData(tarefa.dataVenc)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
