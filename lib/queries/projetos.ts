import { prisma } from "@/lib/prisma";

export async function getProjetos(userId: string) {
  return prisma.projeto.findMany({
    where: {
      membros: { some: { userId } },
    },
    include: {
      membros: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      _count: { select: { tarefas: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjetoById(id: string, userId: string) {
  return prisma.projeto.findFirst({
    where: { id, membros: { some: { userId } } },
    include: {
      membros: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      tarefas: {
        where: { parentId: null },
        include: {
          responsaveis: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
          _count: { select: { subtarefas: true, comentarios: true } },
        },
        orderBy: [{ status: "asc" }, { ordem: "asc" }],
      },
    },
  });
}
