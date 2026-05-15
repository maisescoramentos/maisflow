import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projetoSchema } from "@/lib/validations/projeto";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const projetos = await prisma.projeto.findMany({
    where: { membros: { some: { userId: session.user.id } } },
    include: {
      membros: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
      _count: { select: { tarefas: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projetos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = projetoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const projeto = await prisma.projeto.create({
    data: {
      nome: data.nome,
      descricao: data.descricao || null,
      clienteNome: data.clienteNome || null,
      clienteEmail: data.clienteEmail || null,
      status: data.status,
      cor: data.cor,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
      dataFim: data.dataFim ? new Date(data.dataFim) : null,
      portalToken: randomUUID(),
      membros: {
        create: [{ userId: session.user.id, isOwner: true }],
      },
    },
    include: {
      membros: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
    },
  });

  return NextResponse.json(projeto, { status: 201 });
}
