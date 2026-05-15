import { z } from "zod";

export const projetoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  descricao: z.string().max(500).optional(),
  clienteNome: z.string().max(100).optional(),
  clienteEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  status: z.enum(["ATIVO", "PAUSADO", "CONCLUIDO", "ARQUIVADO"]),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export type ProjetoInput = z.infer<typeof projetoSchema>;
