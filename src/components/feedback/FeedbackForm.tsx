import { useState } from "react";
import { MessageSquare, Bug, Lightbulb, Heart, Star, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modoChat?: string;
  pagina?: string;
}

const tiposFeedback = [
  { value: "bug", label: "Bug", icon: Bug, color: "text-red-500" },
  { value: "sugestao", label: "Sugestão", icon: Lightbulb, color: "text-amber-500" },
  { value: "elogio", label: "Elogio", icon: Heart, color: "text-pink-500" },
  { value: "outro", label: "Outro", icon: MessageSquare, color: "text-blue-500" },
] as const;

export function FeedbackForm({ open, onOpenChange, modoChat, pagina }: FeedbackFormProps) {
  const [tipo, setTipo] = useState<string>("sugestao");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [notaGeral, setNotaGeral] = useState<number>(0);
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTipo("sugestao");
    setTitulo("");
    setDescricao("");
    setNotaGeral(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descricao.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a descrição do feedback.",
        variant: "destructive",
      });
      return;
    }

    setEnviando(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("feedbacks").insert({
        usuario_id: user?.id,
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        pagina,
        modo_chat: modoChat,
        nota_geral: notaGeral > 0 ? notaGeral : null,
      });

      if (error) throw error;

      toast({
        title: "Feedback enviado! 🎉",
        description: "Obrigado por ajudar a melhorar o LogosFlow.",
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Enviar Feedback</DialogTitle>
          <DialogDescription>
            Sua opinião é essencial para melhorar o LogosFlow.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo de Feedback */}
          <div className="space-y-2">
            <Label>Tipo de Feedback</Label>
            <div className="grid grid-cols-2 gap-2">
              {tiposFeedback.map((t) => {
                const Icon = t.icon;
                const isSelected = tipo === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : t.color}`} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Resumo breve do feedback"
              maxLength={100}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva com detalhes sua experiência, problema ou sugestão..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {descricao.length}/1000
            </p>
          </div>

          {/* Avaliação Geral */}
          <div className="space-y-2">
            <Label>Avaliação Geral (opcional)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((nota) => (
                <button
                  key={nota}
                  type="button"
                  onClick={() => setNotaGeral(nota === notaGeral ? 0 : nota)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      nota <= notaGeral
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40 hover:text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={enviando}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={enviando}
            >
              <Send className="w-4 h-4 mr-2" />
              {enviando ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
