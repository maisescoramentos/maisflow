export type { Session } from "next-auth";

export type UserRole = "ADMIN" | "MEMBER";

export type ProjetoStatus = "ATIVO" | "PAUSADO" | "CONCLUIDO" | "ARQUIVADO";

export type TarefaStatus = "BACKLOG" | "A_FAZER" | "EM_ANDAMENTO" | "REVISAO" | "CONCLUIDO";

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export interface UserBasico {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface ProjetoComMembros {
  id: string;
  nome: string;
  descricao: string | null;
  clienteNome: string | null;
  clienteEmail: string | null;
  status: ProjetoStatus;
  cor: string;
  portalToken: string | null;
  portalAtivo: boolean;
  dataInicio: Date | null;
  dataFim: Date | null;
  createdAt: Date;
  updatedAt: Date;
  membros: {
    userId: string;
    isOwner: boolean;
    user: UserBasico;
  }[];
  _count?: { tarefas: number };
}

export interface TarefaComDetalhes {
  id: string;
  titulo: string;
  descricao: string | null;
  status: TarefaStatus;
  prioridade: Prioridade;
  ordem: number;
  dataVenc: Date | null;
  projetoId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  projeto?: { id: string; nome: string; cor: string };
  responsaveis: { user: UserBasico }[];
  subtarefas?: TarefaComDetalhes[];
  comentarios?: ComentarioComAutor[];
  anexos?: Anexo[];
  creatorId?: string | null;
  _count?: { subtarefas: number; comentarios: number };
}

export interface Anexo {
  id: string;
  nome: string;
  url: string;
  tamanho: number;
  tipo: string;
}

export interface ComentarioComAutor {
  id: string;
  conteudo: string;
  anexoUrl: string | null;
  anexoNome: string | null;
  anexoTipo: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: UserBasico;
}

export interface EntradaDiarioComAutor {
  id: string;
  titulo: string;
  conteudo: string;
  clima: string | null;
  workers: number | null;
  fotos: string[];
  projetoId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: UserBasico;
}

export interface NotificacaoItem {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link: string | null;
  createdAt: Date;
}

export interface DashboardStats {
  projetosAtivos: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
  tarefasAtrasadas: number;
}
