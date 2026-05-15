import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projetoSchema } from "@/lib/validations/projeto";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const projeto = await prisma.projeto.findFirst({
    where: { id, membros: { some: { userId: session.user.id } } },
    include: {
      membros: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      tarefas: {
        where: { parentId: null },
        include: {
          responsaveis: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
          _count: { select: { subtarefas: true, comentarios: true } },
        },
        orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!projeto) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  return NextResponse.json(projeto);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const membro = await prisma.projetoMembro.findFirst({
    where: { projetoId: id, userId: session.user.id },
  });
  if (!membro) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const parsed = projetoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const projeto = await prisma.projeto.update({
    where: { id },
    data: {
      nome: data.nome,
      descricao: data.descricao || null,
      clienteNome: data.clienteNome || null,
      clienteEmail: data.clienteEmail || null,
      status: data.status,
      cor: data.cor,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
      dataFim: data.dataFim ? new Date(data.dataFim) : null,
    },
  });

  return NextResponse.json(projeto);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem excluir projetos" }, { status: 403 });
  }

  await prisma.projeto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
