import { useState } from "react";
import { Shield, ShieldOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminRoleToggleProps {
  userId: string;
  email: string;
  isAdmin: boolean;
  onToggled: () => void;
}

export function AdminRoleToggle({ userId, email, isAdmin, onToggled }: AdminRoleToggleProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const action = isAdmin ? "revoke-admin" : "grant-admin";
      const res = await supabase.functions.invoke("admin-users", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { action, targetUserId: userId },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast({
        title: isAdmin ? "Admin removido" : "Admin adicionado",
        description: `${email} agora é ${isAdmin ? "usuário comum" : "administrador"}.`,
      });
      onToggled();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
          {isAdmin ? "Admin" : "Usuário"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={loading}
          onClick={() => setConfirmOpen(true)}
          title={isAdmin ? "Remover admin" : "Promover a admin"}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isAdmin ? (
            <ShieldOff className="w-3.5 h-3.5 text-destructive" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-primary" />
          )}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAdmin ? "Remover administrador?" : "Promover a administrador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin
                ? `Deseja remover o acesso admin de ${email}? Essa pessoa perderá acesso ao painel administrativo.`
                : `Deseja promover ${email} a administrador? Essa pessoa terá acesso total ao painel administrativo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
