import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

interface Campaign {
  id: string;
  titulo: string;
  assunto: string;
  status: string;
  total_destinatarios: number;
  enviados_count: number;
  created_at: string;
  sent_at: string | null;
}

interface CampaignListProps {
  campaigns: Campaign[];
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  rascunho: "outline",
  enviando: "default",
  enviada: "secondary",
  erro: "destructive",
};

export function CampaignList({ campaigns, onRefresh }: CampaignListProps) {
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSend = async (campaignId: string) => {
    setSendingId(campaignId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("send-campaign", {
        body: { campaignId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.error) throw res.error;

      const result = res.data;
      if (result.needsConfig) {
        toast({
          title: "Serviço de email não configurado",
          description: result.message,
          variant: "destructive",
        });
      } else if (result.success) {
        toast({
          title: "Campanha enviada!",
          description: `${result.enviados}/${result.total} emails enviados com sucesso.`,
        });
      } else if (result.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Campanhas ({campaigns.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhuma campanha criada</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Enviados</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium max-w-[150px] truncate">{c.titulo}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-muted-foreground">{c.assunto}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[c.status] as any || "outline"}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.enviados_count}/{c.total_destinatarios}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {c.status === "rascunho" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={sendingId === c.id}>
                            {sendingId === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Enviar campanha?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação enviará o email "{c.assunto}" para todos os usuários cadastrados. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSend(c.id)}>
                              Enviar para todos
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
