import { prisma } from "@/lib/prisma";

export async function getNotificacoes(userId: string) {
  return prisma.notificacao.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getNotificacoesNaoLidas(userId: string) {
  return prisma.notificacao.count({
    where: { userId, lida: false },
  });
}
