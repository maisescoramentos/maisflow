import { prisma } from "@/lib/prisma";

export async function getEntradasDiario(userId: string, projetoId?: string) {
  return prisma.entradaDiario.findMany({
    where: {
      userId,
      ...(projetoId ? { projetoId } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDashboardStats(userId: string) {
  const [projetosAtivos, tarefasPendentes, tarefasConcluidas, tarefasAtrasadas] = await Promise.all([
    prisma.projeto.count({
      where: { status: "ATIVO", membros: { some: { userId } } },
    }),
    prisma.tarefa.count({
      where: {
        responsaveis: { some: { userId } },
        status: { in: ["BACKLOG", "A_FAZER", "EM_ANDAMENTO", "REVISAO"] },
      },
    }),
    prisma.tarefa.count({
      where: {
        responsaveis: { some: { userId } },
        status: "CONCLUIDO",
      },
    }),
    prisma.tarefa.count({
      where: {
        responsaveis: { some: { userId } },
        status: { not: "CONCLUIDO" },
        dataVenc: { lt: new Date() },
      },
    }),
  ]);

  return { projetosAtivos, tarefasPendentes, tarefasConcluidas, tarefasAtrasadas };
}
