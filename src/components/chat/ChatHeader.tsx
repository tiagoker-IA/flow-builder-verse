import { BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModoSelector } from "./ModoSelector";
import { ChatMode } from "@/types/chat";

interface ChatHeaderProps {
  titulo: string;
  modo: ChatMode;
  onModoChange: (modo: ChatMode) => void;
  onLogout: () => void;
}

export function ChatHeader({ titulo, modo, onModoChange, onLogout }: ChatHeaderProps) {
  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-sm">{titulo || "LogosFlow"}</h1>
          <p className="text-xs text-muted-foreground">Assistente Teológico</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ModoSelector modo={modo} onModoChange={onModoChange} />
        <Button variant="ghost" size="icon" onClick={onLogout} title="Sair">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
