"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, UserCheck, UserX } from "lucide-react";
import { usuarioSchema, type UsuarioInput } from "@/lib/validations/usuario";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { formatarData } from "@/lib/utils";

interface Usuario {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  ativo: boolean;
  createdAt: Date;
}

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Membro" },
  { value: "ADMIN", label: "Administrador" },
];

interface Props {
  usuariosIniciais: Usuario[];
}

export default function UsuarioAdminClient({ usuariosIniciais }: Props) {
  const [usuarios, setUsuarios] = useState(usuariosIniciais);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioInput>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { role: "MEMBER" },
  });

  async function onSubmit(data: UsuarioInput) {
    setLoading(true);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      const novo = await res.json();
      setUsuarios((prev) => [...prev, novo]);
      toast.success("Usuário criado com sucesso");
      reset();
      setModalOpen(false);
    } else {
      const err = await res.json();
      toast.error(err.error || "Erro ao criar usuário");
    }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    if (res.ok) {
      setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, ativo: !ativo } : u));
      toast.success(ativo ? "Usuário desativado" : "Usuário ativado");
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Novo usuário
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar nome={u.name} avatarUrl={u.avatarUrl} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}>
                    {u.role === "ADMIN" ? "Administrador" : "Membro"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={u.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatarData(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAtivo(u.id, u.ativo)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                    title={u.ativo ? "Desativar" : "Ativar"}
                  >
                    {u.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo usuário">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome *" placeholder="Nome completo" error={errors.name?.message} {...register("name")} />
          <Input label="Email *" type="email" placeholder="email@maisescoramentos.com.br" error={errors.email?.message} {...register("email")} />
          <Input label="Senha *" type="password" placeholder="Mínimo 6 caracteres" error={errors.password?.message} {...register("password")} />
          <Select label="Perfil *" options={ROLE_OPTIONS} {...register("role")} />
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>Criar usuário</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
