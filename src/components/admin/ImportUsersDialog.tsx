import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

function generatePassword(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join('');
}

export function ImportUsersDialog({ open, onOpenChange, onCreated }: ImportUsersDialogProps) {
  const [users, setUsers] = useState<{ email: string; password: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return;

      const header = lines[0].toLowerCase().split(/[,;\t]/);
      const emailIdx = header.findIndex((h) => h.trim() === "email");
      const senhaIdx = header.findIndex((h) => ["senha", "password"].includes(h.trim()));

      const startIdx = emailIdx >= 0 ? 1 : 0;
      const colIdx = emailIdx >= 0 ? emailIdx : 0;

      const parsed: { email: string; password: string }[] = [];
      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/);
        const email = cols[colIdx]?.trim();
        if (!email || !email.includes("@")) continue;
        const password = senhaIdx >= 0 && cols[senhaIdx]?.trim() ? cols[senhaIdx].trim() : generatePassword();
        parsed.push({ email, password });
      }
      setUsers(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (users.length === 0) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-users", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { action: "bulk-create", users },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: `${res.data.created}/${res.data.total} usuários criados` });
      setUsers([]);
      if (fileRef.current) fileRef.current.value = "";
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setUsers([]); } onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Usuários (CSV)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            O CSV deve ter a coluna <strong>email</strong>. A coluna <strong>senha</strong> é opcional (senhas aleatórias serão geradas).
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Selecionar arquivo
            </Button>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          </div>
          {users.length > 0 && (
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-1">
              <p className="text-sm font-medium mb-2">{users.length} emails encontrados:</p>
              {users.map((u, i) => (
                <p key={i} className="text-sm text-muted-foreground truncate">{u.email}</p>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleImport} disabled={loading || users.length === 0}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Importar {users.length > 0 && `(${users.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
