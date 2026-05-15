"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProjetoCard from "@/components/projetos/ProjetoCard";
import ProjetoForm from "@/components/projetos/ProjetoForm";
import Skeleton from "@/components/ui/Skeleton";
import type { ProjetoInput } from "@/lib/validations/projeto";
import type { ProjetoComMembros } from "@/types";

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<ProjetoComMembros[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const res = await fetch("/api/projetos");
    if (res.ok) setProjetos(await res.json());
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function criarProjeto(data: ProjetoInput) {
    setSalvando(true);
    const res = await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSalvando(false);
    if (res.ok) {
      toast.success("Projeto criado com sucesso!");
      setModalOpen(false);
      carregar();
    } else {
      toast.error("Erro ao criar projeto");
    }
  }

  return (
    <div>
      <Header titulo="Projetos" subtitulo={`${projetos.length} projeto${projetos.length !== 1 ? "s" : ""}`}>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Novo projeto
        </Button>
      </Header>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : projetos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">Nenhum projeto ainda</p>
          <p className="text-gray-400 text-sm mb-6">Crie seu primeiro projeto para começar</p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Criar primeiro projeto
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.map((p) => <ProjetoCard key={p.id} projeto={p} />)}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo projeto">
        <ProjetoForm onSubmit={criarProjeto} loading={salvando} />
      </Modal>
    </div>
  );
}
