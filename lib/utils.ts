import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(data: Date | string | null): string {
  if (!data) return "—";
  return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
}

export function formatarDataHora(data: Date | string): string {
  return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function tempoRelativo(data: Date | string): string {
  return formatDistanceToNow(new Date(data), { addSuffix: true, locale: ptBR });
}

export function estaAtrasado(dataVenc: Date | string | null): boolean {
  if (!dataVenc) return false;
  const d = new Date(dataVenc);
  return isPast(d) && !isToday(d);
}

export function calcularProgresso(total: number, concluidas: number): number {
  if (total === 0) return 0;
  return Math.round((concluidas / total) * 100);
}

export function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function iniciais(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function corAleatoria(): string {
  const cores = [
    "#1400FF", "#10B981", "#F59E0B", "#EF4444",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  ];
  return cores[Math.floor(Math.random() * cores.length)];
}
