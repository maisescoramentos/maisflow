import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { usuarioSchema } from "@/lib/validations/usuario";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const usuarios = await prisma.user.findMany({
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, ativo: true, createdAt: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = usuarioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existe = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existe) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });

  const hash = await bcrypt.hash(parsed.data.password, 12);
  const usuario = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hash,
      role: parsed.data.role,
    },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, ativo: true, createdAt: true },
  });

  return NextResponse.json(usuario, { status: 201 });
}
