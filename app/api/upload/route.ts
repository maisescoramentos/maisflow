import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const TIPOS_PERMITIDOS = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 });
  if (file.size > TAMANHO_MAX) return NextResponse.json({ error: "Arquivo muito grande (máx. 10 MB)" }, { status: 400 });
  if (!TIPOS_PERMITIDOS.includes(file.type)) return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });

  const nomeSeguro = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blob = await put(nomeSeguro, file, { access: "public" });

  return NextResponse.json({
    url: blob.url,
    nome: file.name,
    tamanho: file.size,
    tipo: file.type,
  });
}
