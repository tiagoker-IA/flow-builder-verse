import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface CampaignFormProps {
  onCreated: () => void;
}

export function CampaignForm({ onCreated }: CampaignFormProps) {
  const [titulo, setTitulo] = useState("");
  const [assunto, setAssunto] = useState("");
  const [conteudoHtml, setConteudoHtml] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !assunto || !conteudoHtml) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("email_campaigns" as any).insert({
        titulo,
        assunto,
        conteudo_html: conteudoHtml,
        created_by: user?.id,
      } as any);

      if (error) throw error;

      toast({ title: "Campanha criada como rascunho" });
      setTitulo("");
      setAssunto("");
      setConteudoHtml("");
      onCreated();
    } catch (err: any) {
      toast({ title: "Erro ao criar campanha", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nova Campanha de Email</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título (interno)</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Promoção de Natal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto do email</Label>
            <Input id="assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex: 🎄 Novidades especiais para você!" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo HTML</Label>
            <Textarea
              id="conteudo"
              value={conteudoHtml}
              onChange={(e) => setConteudoHtml(e.target.value)}
              placeholder="<h1>Olá!</h1><p>Temos novidades...</p>"
              rows={8}
            />
          </div>
          <Button type="submit" disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar como rascunho"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
