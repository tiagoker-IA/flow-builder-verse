import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onEnviar: (mensagem: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onEnviar, disabled, isLoading }: ChatInputProps) {
  const [mensagem, setMensagem] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEnviar = () => {
    if (mensagem.trim() && !disabled && !isLoading) {
      onEnviar(mensagem);
      setMensagem("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [mensagem]);

  return (
    <div className="border-t border-border bg-background p-4 sm:p-5">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta teológica..."
              disabled={disabled || isLoading}
              className={cn(
                "min-h-[48px] sm:min-h-[56px] max-h-[150px] resize-none pr-4 rounded-xl text-[15px]",
                "border-border bg-secondary/30 focus:bg-background",
                "transition-all duration-200 shadow-subtle",
                "placeholder:text-muted-foreground/60"
              )}
              rows={1}
            />
          </div>
          <Button
            onClick={handleEnviar}
            disabled={disabled || isLoading || !mensagem.trim()}
            size="icon"
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl min-h-[48px] min-w-[48px]",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "transition-all duration-200 shadow-elegant"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/60 text-center mt-3 hidden sm:block">
          Pressione Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}