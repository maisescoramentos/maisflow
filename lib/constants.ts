import type { TarefaStatus, Prioridade, ProjetoStatus } from "@/types";

export const KANBAN_COLUNAS: { id: TarefaStatus; label: string; cor: string }[] = [
  { id: "BACKLOG", label: "Backlog", cor: "#9B9B9B" },
  { id: "A_FAZER", label: "A Fazer", cor: "#3B82F6" },
  { id: "EM_ANDAMENTO", label: "Em Andamento", cor: "#F59E0B" },
  { id: "REVISAO", label: "Revisão", cor: "#8B5CF6" },
  { id: "CONCLUIDO", label: "Concluído", cor: "#10B981" },
];

export const STATUS_LABELS: Record<TarefaStatus, string> = {
  BACKLOG: "Backlog",
  A_FAZER: "A Fazer",
  EM_ANDAMENTO: "Em Andamento",
  REVISAO: "Revisão",
  CONCLUIDO: "Concluído",
};

export const STATUS_CORES: Record<TarefaStatus, string> = {
  BACKLOG: "bg-gray-100 text-gray-600",
  A_FAZER: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-yellow-100 text-yellow-700",
  REVISAO: "bg-purple-100 text-purple-700",
  CONCLUIDO: "bg-green-100 text-green-700",
};

export const PRIORIDADE_LABELS: Record<Prioridade, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const PRIORIDADE_CORES: Record<Prioridade, string> = {
  BAIXA: "bg-gray-100 text-gray-500",
  MEDIA: "bg-blue-100 text-blue-600",
  ALTA: "bg-orange-100 text-orange-600",
  URGENTE: "bg-red-100 text-red-600",
};

export const PROJETO_STATUS_LABELS: Record<ProjetoStatus, string> = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  CONCLUIDO: "Concluído",
  ARQUIVADO: "Arquivado",
};

export const PROJETO_STATUS_CORES: Record<ProjetoStatus, string> = {
  ATIVO: "bg-green-100 text-green-700",
  PAUSADO: "bg-yellow-100 text-yellow-700",
  CONCLUIDO: "bg-blue-100 text-blue-700",
  ARQUIVADO: "bg-gray-100 text-gray-500",
};

export const CLIMA_OPCOES = [
  "Ensolarado", "Nublado", "Chuvoso", "Parcialmente nublado", "Ventoso", "Tempestade",
];
