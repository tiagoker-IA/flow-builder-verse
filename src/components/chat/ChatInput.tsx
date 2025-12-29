import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onEnviar: (mensagem: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onEnviar, disabled }: ChatInputProps) {
  const [mensagem, setMensagem] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEnviar = () => {
    if (mensagem.trim() && !disabled) {
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
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-3xl mx-auto flex gap-3">
        <Textarea
          ref={textareaRef}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          className="min-h-[44px] max-h-[150px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleEnviar}
          disabled={disabled || !mensagem.trim()}
          size="icon"
          className="h-11 w-11 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
