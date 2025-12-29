import { ChatMode, MODOS_CHAT } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ModoSelectorProps {
  modo: ChatMode;
  onModoChange: (modo: ChatMode) => void;
}

export function ModoSelector({ modo, onModoChange }: ModoSelectorProps) {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      {MODOS_CHAT.map((m) => (
        <button
          key={m.value}
          onClick={() => onModoChange(m.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            modo === m.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={m.description}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
