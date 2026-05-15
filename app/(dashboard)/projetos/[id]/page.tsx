"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Settings, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import KanbanBoard from "@/components/projetos/KanbanBoard";
import TarefaModal from "@/components/tarefas/TarefaModal";
import Modal from "@/components/ui/Modal";
import ProjetoForm from "@/components/projetos/ProjetoForm";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { AvatarGroup } from "@/components/ui/Avatar";
import { PROJETO_STATUS_LABELS, PROJETO_STATUS_CORES } from "@/lib/constants";
import type { TarefaComDetalhes, TarefaStatus, UserBasico } from "@/types";
import type { ProjetoInput } from "@/lib/validations/projeto";

interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  clienteNome: string | null;
  clienteEmail: string | null;
  status: string;
  cor: string;
  portalToken: string | null;
  portalAtivo: boolean;
  dataInicio: string | null;
  dataFim: string | null;
  createdAt: string;
  updatedAt: string;
  membros: { userId: string; isOwner: boolean; user: UserBasico }[];
  tarefas: TarefaComDetalhes[];
}

export default function ProjetoKanbanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UserBasico[]>([]);
  const [tarefaModal, setTarefaModal] = useState<{ open: boolean; tarefa: TarefaComDetalhes | null; status?: TarefaStatus }>({
    open: false, tarefa: null,
  });
  const [configModal, setConfigModal] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const [pRes, uRes] = await Promise.all([
      fetch(`/api/projetos/${id}`),
      fetch("/api/usuarios"),
    ]);
    if (pRes.ok) setProjeto(await pRes.json());
    if (uRes.ok) setUsuarios(await uRes.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvarProjeto(data: ProjetoInput) {
    setSalvando(true);
    const res = await fetch(`/api/projetos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSalvando(false);
    if (res.ok) {
      toast.success("Projeto atualizado");
      setConfigModal(false);
      carregar();
    } else {
      toast.error("Erro ao salvar");
    }
  }

  async function togglePortal() {
    const res = await fetch(`/api/projetos/${id}/portal`, { method: "PATCH" });
    if (res.ok) {
      const { portalAtivo } = await res.json();
      setProjeto((prev) => prev ? { ...prev, portalAtivo } : prev);
      toast.success(portalAtivo ? "Portal ativado" : "Portal desativado");
    }
  }

  function copiarLink() {
    if (!projeto?.portalToken) return;
    const url = `${window.location.origin}/portal/${projeto.portalToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-96 w-72" />)}
        </div>
      </div>
    );
  }

  if (!projeto) return <div className="text-center py-20 text-gray-500">Projeto não encontrado</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/projetos")} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <ArrowLeft size={18} />
          </button>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: projeto.cor }}>
            {projeto.nome[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{projeto.nome}</h1>
              <Badge className={PROJETO_STATUS_CORES[projeto.status as keyof typeof PROJETO_STATUS_CORES]}>
                {PROJETO_STATUS_LABELS[projeto.status as keyof typeof PROJETO_STATUS_LABELS]}
              </Badge>
            </div>
            {projeto.clienteNome && <p className="text-sm text-gray-500">{projeto.clienteNome}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AvatarGroup users={projeto.membros.map((m) => m.user)} max={5} />
          {projeto.portalToken && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePortal}
                className={projeto.portalAtivo ? "text-green-600 border-green-300" : ""}
              >
                <ExternalLink size={14} />
                Portal {projeto.portalAtivo ? "ativo" : "inativo"}
              </Button>
              {projeto.portalAtivo && (
                <Button variant="ghost" size="sm" onClick={copiarLink}>
                  <Copy size={14} />
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => setConfigModal(true)}>
            <Settings size={14} /> Configurar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          tarefasIniciais={projeto.tarefas}
          onTarefaClick={(t) => setTarefaModal({ open: true, tarefa: t })}
          onAddTarefa={(status) => setTarefaModal({ open: true, tarefa: null, status })}
        />
      </div>

      <TarefaModal
        open={tarefaModal.open}
        onClose={() => setTarefaModal({ open: false, tarefa: null })}
        tarefa={tarefaModal.tarefa}
        projetoId={id}
        statusInicial={tarefaModal.status}
        usuarios={usuarios}
        onSaved={carregar}
      />

      <Modal open={configModal} onClose={() => setConfigModal(false)} title="Configurações do projeto">
        <ProjetoForm
          projeto={projeto as never}
          onSubmit={salvarProjeto}
          loading={salvando}
        />
      </Modal>
    </div>
  );
}
