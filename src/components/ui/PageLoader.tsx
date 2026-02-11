import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  );
}
