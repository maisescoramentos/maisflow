import { z } from "zod";

export const tarefaSchema = z.object({
  titulo: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(200),
  descricao: z.string().max(2000).optional(),
  status: z.enum(["BACKLOG", "A_FAZER", "EM_ANDAMENTO", "REVISAO", "CONCLUIDO"]),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]),
  dataVenc: z.string().optional(),
  responsaveis: z.array(z.string()).min(1, "Selecione ao menos um responsável"),
  parentId: z.string().optional(),
});

export type TarefaInput = z.infer<typeof tarefaSchema>;
