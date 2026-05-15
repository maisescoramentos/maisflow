"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diarioSchema, type DiarioInput } from "@/lib/validations/diario";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { CLIMA_OPCOES } from "@/lib/constants";
import type { ProjetoComMembros } from "@/types";

const CLIMA_OPTIONS = CLIMA_OPCOES.map((c) => ({ value: c, label: c }));

interface Props {
  projetos: ProjetoComMembros[];
  onSubmit: (data: DiarioInput) => Promise<void>;
  loading?: boolean;
}

export default function EntradaForm({ projetos, onSubmit, loading }: Props) {
  const projetoOptions = projetos.map((p) => ({ value: p.id, label: p.nome }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiarioInput>({ resolver: zodResolver(diarioSchema) });

  async function onFormSubmit(data: DiarioInput) {
    await onSubmit(data);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input label="Título da entrada *" placeholder="Ex: Início das instalações..." error={errors.titulo?.message} {...register("titulo")} />
      <Textarea label="Relato do dia *" placeholder="Descreva as atividades realizadas..." error={errors.conteudo?.message} rows={5} {...register("conteudo")} />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Clima" options={CLIMA_OPTIONS} placeholder="Selecione o clima" {...register("clima")} />
        <Input
          label="Nº de trabalhadores"
          type="number"
          min={0}
          placeholder="0"
          {...register("workers", { valueAsNumber: true })}
        />
      </div>

      {projetoOptions.length > 0 && (
        <Select label="Projeto relacionado" options={projetoOptions} placeholder="Nenhum projeto" {...register("projetoId")} />
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>Salvar entrada</Button>
      </div>
    </form>
  );
}
