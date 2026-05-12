import { PrismaClient, Role, ProjetoStatus, TarefaStatus, Prioridade } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const memberPassword = await bcrypt.hash("member123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@maisescoramentos.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@maisescoramentos.com.br",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const membro1 = await prisma.user.upsert({
    where: { email: "joao@maisescoramentos.com.br" },
    update: {},
    create: {
      name: "João Silva",
      email: "joao@maisescoramentos.com.br",
      password: memberPassword,
      role: Role.MEMBER,
    },
  });

  const membro2 = await prisma.user.upsert({
    where: { email: "maria@maisescoramentos.com.br" },
    update: {},
    create: {
      name: "Maria Santos",
      email: "maria@maisescoramentos.com.br",
      password: memberPassword,
      role: Role.MEMBER,
    },
  });

  const projeto1 = await prisma.projeto.create({
    data: {
      nome: "Escoramento Torre Norte",
      descricao: "Projeto de escoramento para a construção da Torre Norte no centro comercial.",
      clienteNome: "Construtora ABC",
      clienteEmail: "contato@construtoraabc.com.br",
      status: ProjetoStatus.ATIVO,
      cor: "#1400FF",
      portalToken: "token-torre-norte-2024",
      portalAtivo: true,
      dataInicio: new Date("2024-01-15"),
      dataFim: new Date("2024-06-30"),
      membros: {
        create: [
          { userId: admin.id, isOwner: true },
          { userId: membro1.id },
          { userId: membro2.id },
        ],
      },
    },
  });

  const projeto2 = await prisma.projeto.create({
    data: {
      nome: "Reforço Estrutural Galpão Industrial",
      descricao: "Reforço e escoramento do galpão industrial para ampliação.",
      clienteNome: "Indústrias XYZ",
      status: ProjetoStatus.ATIVO,
      cor: "#10B981",
      portalToken: "token-galpao-xyz-2024",
      portalAtivo: false,
      dataInicio: new Date("2024-02-01"),
      dataFim: new Date("2024-08-15"),
      membros: {
        create: [
          { userId: admin.id, isOwner: true },
          { userId: membro1.id },
        ],
      },
    },
  });

  const tarefas1 = await Promise.all([
    prisma.tarefa.create({
      data: {
        titulo: "Levantamento topográfico",
        descricao: "Realizar medições e levantamento do terreno.",
        status: TarefaStatus.CONCLUIDO,
        prioridade: Prioridade.ALTA,
        ordem: 1,
        projetoId: projeto1.id,
        dataVenc: new Date("2024-01-20"),
        responsaveis: { create: [{ userId: membro1.id }] },
      },
    }),
    prisma.tarefa.create({
      data: {
        titulo: "Projeto estrutural",
        descricao: "Elaborar projeto estrutural com cálculo de cargas.",
        status: TarefaStatus.CONCLUIDO,
        prioridade: Prioridade.ALTA,
        ordem: 2,
        projetoId: projeto1.id,
        dataVenc: new Date("2024-02-10"),
        responsaveis: { create: [{ userId: admin.id }, { userId: membro2.id }] },
      },
    }),
    prisma.tarefa.create({
      data: {
        titulo: "Instalação dos escoramentos",
        descricao: "Montagem e instalação dos equipamentos de escoramento.",
        status: TarefaStatus.EM_ANDAMENTO,
        prioridade: Prioridade.URGENTE,
        ordem: 1,
        projetoId: projeto1.id,
        dataVenc: new Date("2024-03-15"),
        responsaveis: { create: [{ userId: membro1.id }, { userId: membro2.id }] },
      },
    }),
    prisma.tarefa.create({
      data: {
        titulo: "Inspeção de segurança",
        descricao: "Verificação de todos os pontos críticos de segurança.",
        status: TarefaStatus.A_FAZER,
        prioridade: Prioridade.ALTA,
        ordem: 1,
        projetoId: projeto1.id,
        dataVenc: new Date("2024-03-25"),
        responsaveis: { create: [{ userId: admin.id }] },
      },
    }),
    prisma.tarefa.create({
      data: {
        titulo: "Relatório final",
        descricao: "Elaboração do relatório técnico final da obra.",
        status: TarefaStatus.BACKLOG,
        prioridade: Prioridade.MEDIA,
        ordem: 1,
        projetoId: projeto1.id,
        dataVenc: new Date("2024-06-25"),
        responsaveis: { create: [{ userId: membro2.id }] },
      },
    }),
  ]);

  await Promise.all([
    prisma.tarefa.create({
      data: {
        titulo: "Análise estrutural do galpão",
        status: TarefaStatus.CONCLUIDO,
        prioridade: Prioridade.ALTA,
        ordem: 1,
        projetoId: projeto2.id,
        dataVenc: new Date("2024-02-10"),
        responsaveis: { create: [{ userId: membro1.id }] },
      },
    }),
    prisma.tarefa.create({
      data: {
        titulo: "Reforço das fundações",
        status: TarefaStatus.EM_ANDAMENTO,
        prioridade: Prioridade.URGENTE,
        ordem: 1,
        projetoId: projeto2.id,
        dataVenc: new Date("2024-04-01"),
        responsaveis: { create: [{ userId: admin.id }, { userId: membro1.id }] },
      },
    }),
    prisma.tarefa.create({
      data: {
        titulo: "Instalação vigas metálicas",
        status: TarefaStatus.A_FAZER,
        prioridade: Prioridade.ALTA,
        ordem: 1,
        projetoId: projeto2.id,
        dataVenc: new Date("2024-05-15"),
        responsaveis: { create: [{ userId: membro1.id }] },
      },
    }),
  ]);

  await prisma.comentario.create({
    data: {
      conteudo: "Levantamento concluído conforme cronograma. Dados enviados para o engenheiro.",
      tarefaId: tarefas1[0].id,
      userId: membro1.id,
    },
  });

  await prisma.entradaDiario.create({
    data: {
      titulo: "Início das instalações - Torre Norte",
      conteudo: "Iniciamos as instalações dos escoramentos no 3º andar. Equipe de 8 pessoas.",
      clima: "Ensolarado",
      workers: 8,
      fotos: [],
      projetoId: projeto1.id,
      userId: admin.id,
    },
  });

  await prisma.notificacao.create({
    data: {
      titulo: "Tarefa atribuída",
      mensagem: "Você foi adicionado como responsável em \"Instalação dos escoramentos\"",
      link: `/projetos/${projeto1.id}`,
      userId: membro1.id,
    },
  });

  console.log("✅ Seed concluído!");
  console.log(`👤 Admin: admin@maisescoramentos.com.br / admin123`);
  console.log(`👤 Membro: joao@maisescoramentos.com.br / member123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
