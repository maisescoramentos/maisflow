import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { tarefas } = await req.json() as { tarefas: { id: string; status: string; ordem: number }[] };

  await prisma.$transaction(
    tarefas.map(({ id, status, ordem }) =>
      prisma.tarefa.update({ where: { id }, data: { status: status as never, ordem } })
    )
  );

  return NextResponse.json({ ok: true });
}
