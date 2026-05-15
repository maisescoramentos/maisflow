import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const tarefa = await prisma.tarefa.findUnique({
    where: { id },
    include: {
      projeto: { select: { id: true, nome: true, cor: true } },
      responsaveis: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      anexos: true,
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

  if (!tarefa) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(tarefa);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const tarefa = await prisma.tarefa.findUnique({ where: { id }, select: { creatorId: true } });
  if (!tarefa) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  const podeEditar = !tarefa.creatorId || tarefa.creatorId === session.user.id || session.user.role === "ADMIN";
  if (!podeEditar) return NextResponse.json({ error: "Apenas o criador pode editar esta tarefa" }, { status: 403 });

  const body = await req.json();
  const { responsaveis, anexos, ...data } = body;

  const updated = await prisma.tarefa.update({
    where: { id },
    data: {
      ...(data.titulo && { titulo: data.titulo }),
      ...(data.descricao !== undefined && { descricao: data.descricao }),
      ...(data.status && { status: data.status }),
      ...(data.prioridade && { prioridade: data.prioridade }),
      ...(data.dataVenc !== undefined && { dataVenc: data.dataVenc ? new Date(data.dataVenc) : null }),
      ...(data.ordem !== undefined && { ordem: data.ordem }),
      ...(responsaveis && {
        responsaveis: {
          deleteMany: {},
          create: responsaveis.map((userId: string) => ({ userId })),
        },
      }),
      ...(anexos && {
        anexos: {
          deleteMany: {},
          create: anexos.map((a: { url: string; nome: string; tamanho: number; tipo: string }) => ({
            url: a.url, nome: a.nome, tamanho: a.tamanho, tipo: a.tipo,
          })),
        },
      }),
    },
    include: {
      responsaveis: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      anexos: true,
      _count: { select: { subtarefas: true, comentarios: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const tarefa = await prisma.tarefa.findUnique({ where: { id }, select: { creatorId: true } });
  if (!tarefa) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  const podeExcluir = !tarefa.creatorId || tarefa.creatorId === session.user.id || session.user.role === "ADMIN";
  if (!podeExcluir) return NextResponse.json({ error: "Apenas o criador pode excluir esta tarefa" }, { status: 403 });

  await prisma.tarefa.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
