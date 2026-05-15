import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import { PROJETO_STATUS_LABELS, PROJETO_STATUS_CORES, STATUS_LABELS, PRIORIDADE_LABELS, PRIORIDADE_CORES } from "@/lib/constants";
import { formatarData, calcularProgresso } from "@/lib/utils";
import { Calendar, Users, CheckCircle2 } from "lucide-react";

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const projeto = await prisma.projeto.findFirst({
    where: { portalToken: token, portalAtivo: true },
    include: {
      membros: {
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
      tarefas: {
        where: { parentId: null },
        include: {
          responsaveis: { include: { user: { select: { name: true } } } },
        },
        orderBy: [{ status: "asc" }, { ordem: "asc" }],
      },
    },
  });

  if (!projeto) notFound();

  const total = projeto.tarefas.length;
  const concluidas = projeto.tarefas.filter((t) => t.status === "CONCLUIDO").length;
  const progresso = calcularProgresso(total, concluidas);

  const tarefasPorStatus = {
    EM_ANDAMENTO: projeto.tarefas.filter((t) => t.status === "EM_ANDAMENTO"),
    CONCLUIDO: projeto.tarefas.filter((t) => t.status === "CONCLUIDO"),
    outras: projeto.tarefas.filter((t) => !["EM_ANDAMENTO", "CONCLUIDO"].includes(t.status)),
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: projeto.cor }}>
            M
          </div>
          <span className="font-bold text-gray-900">Mais Escoramentos</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: projeto.cor }}>
                {projeto.nome[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{projeto.nome}</h1>
                {projeto.clienteNome && <p className="text-gray-500">{projeto.clienteNome}</p>}
              </div>
            </div>
            <Badge className={PROJETO_STATUS_CORES[projeto.status]}>
              {PROJETO_STATUS_LABELS[projeto.status]}
            </Badge>
          </div>

          {projeto.descricao && (
            <p className="text-gray-600 text-sm mb-4">{projeto.descricao}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
            {projeto.dataInicio && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Início: {formatarData(projeto.dataInicio)}
              </span>
            )}
            {projeto.dataFim && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Previsão: {formatarData(projeto.dataFim)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {projeto.membros.length} profissionais
            </span>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progresso geral</span>
              <span className="font-semibold text-gray-900">{progresso}%</span>
            </div>
            <Progress value={progresso} />
            <p className="text-xs text-gray-500 mt-1">{concluidas} de {total} tarefas concluídas</p>
          </div>
        </div>

        {tarefasPorStatus.EM_ANDAMENTO.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Em andamento</h2>
            <div className="space-y-2">
              {tarefasPorStatus.EM_ANDAMENTO.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-yellow-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">{t.titulo}</p>
                    <Badge className={PRIORIDADE_CORES[t.prioridade]}>{PRIORIDADE_LABELS[t.prioridade]}</Badge>
                  </div>
                  {t.responsaveis.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Responsável: {t.responsaveis.map((r) => r.user.name).join(", ")}
                    </p>
                  )}
                  {t.dataVenc && (
                    <p className="text-xs text-gray-400 mt-0.5">Prazo: {formatarData(t.dataVenc)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tarefasPorStatus.outras.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Próximas etapas</h2>
            <div className="space-y-2">
              {tarefasPorStatus.outras.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700">{t.titulo}</p>
                    <Badge className="bg-gray-100 text-gray-500">{STATUS_LABELS[t.status]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tarefasPorStatus.CONCLUIDO.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                Etapas concluídas ({concluidas})
              </span>
            </h2>
            <div className="space-y-2">
              {tarefasPorStatus.CONCLUIDO.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-green-100 p-4 opacity-75">
                  <p className="text-sm text-gray-500 line-through">{t.titulo}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        Mais Escoramentos © {new Date().getFullYear()} · Informações confidenciais
      </footer>
    </div>
  );
}
