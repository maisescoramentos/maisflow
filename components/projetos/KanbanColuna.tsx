"use client";

import { Plus } from "lucide-react";
import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import type { TarefaComDetalhes } from "@/types";

interface Props {
  id: string;
  label: string;
  cor: string;
  tarefas: TarefaComDetalhes[];
  onAddTarefa: () => void;
  onTarefaClick: (tarefa: TarefaComDetalhes) => void;
}

export default function KanbanColuna({ id, label, cor, tarefas, onAddTarefa, onTarefaClick }: Props) {
  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cor }} />
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-medium">
            {tarefas.length}
          </span>
        </div>
        <button
          onClick={onAddTarefa}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] rounded-xl p-2 space-y-2 transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            {tarefas.map((t, i) => (
              <KanbanCard key={t.id} tarefa={t} index={i} onClick={onTarefaClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
