import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tarefaSchema } from "@/lib/validations/tarefa";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { projetoId, anexos, ...rest } = body;

  if (!projetoId) return NextResponse.json({ error: "projetoId obrigatório" }, { status: 400 });

  const parsed = tarefaSchema.safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const count = await prisma.tarefa.count({ where: { projetoId, status: data.status } });

  const tarefa = await prisma.tarefa.create({
    data: {
      titulo: data.titulo,
      descricao: data.descricao || null,
      status: data.status,
      prioridade: data.prioridade,
      ordem: count,
      dataVenc: data.dataVenc ? new Date(data.dataVenc) : null,
      projetoId,
      parentId: data.parentId || null,
      creatorId: session.user.id,
      responsaveis: {
        create: data.responsaveis.map((userId) => ({ userId })),
      },
      ...(anexos?.length && {
        anexos: {
          create: anexos.map((a: { url: string; nome: string; tamanho: number; tipo: string }) => ({
            url: a.url,
            nome: a.nome,
            tamanho: a.tamanho,
            tipo: a.tipo,
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

  return NextResponse.json(tarefa, { status: 201 });
}
