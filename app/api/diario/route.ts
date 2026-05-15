import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { diarioSchema } from "@/lib/validations/diario";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const entradas = await prisma.entradaDiario.findMany({
    where: { userId: session.user.id },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entradas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = diarioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const entrada = await prisma.entradaDiario.create({
    data: {
      titulo: data.titulo,
      conteudo: data.conteudo,
      clima: data.clima || null,
      workers: data.workers ?? null,
      fotos: [],
      projetoId: data.projetoId || null,
      userId: session.user.id,
    },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
  });

  return NextResponse.json(entrada, { status: 201 });
}
