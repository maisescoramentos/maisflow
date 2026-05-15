import { z } from "zod";

export const diarioSchema = z.object({
  titulo: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(200),
  conteudo: z.string().min(5, "Descreva a entrada com mais detalhes"),
  clima: z.string().optional(),
  workers: z.number().int().min(0).optional(),
  projetoId: z.string().optional(),
});

export type DiarioInput = z.infer<typeof diarioSchema>;
