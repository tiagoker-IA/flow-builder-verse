import { Sparkles, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModoSelector } from "./ModoSelector";
import { ChatMode, MODOS_CHAT } from "@/types/chat";

interface ChatHeaderProps {
  titulo: string;
  modo: ChatMode;
  onModoChange: (modo: ChatMode) => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
}

export function ChatHeader({ 
  titulo, 
  modo, 
  onModoChange, 
  onLogout,
  onToggleSidebar,
  showMenuButton 
}: ChatHeaderProps) {
  const modoAtual = MODOS_CHAT.find(m => m.value === modo);
  
  return (
    <div className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-gold-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-lg leading-tight">
            {titulo || "LogosFlow"}
          </h1>
          {modoAtual && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <modoAtual.icon className="w-3 h-3" />
              Modo {modoAtual.label}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <ModoSelector modo={modo} onModoChange={onModoChange} />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLogout} 
          title="Sair"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}