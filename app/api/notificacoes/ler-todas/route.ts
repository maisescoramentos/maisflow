import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await prisma.notificacao.updateMany({
    where: { userId: session.user.id, lida: false },
    data: { lida: true },
  });

  return NextResponse.json({ ok: true });
}
