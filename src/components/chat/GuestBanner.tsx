import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { useState } from "react";

interface GuestBannerProps {
  conversasCount: number;
  maxConversas: number;
}

export function GuestBanner({ conversasCount, maxConversas }: GuestBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
        <UserPlus className="w-4 h-4 text-primary shrink-0" />
        <span className="truncate">
          <strong>Modo visitante</strong> — {conversasCount}/{maxConversas} conversas.{" "}
          <span className="hidden sm:inline">Crie sua conta para acesso completo.</span>
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => navigate("/auth")}
          className="h-8 text-xs font-medium"
        >
          Criar Conta
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-primary/10 text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
