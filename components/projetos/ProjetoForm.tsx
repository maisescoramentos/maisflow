"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projetoSchema, type ProjetoInput } from "@/lib/validations/projeto";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { ProjetoComMembros } from "@/types";

const STATUS_OPTIONS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "PAUSADO", label: "Pausado" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "ARQUIVADO", label: "Arquivado" },
];

const CORES = ["#1400FF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

interface Props {
  projeto?: ProjetoComMembros;
  onSubmit: (data: ProjetoInput) => Promise<void>;
  loading?: boolean;
}

export default function ProjetoForm({ projeto, onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjetoInput>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      nome: projeto?.nome ?? "",
      descricao: projeto?.descricao ?? "",
      clienteNome: projeto?.clienteNome ?? "",
      clienteEmail: projeto?.clienteEmail ?? "",
      status: projeto?.status ?? "ATIVO",
      cor: projeto?.cor ?? "#1400FF",
      dataInicio: projeto?.dataInicio ? new Date(projeto.dataInicio).toISOString().split("T")[0] : "",
      dataFim: projeto?.dataFim ? new Date(projeto.dataFim).toISOString().split("T")[0] : "",
    },
  });

  const corAtual = watch("cor");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nome do projeto *" placeholder="Ex: Escoramento Torre Norte" error={errors.nome?.message} {...register("nome")} />
      <Textarea label="Descrição" placeholder="Descreva o escopo do projeto..." error={errors.descricao?.message} {...register("descricao")} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Cliente" placeholder="Nome do cliente" {...register("clienteNome")} />
        <Input label="Email do cliente" type="email" placeholder="email@cliente.com" error={errors.clienteEmail?.message} {...register("clienteEmail")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Data de início" type="date" {...register("dataInicio")} />
        <Input label="Data de término" type="date" {...register("dataFim")} />
      </div>

      <Select label="Status" options={STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Cor do projeto</label>
        <div className="flex gap-2 flex-wrap">
          {CORES.map((cor) => (
            <button
              key={cor}
              type="button"
              onClick={() => setValue("cor", cor)}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: cor,
                outline: cor === corAtual ? `3px solid ${cor}` : undefined,
                outlineOffset: cor === corAtual ? "2px" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>
          {projeto ? "Salvar alterações" : "Criar projeto"}
        </Button>
      </div>
    </form>
  );
}
