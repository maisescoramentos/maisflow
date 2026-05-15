import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const projeto = await prisma.projeto.findFirst({
    where: { id, membros: { some: { userId: session.user.id } } },
  });
  if (!projeto) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.projeto.update({
    where: { id },
    data: { portalAtivo: !projeto.portalAtivo },
  });

  return NextResponse.json({ portalAtivo: updated.portalAtivo });
}
