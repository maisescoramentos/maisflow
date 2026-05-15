import { z } from "zod";

export const usuarioSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const usuarioUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  ativo: z.boolean().optional(),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>;
