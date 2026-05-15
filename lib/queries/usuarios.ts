import { prisma } from "@/lib/prisma";

export async function getUsuarios() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, ativo: true, createdAt: true },
    orderBy: { name: "asc" },
  });
}

export async function getUsuariosAtivos() {
  return prisma.user.findMany({
    where: { ativo: true },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    orderBy: { name: "asc" },
  });
}
