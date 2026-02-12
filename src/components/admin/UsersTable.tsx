import { useState } from "react";
import { Download, Plus, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { saveAs } from "file-saver";
import { AddUserDialog } from "./AddUserDialog";
import { ImportUsersDialog } from "./ImportUsersDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { AdminRoleToggle } from "./AdminRoleToggle";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin?: boolean;
}

interface UsersTableProps {
  usuarios: User[];
  onRefresh?: () => void;
}

export function UsersTable({ usuarios, onRefresh }: UsersTableProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<{ id: string; email: string } | null>(null);

  const exportCSV = () => {
    const header = "Email,Role,Data de Cadastro,Último Login\n";
    const rows = usuarios
      .map(
        (u) =>
          `${u.email},${u.is_admin ? "Admin" : "Usuário"},${new Date(u.created_at).toLocaleDateString("pt-BR")},${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "Nunca"}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `usuarios_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleRefresh = () => onRefresh?.();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">Usuários ({usuarios.length})</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <AdminRoleToggle
                      userId={u.id}
                      email={u.email}
                      isAdmin={!!u.is_admin}
                      onToggled={handleRefresh}
                    />
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR")
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setDeleteUser({ id: u.id, email: u.email }); setDeleteOpen(true); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} onCreated={handleRefresh} />
      <ImportUsersDialog open={importOpen} onOpenChange={setImportOpen} onCreated={handleRefresh} />
      <DeleteUserDialog open={deleteOpen} onOpenChange={setDeleteOpen} user={deleteUser} onDeleted={handleRefresh} />
    </>
  );
}
