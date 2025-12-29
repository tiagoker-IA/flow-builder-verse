import { ChatMode, MODOS_CHAT } from "@/types/chat";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModoSelectorProps {
  modo: ChatMode;
  onModoChange: (modo: ChatMode) => void;
}

export function ModoSelector({ modo, onModoChange }: ModoSelectorProps) {
  const modoAtual = MODOS_CHAT.find(m => m.value === modo);
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 p-1.5 bg-secondary/50 rounded-xl border border-border/50">
        {MODOS_CHAT.map((m) => {
          const Icon = m.icon;
          const isActive = modo === m.value;
          
          return (
            <Tooltip key={m.value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModoChange(m.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-background text-foreground shadow-subtle border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive && m.color)} />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}