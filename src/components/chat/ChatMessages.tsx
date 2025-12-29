import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Mensagem } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";

interface ChatMessagesProps {
  mensagens: Mensagem[];
  isLoading?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot-1" />
      <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot-2" />
      <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot-3" />
    </div>
  );
}

export function ChatMessages({ mensagens, isLoading }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  if (mensagens.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-semibold mb-3 text-foreground">
            Olá! Sou o LogosFlow
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Seu assistente para estudos bíblicos e teológicos. 
            Selecione um modo no topo e faça sua pergunta para começar.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Exegese de Romanos 8", "O que é graça?", "Estudo sobre fé"].map((sugestao) => (
              <span 
                key={sugestao}
                className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-full"
              >
                {sugestao}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin"
    >
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {mensagens.map((mensagem, index) => (
          <div
            key={mensagem.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              mensagem.remetente_ia ? "justify-start" : "justify-end"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {mensagem.remetente_ia && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                mensagem.remetente_ia
                  ? "bg-chat-ai text-chat-ai-foreground rounded-tl-md"
                  : "bg-chat-user text-chat-user-foreground rounded-tr-md"
              )}
            >
              {mensagem.conteudo ? (
                mensagem.remetente_ia ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <ReactMarkdown>{mensagem.conteudo}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{mensagem.conteudo}</span>
                )
              ) : (
                <TypingIndicator />
              )}
            </div>
            {!mensagem.remetente_ia && (
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}