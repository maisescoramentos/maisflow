import { cn, iniciais } from "@/lib/utils";

interface AvatarProps {
  nome: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({ nome, avatarUrl, size = "md", className }: AvatarProps) {
  const sizes = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-11 w-11 text-base" };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={nome}
        className={cn("rounded-full object-cover flex-shrink-0", sizes[size], className)}
      />
    );
  }

  const hash = nome.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500",
    "bg-rose-500", "bg-amber-500", "bg-cyan-500",
  ];
  const color = colors[hash % colors.length];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        sizes[size], color, className
      )}
    >
      {iniciais(nome)}
    </div>
  );
}

interface AvatarGroupProps {
  users: { name: string; avatarUrl?: string | null }[];
  max?: number;
}

export function AvatarGroup({ users, max = 3 }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const resto = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          <Avatar nome={u.name} avatarUrl={u.avatarUrl} size="sm" />
        </div>
      ))}
      {resto > 0 && (
        <div className="ring-2 ring-white rounded-full h-7 w-7 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          +{resto}
        </div>
      )}
    </div>
  );
}
