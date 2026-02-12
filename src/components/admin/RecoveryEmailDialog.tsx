import { useState, useEffect } from "react";
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

interface RecoveryEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoveryEmailDialog({ open, onOpenChange }: RecoveryEmailDialogProps) {
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [currentRecovery, setCurrentRecovery] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRecoveryEmail();
    }
  }, [open]);

  const fetchRecoveryEmail = async () => {
    setFetching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-users", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { action: "get-recovery" },
      });
      if (res.data?.recoveryEmail) {
        setCurrentRecovery(res.data.recoveryEmail);
        setRecoveryEmail(res.data.recoveryEmail);
      }
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-users", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { action: "set-recovery", recoveryEmail },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Email de recuperação salvo", description: "Você poderá usar este email para recuperar acesso admin." });
      setCurrentRecovery(recoveryEmail);
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
          <DialogTitle>Email de Recuperação</DialogTitle>
          <DialogDescription>
            Cadastre um email alternativo para recuperar seu acesso admin caso perca a senha.
            {currentRecovery && (
              <span className="block mt-1">
                Atual: <strong>{currentRecovery}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        {fetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email de recuperação</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="recuperacao@email.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !recoveryEmail}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
