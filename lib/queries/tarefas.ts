import { prisma } from "@/lib/prisma";

export async function getTarefasDoUsuario(userId: string) {
  return prisma.tarefa.findMany({
    where: {
      responsaveis: { some: { userId } },
      parentId: null,
    },
    include: {
      projeto: { select: { id: true, nome: true, cor: true } },
      responsaveis: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      _count: { select: { subtarefas: true, comentarios: true } },
    },
    orderBy: [{ dataVenc: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTarefaById(id: string) {
  return prisma.tarefa.findUnique({
    where: { id },
    include: {
      projeto: { select: { id: true, nome: true, cor: true } },
      responsaveis: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      subtarefas: {
        include: {
          responsaveis: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
        },
        orderBy: { ordem: "asc" },
      },
      comentarios: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
