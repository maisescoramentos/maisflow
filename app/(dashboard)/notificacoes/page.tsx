"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { tempoRelativo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(false);

  async function carregar() {
    const res = await fetch("/api/notificacoes");
    if (res.ok) setNotificacoes(await res.json());
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function lerUma(id: string) {
    await fetch(`/api/notificacoes/${id}/ler`, { method: "PATCH" });
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  }

  async function lerTodas() {
    setMarcando(true);
    await fetch("/api/notificacoes/ler-todas", { method: "PATCH" });
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    setMarcando(false);
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="max-w-2xl">
      <Header titulo="Notificações" subtitulo={naoLidas > 0 ? `${naoLidas} não lida${naoLidas !== 1 ? "s" : ""}` : "Tudo em dia"}>
        {naoLidas > 0 && (
          <Button variant="outline" size="sm" loading={marcando} onClick={lerTodas}>
            <CheckCheck size={14} /> Marcar todas como lidas
          </Button>
        )}
      </Header>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : notificacoes.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificacoes.map((n) => (
            <Card
              key={n.id}
              className={cn("p-4 cursor-pointer transition-all", !n.lida && "border-[#1400FF]/30 bg-[#1400FF]/2")}
              onClick={() => !n.lida && lerUma(n.id)}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-2 w-2 rounded-full mt-2 flex-shrink-0", n.lida ? "bg-gray-300" : "bg-[#1400FF]")} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium text-gray-900", !n.lida && "font-semibold")}>{n.titulo}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.mensagem}</p>
                  <p className="text-xs text-gray-400 mt-1">{tempoRelativo(n.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
