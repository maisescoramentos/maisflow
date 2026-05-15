import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTarefasDoUsuario } from "@/lib/queries/tarefas";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const tarefas = await getTarefasDoUsuario(session.user.id);
  return NextResponse.json(tarefas);
}
