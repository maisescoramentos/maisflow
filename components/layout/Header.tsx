import { cn } from "@/lib/utils";

interface HeaderProps {
  titulo: string;
  subtitulo?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Header({ titulo, subtitulo, children, className }: HeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
        {subtitulo && <p className="text-sm text-gray-500 mt-0.5">{subtitulo}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  );
}
