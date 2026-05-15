"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, Trash2, Plus, Check, Lock, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { tarefaSchema, type TarefaInput } from "@/lib/validations/tarefa";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import FileUpload, { type ArquivoUpload } from "@/components/ui/FileUpload";
import { STATUS_LABELS, PRIORIDADE_LABELS, STATUS_CORES } from "@/lib/constants";
import { formatarDataHora, tempoRelativo } from "@/lib/utils";
import type { TarefaComDetalhes, TarefaStatus, UserBasico } from "@/types";

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));
const PRIORIDADE_OPTIONS = Object.entries(PRIORIDADE_LABELS).map(([v, l]) => ({ value: v, label: l }));

function iconeArquivo(tipo: string) {
  if (tipo?.startsWith("image/")) return <ImageIcon size={13} className="text-blue-500 flex-shrink-0" />;
  return <FileText size={13} className="text-gray-500 flex-shrink-0" />;
}

interface Props {
  open: boolean;
  onClose: () => void;
  tarefa?: TarefaComDetalhes | null;
  projetoId: string;
  statusInicial?: TarefaStatus;
  usuarios: UserBasico[];
  onSaved: () => void;
}

export default function TarefaModal({ open, onClose, tarefa, projetoId, statusInicial, usuarios, onSaved }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [comentario, setComentario] = useState("");
  const [comentarioAnexo, setComentarioAnexo] = useState<ArquivoUpload | null>(null);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [subtarefaTexto, setSubtarefaTexto] = useState("");
  const [tarefaAtual, setTarefaAtual] = useState<TarefaComDetalhes | null>(tarefa ?? null);
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<string[]>(
    tarefa?.responsaveis.map((r) => r.user.id) ?? []
  );
  const [anexos, setAnexos] = useState<ArquivoUpload[]>(
    tarefa?.anexos?.map((a) => ({ url: a.url, nome: a.nome, tamanho: a.tamanho, tipo: a.tipo })) ?? []
  );

  const podeEditar = !tarefa?.creatorId ||
    tarefa?.creatorId === session?.user?.id ||
    session?.user?.role === "ADMIN";

  useEffect(() => {
    if (tarefa) {
      setTarefaAtual(tarefa);
      setResponsaveisSelecionados(tarefa.responsaveis.map((r) => r.user.id));
      setAnexos(tarefa.anexos?.map((a) => ({ url: a.url, nome: a.nome, tamanho: a.tamanho, tipo: a.tipo })) ?? []);
    } else {
      setResponsaveisSelecionados([]);
      setAnexos([]);
    }
  }, [tarefa]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TarefaInput>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: tarefa?.titulo ?? "",
      descricao: tarefa?.descricao ?? "",
      status: tarefa?.status ?? statusInicial ?? "A_FAZER",
      prioridade: tarefa?.prioridade ?? "MEDIA",
      dataVenc: tarefa?.dataVenc ? new Date(tarefa.dataVenc).toISOString().split("T")[0] : "",
      responsaveis: tarefa?.responsaveis.map((r) => r.user.id) ?? [],
    },
  });

  useEffect(() => {
    reset({
      titulo: tarefa?.titulo ?? "",
      descricao: tarefa?.descricao ?? "",
      status: tarefa?.status ?? statusInicial ?? "A_FAZER",
      prioridade: tarefa?.prioridade ?? "MEDIA",
      dataVenc: tarefa?.dataVenc ? new Date(tarefa.dataVenc).toISOString().split("T")[0] : "",
      responsaveis: tarefa?.responsaveis.map((r) => r.user.id) ?? [],
    });
    setResponsaveisSelecionados(tarefa?.responsaveis.map((r) => r.user.id) ?? []);
    setAnexos(tarefa?.anexos?.map((a) => ({ url: a.url, nome: a.nome, tamanho: a.tamanho, tipo: a.tipo })) ?? []);
  }, [tarefa, statusInicial, reset]);

  function toggleResponsavel(id: string) {
    setResponsaveisSelecionados((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function onSubmit(data: TarefaInput) {
    if (responsaveisSelecionados.length === 0) { toast.error("Selecione ao menos um responsável"); return; }
    setLoading(true);
    const payload = { ...data, responsaveis: responsaveisSelecionados, projetoId, anexos };

    const res = tarefa
      ? await fetch(`/api/tarefas/${tarefa.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/tarefas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    setLoading(false);
    if (res.ok) {
      toast.success(tarefa ? "Tarefa atualizada" : "Tarefa criada");
      onSaved();
      if (!tarefa) { onClose(); setAnexos([]); }
    } else {
      const err = await res.json();
      toast.error(err.error || "Erro ao salvar tarefa");
    }
  }

  async function enviarComentario() {
    if (!tarefa || !comentario.trim()) return;
    setEnviandoComentario(true);
    const res = await fetch(`/api/tarefas/${tarefa.id}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conteudo: comentario,
        anexoUrl: comentarioAnexo?.url ?? null,
        anexoNome: comentarioAnexo?.nome ?? null,
        anexoTipo: comentarioAnexo?.tipo ?? null,
      }),
    });
    setEnviandoComentario(false);
    if (res.ok) {
      const novo = await res.json();
      setTarefaAtual((prev) => prev ? { ...prev, comentarios: [...(prev.comentarios ?? []), novo] } : prev);
      setComentario("");
      setComentarioAnexo(null);
    }
  }

  async function adicionarSubtarefa() {
    if (!tarefa || !subtarefaTexto.trim()) return;
    const res = await fetch("/api/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: subtarefaTexto,
        status: "A_FAZER",
        prioridade: "MEDIA",
        responsaveis: responsaveisSelecionados.length ? responsaveisSelecionados : [usuarios[0]?.id],
        projetoId,
        parentId: tarefa.id,
      }),
    });
    if (res.ok) {
      const nova = await res.json();
      setTarefaAtual((prev) => prev ? { ...prev, subtarefas: [...(prev.subtarefas ?? []), nova] } : prev);
      setSubtarefaTexto("");
    }
  }

  async function excluirTarefa() {
    if (!tarefa) return;
    if (!confirm("Excluir esta tarefa?")) return;
    const res = await fetch(`/api/tarefas/${tarefa.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Tarefa excluída");
      onSaved();
      onClose();
    } else {
      const err = await res.json();
      toast.error(err.error || "Erro ao excluir");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={tarefa ? "Detalhes da tarefa" : "Nova tarefa"} size="lg">
      {tarefa && !podeEditar && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-4 text-sm text-amber-700">
          <Lock size={14} /> Apenas o criador desta tarefa pode editá-la
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Título *" placeholder="Descreva a tarefa..." error={errors.titulo?.message} disabled={!!tarefa && !podeEditar} {...register("titulo")} />
        <Textarea label="Descrição" placeholder="Detalhes sobre a tarefa..." disabled={!!tarefa && !podeEditar} {...register("descricao")} />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" options={STATUS_OPTIONS} disabled={!!tarefa && !podeEditar} {...register("status")} />
          <Select label="Prioridade" options={PRIORIDADE_OPTIONS} disabled={!!tarefa && !podeEditar} {...register("prioridade")} />
        </div>

        <Input label="Data de vencimento" type="date" disabled={!!tarefa && !podeEditar} {...register("dataVenc")} />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Responsáveis *</label>
          <div className="flex flex-wrap gap-2">
            {usuarios.map((u) => {
              const selecionado = responsaveisSelecionados.includes(u.id);
              return (
                <button key={u.id} type="button" onClick={() => (!tarefa || podeEditar) && toggleResponsavel(u.id)}
                  disabled={!!tarefa && !podeEditar}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm border transition-colors ${selecionado ? "border-[#1400FF] bg-[#1400FF]/5 text-[#1400FF]" : "border-gray-200 text-gray-700 hover:border-gray-300"} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Avatar nome={u.name} avatarUrl={u.avatarUrl} size="sm" />
                  {u.name}
                  {selecionado && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Anexos</label>
          {(!tarefa || podeEditar) ? (
            <FileUpload arquivos={anexos} onChange={setAnexos} maxArquivos={5} />
          ) : (
            <div className="space-y-1.5">
              {anexos.length === 0 && <p className="text-sm text-gray-400">Nenhum arquivo anexado</p>}
              {anexos.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 hover:border-[#1400FF] transition-colors">
                  {iconeArquivo(a.tipo)}
                  <span className="flex-1 text-sm text-gray-700 truncate">{a.nome}</span>
                  <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {(!tarefa || podeEditar) && (
          <div className="flex justify-between items-center pt-2">
            {tarefa && (
              <button type="button" onClick={excluirTarefa} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                <Trash2 size={14} /> Excluir
              </button>
            )}
            <Button type="submit" loading={loading} className="ml-auto">
              {tarefa ? "Salvar" : "Criar tarefa"}
            </Button>
          </div>
        )}
      </form>

      {tarefa && (
        <>
          {/* Subtarefas */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Subtarefas ({tarefaAtual?.subtarefas?.length ?? 0})</h4>
            <div className="space-y-2 mb-3">
              {tarefaAtual?.subtarefas?.map((st) => (
                <div key={st.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <Badge className={STATUS_CORES[st.status]}>{STATUS_LABELS[st.status]}</Badge>
                  <span className="text-sm text-gray-700 flex-1">{st.titulo}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={subtarefaTexto} onChange={(e) => setSubtarefaTexto(e.target.value)}
                placeholder="Nova subtarefa..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1400FF] focus:outline-none focus:ring-2 focus:ring-[#1400FF]/20"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarSubtarefa())}
              />
              <Button type="button" variant="secondary" size="sm" onClick={adicionarSubtarefa}><Plus size={14} /></Button>
            </div>
          </div>

          {/* Comentários */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Comentários ({tarefaAtual?.comentarios?.length ?? 0})</h4>
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
              {tarefaAtual?.comentarios?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar nome={c.user.name} avatarUrl={c.user.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-gray-900">{c.user.name}</span>
                      <span className="text-xs text-gray-400">{tempoRelativo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{c.conteudo}</p>
                    {c.anexoUrl && (
                      <a href={c.anexoUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-[#1400FF] hover:underline">
                        {iconeArquivo(c.anexoTipo ?? "")}
                        {c.anexoNome}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {comentarioAnexo && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                  {iconeArquivo(comentarioAnexo.tipo)}
                  <span className="flex-1 text-sm text-gray-700 truncate">{comentarioAnexo.nome}</span>
                  <button type="button" onClick={() => setComentarioAnexo(null)} className="text-gray-400 hover:text-red-500">
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input value={comentario} onChange={(e) => setComentario(e.target.value)}
                  placeholder="Adicionar comentário..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1400FF] focus:outline-none focus:ring-2 focus:ring-[#1400FF]/20"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), enviarComentario())}
                />
                <FileUpload
                  arquivos={comentarioAnexo ? [comentarioAnexo] : []}
                  onChange={(files) => setComentarioAnexo(files[0] ?? null)}
                  maxArquivos={1}
                  className="flex items-center"
                />
                <Button type="button" size="sm" loading={enviandoComentario} onClick={enviarComentario}>
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
