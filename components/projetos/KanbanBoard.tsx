"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import KanbanColuna from "./KanbanColuna";
import { KANBAN_COLUNAS } from "@/lib/constants";
import type { TarefaComDetalhes, TarefaStatus } from "@/types";

interface Props {
  tarefasIniciais: TarefaComDetalhes[];
  onTarefaClick: (tarefa: TarefaComDetalhes) => void;
  onAddTarefa: (status: TarefaStatus) => void;
}

export default function KanbanBoard({ tarefasIniciais, onTarefaClick, onAddTarefa }: Props) {
  const [tarefas, setTarefas] = useState(tarefasIniciais);

  const tarefasPorColuna = useCallback(
    (status: TarefaStatus) =>
      tarefas.filter((t) => t.status === status).sort((a, b) => a.ordem - b.ordem),
    [tarefas]
  );

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const novoStatus = destination.droppableId as TarefaStatus;
    const colunaDestino = tarefas
      .filter((t) => t.status === novoStatus && t.id !== draggableId)
      .sort((a, b) => a.ordem - b.ordem);

    colunaDestino.splice(destination.index, 0, { id: draggableId } as TarefaComDetalhes);

    const atualizacoes = colunaDestino.map((t, i) => ({
      id: t.id,
      status: novoStatus,
      ordem: i,
    }));

    setTarefas((prev) =>
      prev.map((t) => {
        const atualizado = atualizacoes.find((a) => a.id === t.id);
        if (atualizado) return { ...t, status: atualizado.status, ordem: atualizado.ordem };
        if (t.id === draggableId) return { ...t, status: novoStatus };
        return t;
      })
    );

    try {
      await fetch("/api/tarefas/reordenar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tarefas: atualizacoes }),
      });
    } catch {
      toast.error("Erro ao salvar a ordem");
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUNAS.map((col) => (
          <KanbanColuna
            key={col.id}
            id={col.id}
            label={col.label}
            cor={col.cor}
            tarefas={tarefasPorColuna(col.id)}
            onAddTarefa={() => onAddTarefa(col.id)}
            onTarefaClick={onTarefaClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
