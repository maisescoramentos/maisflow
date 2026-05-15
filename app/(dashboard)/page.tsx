import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderKanban, CheckSquare, AlertTriangle, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/queries/diario";
import { getProjetos } from "@/lib/queries/projetos";
import { getTarefasDoUsuario } from "@/lib/queries/tarefas";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import { AvatarGroup } from "@/components/ui/Avatar";
import { saudacao, formatarData, calcularProgresso, estaAtrasado } from "@/lib/utils";
import { STATUS_CORES, STATUS_LABELS, PRIORIDADE_CORES, PRIORIDADE_LABELS, PROJETO_STATUS_CORES, PROJETO_STATUS_LABELS } from "@/lib/constants";

function StatCard({ icon: Icon, label, value, cor }: {
  icon: React.ElementType; label: string; value: number; cor: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${cor}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [stats, projetos, tarefas] = await Promise.all([
    getDashboardStats(session.user.id),
    getProjetos(session.user.id),
    getTarefasDoUsuario(session.user.id),
  ]);

  const projetosAtivos = projetos.filter((p) => p.status === "ATIVO").slice(0, 4);
  const tarefasPendentes = tarefas.filter((t) => t.status !== "CONCLUIDO").slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {saudacao()}, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Aqui está o resumo de hoje</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderKanban} label="Projetos ativos" value={stats.projetosAtivos} cor="bg-[#1400FF]" />
        <StatCard icon={CheckSquare} label="Tarefas pendentes" value={stats.tarefasPendentes} cor="bg-amber-500" />
        <StatCard icon={TrendingUp} label="Concluídas" value={stats.tarefasConcluidas} cor="bg-emerald-500" />
        <StatCard icon={AlertTriangle} label="Atrasadas" value={stats.tarefasAtrasadas} cor="bg-red-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Projetos ativos</h2>
            <Link href="/projetos" className="text-sm text-[#1400FF] hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {projetosAtivos.length === 0 && (
              <Card className="p-6 text-center text-gray-500 text-sm">Nenhum projeto ativo</Card>
            )}
            {projetosAtivos.map((p) => {
              const tarefasP = (p as { tarefas?: { status: string }[] }).tarefas ?? [];
              const total = p._count?.tarefas ?? 0;
              return (
                <Link href={`/projetos/${p.id}`} key={p.id}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: p.cor }}>
                        {p.nome[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{p.nome}</p>
                        {p.clienteNome && <p className="text-xs text-gray-500">{p.clienteNome}</p>}
                      </div>
                      <Badge className={PROJETO_STATUS_CORES[p.status]}>{PROJETO_STATUS_LABELS[p.status]}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Progress value={total > 0 ? 0 : 0} className="flex-1" showLabel />
                      <AvatarGroup users={p.membros.map((m) => m.user)} max={3} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Minhas tarefas pendentes</h2>
            <Link href="/tarefas" className="text-sm text-[#1400FF] hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-2">
            {tarefasPendentes.length === 0 && (
              <Card className="p-6 text-center text-gray-500 text-sm">Nenhuma tarefa pendente 🎉</Card>
            )}
            {tarefasPendentes.map((t) => {
              const atrasado = estaAtrasado(t.dataVenc);
              return (
                <Card key={t.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.titulo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {t.projeto && (
                          <span className="text-xs text-gray-500">{t.projeto.nome}</span>
                        )}
                        {t.dataVenc && (
                          <span className={`text-xs ${atrasado ? "text-red-500 font-medium" : "text-gray-400"}`}>
                            {atrasado ? "Atrasado · " : ""}{formatarData(t.dataVenc)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge className={PRIORIDADE_CORES[t.prioridade]}>{PRIORIDADE_LABELS[t.prioridade]}</Badge>
                      <Badge className={STATUS_CORES[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
