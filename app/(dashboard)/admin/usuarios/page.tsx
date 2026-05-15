import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsuarios } from "@/lib/queries/usuarios";
import Header from "@/components/layout/Header";
import UsuarioAdminClient from "@/components/admin/UsuarioAdminClient";

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const usuarios = await getUsuarios();

  return (
    <div>
      <Header
        titulo="Gestão de Usuários"
        subtitulo={`${usuarios.length} usuário${usuarios.length !== 1 ? "s" : ""} cadastrado${usuarios.length !== 1 ? "s" : ""}`}
      />
      <UsuarioAdminClient usuariosIniciais={usuarios as never} />
    </div>
  );
}
