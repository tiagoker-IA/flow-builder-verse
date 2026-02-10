import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { saveAs } from "file-saver";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UsersTableProps {
  usuarios: User[];
}

export function UsersTable({ usuarios }: UsersTableProps) {
  const exportCSV = () => {
    const header = "Email,Data de Cadastro,Último Login\n";
    const rows = usuarios
      .map(
        (u) =>
          `${u.email},${new Date(u.created_at).toLocaleDateString("pt-BR")},${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "Nunca"}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `usuarios_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Usuários ({usuarios.length})</CardTitle>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Último Login</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  {u.last_sign_in_at
                    ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR")
                    : "Nunca"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
