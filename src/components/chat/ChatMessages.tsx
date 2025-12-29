import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Mensagem, ChatMode } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { QuickActions } from "./QuickActions";

interface ChatMessagesProps {
  mensagens: Mensagem[];
  isLoading?: boolean;
  onEnviarSugestao?: (mensagem: string) => void;
  modo?: ChatMode;
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

const markdownToHtml = (markdown: string): string => {
  let html = markdown
    // Headers - Title: 18pt bold, double spacing after
    .replace(/^### (.+)$/gm, '<h3 style="font-size: 16pt; font-weight: bold; margin-top: 24pt; margin-bottom: 24pt;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size: 16pt; font-weight: bold; margin-top: 24pt; margin-bottom: 24pt;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size: 18pt; font-weight: bold; margin-top: 0; margin-bottom: 24pt;">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.slice(3, -3).replace(/^\w+\n/, '');
      return `<pre style="font-size: 14pt; margin-top: 24pt; margin-bottom: 24pt;"><code>${code}</code></pre>`;
    })
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Lists - unordered
    .replace(/^- (.+)$/gm, '<li style="font-size: 14pt; margin-top: 12pt; margin-bottom: 12pt;">$1</li>')
    // Lists - ordered
    .replace(/^\d+\. (.+)$/gm, '<li style="font-size: 14pt; margin-top: 12pt; margin-bottom: 12pt;">$1</li>')
    // Line breaks - Body: 14pt with double spacing
    .replace(/\n\n/g, '</p><p style="font-size: 14pt; margin-top: 24pt; margin-bottom: 24pt;">')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already wrapped - Body: 14pt with double spacing
  if (!html.startsWith('<')) {
    html = `<p style="font-size: 14pt; margin-top: 24pt; margin-bottom: 24pt;">${html}</p>`;
  }
  
  return html;
};

const markdownToPlainText = (markdown: string): string => {
  return markdown
    // Remove headers markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    // Remove code blocks markers
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.slice(3, -3).replace(/^\w+\n/, '');
    })
    .replace(/`(.+?)`/g, '$1')
    // Clean list markers
    .replace(/^- /gm, '• ')
    .replace(/^\d+\. /gm, '');
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const htmlContent = markdownToHtml(text);
      const plainText = markdownToPlainText(text);
      
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const plainBlob = new Blob([plainText], { type: 'text/plain' });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': plainBlob
        })
      ]);
      
      setCopied(true);
      toast.success("Copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard.write
      const plainText = markdownToPlainText(text);
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      toast.success("Copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copiar
        </>
      )}
    </button>
  );
};

const SUGESTOES_POR_MODO: Record<ChatMode, string[]> = {
  mensagem: [
    "Já tenho um texto escolhido",
    "Me ajude a escolher um texto",
    "Preciso de uma mensagem para domingo",
  ],
  exegese: [
    "Exegese de Romanos 8",
    "Análise de João 1:1-14",
    "Estudo de Salmo 23",
  ],
  devocional: [
    "Devocional sobre fé",
    "Reflexão sobre Filipenses 4:13",
    "Meditação no Salmo 91",
  ],
  academico: [
    "O que é a Trindade?",
    "Doutrina da Eleição",
    "Cristologia reformada",
  ],
  livre: [
    "O que é graça?",
    "Como estudar a Bíblia?",
    "Quem foi João Calvino?",
  ],
};

export function ChatMessages({ mensagens, isLoading, onEnviarSugestao, modo = "livre" }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const sugestoes = SUGESTOES_POR_MODO[modo] || SUGESTOES_POR_MODO.livre;

  if (mensagens.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-elegant border border-primary/10">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-medium mb-4 text-foreground tracking-tight">
            Olá! Sou o LogosFlow
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            {modo === "mensagem" 
              ? "Vou ajudá-lo a preparar uma mensagem poderosa na tradição Reformada. Clique em uma sugestão ou digite sua pergunta."
              : "Seu assistente para estudos bíblicos e teológicos. Selecione um modo no topo e faça sua pergunta para começar."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2 px-4">
            {sugestoes.map((sugestao) => (
              <button 
                key={sugestao}
                onClick={() => onEnviarSugestao?.(sugestao)}
                className="px-4 py-2 bg-secondary/50 text-muted-foreground text-sm rounded-lg border border-border/50 whitespace-nowrap hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 cursor-pointer"
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin bg-background"
    >
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-5">
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed",
                mensagem.remetente_ia
                  ? "bg-chat-ai text-chat-ai-foreground rounded-tl-sm shadow-subtle border border-border/30"
                  : "bg-chat-user text-chat-user-foreground rounded-tr-sm shadow-elegant"
              )}
            >
              {mensagem.conteudo ? (
                mensagem.remetente_ia ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif prose-h1:text-lg prose-h1:font-bold prose-h1:mb-6 prose-h2:text-base prose-h2:font-bold prose-h2:my-6 prose-h3:text-base prose-h3:font-bold prose-h3:my-6 prose-p:text-sm prose-p:my-5 prose-ul:my-5 prose-ol:my-5 prose-li:my-2">
                    <ReactMarkdown>{mensagem.conteudo}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{mensagem.conteudo}</span>
                )
              ) : (
                <TypingIndicator />
              )}
              {mensagem.remetente_ia && mensagem.conteudo && (
                <>
                  <CopyButton text={mensagem.conteudo} />
                  {/* Show quick actions only on the last AI message and when not loading */}
                  {index === mensagens.length - 1 && !isLoading && onEnviarSugestao && (
                    <QuickActions onAction={onEnviarSugestao} />
                  )}
                </>
              )}
            </div>
            {!mensagem.remetente_ia && (
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/50">
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