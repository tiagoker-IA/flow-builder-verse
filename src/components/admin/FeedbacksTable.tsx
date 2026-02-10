import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Feedback {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  nota_geral: number | null;
  modo_chat: string | null;
  pagina: string | null;
  created_at: string;
}

interface FeedbacksTableProps {
  feedbacks: Feedback[];
}

const TIPO_COLORS: Record<string, string> = {
  bug: "destructive",
  sugestao: "default",
  elogio: "secondary",
  outro: "outline",
};

export function FeedbacksTable({ feedbacks }: FeedbacksTableProps) {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const filtered = filtroTipo === "todos" ? feedbacks : feedbacks.filter((f) => f.tipo === filtroTipo);
  const tipos = [...new Set(feedbacks.map((f) => f.tipo))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Feedbacks ({filtered.length})</CardTitle>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filtrar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {tipos.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhum feedback encontrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Badge variant={TIPO_COLORS[f.tipo] as any || "outline"}>{f.tipo}</Badge>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{f.titulo}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[300px] truncate text-muted-foreground">
                    {f.descricao}
                  </TableCell>
                  <TableCell>{f.nota_geral ?? "—"}</TableCell>
                  <TableCell>{new Date(f.created_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
