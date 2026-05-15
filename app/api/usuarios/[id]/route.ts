import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { usuarioUpdateSchema } from "@/lib/validations/usuario";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json();
  const parsed = usuarioUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.role) data.role = parsed.data.role;
  if (parsed.data.ativo !== undefined) data.ativo = parsed.data.ativo;
  if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 12);

  const usuario = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, ativo: true, createdAt: true },
  });

  return NextResponse.json(usuario);
}
