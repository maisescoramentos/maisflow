import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const { conteudo, anexoUrl, anexoNome, anexoTipo } = await req.json();
  if (!conteudo?.trim()) return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });

  const comentario = await prisma.comentario.create({
    data: {
      conteudo,
      tarefaId: id,
      userId: session.user.id,
      anexoUrl: anexoUrl || null,
      anexoNome: anexoNome || null,
      anexoTipo: anexoTipo || null,
    },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
  });

  return NextResponse.json(comentario, { status: 201 });
}
