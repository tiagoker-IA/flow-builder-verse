import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

export function ChangeEmailDialog({ open, onOpenChange, currentEmail }: ChangeEmailDialogProps) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === currentEmail) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-users", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { action: "update-email", newEmail },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Email atualizado", description: `Seu email foi alterado para ${newEmail}.` });
      setNewEmail("");
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Email</DialogTitle>
          <DialogDescription>
            Email atual: <strong>{currentEmail}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">Novo email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="novo@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !newEmail}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
