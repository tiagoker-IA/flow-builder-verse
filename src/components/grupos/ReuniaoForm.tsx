import { useState } from "react";
import { ReuniaoCompleta, ModoVisualizacao, MembroGrupo, Encontro, Exaltacao, Edificacao, Envio, MusicaExaltacao, PerguntaEdificacao, StatusReuniao, TipoPergunta } from "@/types/grupos";
import { EncontroSection } from "./EncontroSection";
import { ExaltacaoSection } from "./ExaltacaoSection";
import { EdificacaoSection } from "./EdificacaoSection";
import { EnvioSection } from "./EnvioSection";
import { ReuniaoProgressBar } from "./ReuniaoProgressBar";
import { Handshake, Music, BookOpen, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReuniaoFormProps {
  reuniao: ReuniaoCompleta;
  modo: ModoVisualizacao;
  membros: MembroGrupo[];
  onSalvarEncontro: (id: string, dados: Partial<Encontro>) => Promise<void>;
  onSalvarExaltacao: (id: string, dados: Partial<Exaltacao>) => Promise<void>;
  onSalvarEdificacao: (id: string, dados: Partial<Edificacao>) => Promise<void>;
  onSalvarEnvio: (id: string, dados: Partial<Envio>) => Promise<void>;
  onAdicionarMusica: (exaltacaoId: string, musica: { titulo: string; artista?: string; link_video?: string }) => Promise<MusicaExaltacao | null>;
  onRemoverMusica: (id: string) => Promise<void>;
  onToggleMusicaExecutada: (id: string, executada: boolean) => Promise<void>;
  onAdicionarPergunta: (edificacaoId: string, pergunta: { texto_pergunta: string; tipo?: TipoPergunta; ordem?: number }) => Promise<PerguntaEdificacao | null>;
  onRemoverPergunta: (id: string) => Promise<void>;
  onAtualizarStatus: (status: StatusReuniao) => Promise<void>;
  onRefresh: () => void;
}

const SECOES = [
  { id: "encontro", label: "Encontro", icon: Handshake, color: "text-amber-600 dark:text-amber-400" },
  { id: "exaltacao", label: "Exaltação", icon: Music, color: "text-rose-600 dark:text-rose-400" },
  { id: "edificacao", label: "Edificação", icon: BookOpen, color: "text-blue-600 dark:text-blue-400" },
  { id: "envio", label: "Envio", icon: Rocket, color: "text-emerald-600 dark:text-emerald-400" },
] as const;

export function ReuniaoForm({ reuniao, modo, membros, onSalvarEncontro, onSalvarExaltacao, onSalvarEdificacao, onSalvarEnvio, onAdicionarMusica, onRemoverMusica, onToggleMusicaExecutada, onAdicionarPergunta, onRemoverPergunta, onAtualizarStatus, onRefresh }: ReuniaoFormProps) {
  const [secaoAtiva, setSecaoAtiva] = useState<string>("encontro");
  const isReadOnly = modo === "revisao";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-serif font-medium tracking-tight">
          {reuniao.tema_geral || "Reunião"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(reuniao.data_reuniao), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </p>
        {modo === "conducao" && reuniao.status !== "concluida" && (
          <div className="flex justify-center gap-2 mt-3">
            {reuniao.status === "planejada" && (
              <Button size="sm" onClick={() => onAtualizarStatus("em_andamento")} className="gap-1">
                Iniciar Reunião
              </Button>
            )}
            {reuniao.status === "em_andamento" && (
              <Button size="sm" onClick={() => onAtualizarStatus("concluida")} variant="outline" className="gap-1">
                Finalizar Reunião
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <ReuniaoProgressBar secaoAtiva={secaoAtiva} secoes={SECOES} />

      {/* Section tabs - large touch targets for mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SECOES.map((secao) => {
          const Icon = secao.icon;
          const isActive = secaoAtiva === secao.id;
          return (
            <button
              key={secao.id}
              onClick={() => setSecaoAtiva(secao.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[48px]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border/50"
              )}
            >
              <Icon className={cn("w-5 h-5", !isActive && secao.color)} />
              {secao.label}
            </button>
          );
        })}
      </div>

      {/* Section content */}
      <div className="min-h-[300px]">
        {secaoAtiva === "encontro" && reuniao.encontro && (
          <EncontroSection
            encontro={reuniao.encontro}
            readOnly={isReadOnly}
            onSave={(dados) => onSalvarEncontro(reuniao.encontro!.id, dados)}
          />
        )}
        {secaoAtiva === "exaltacao" && reuniao.exaltacao && (
          <ExaltacaoSection
            exaltacao={reuniao.exaltacao}
            readOnly={isReadOnly}
            onSave={(dados) => onSalvarExaltacao(reuniao.exaltacao!.id, dados)}
            onAdicionarMusica={(musica) => onAdicionarMusica(reuniao.exaltacao!.id, musica)}
            onRemoverMusica={onRemoverMusica}
            onToggleExecutada={onToggleMusicaExecutada}
            onRefresh={onRefresh}
          />
        )}
        {secaoAtiva === "edificacao" && reuniao.edificacao && (
          <EdificacaoSection
            edificacao={reuniao.edificacao}
            readOnly={isReadOnly}
            onSave={(dados) => onSalvarEdificacao(reuniao.edificacao!.id, dados)}
            onAdicionarPergunta={(p) => onAdicionarPergunta(reuniao.edificacao!.id, p)}
            onRemoverPergunta={onRemoverPergunta}
            onRefresh={onRefresh}
          />
        )}
        {secaoAtiva === "envio" && reuniao.envio && (
          <EnvioSection
            envio={reuniao.envio}
            readOnly={isReadOnly}
            onSave={(dados) => onSalvarEnvio(reuniao.envio!.id, dados)}
          />
        )}
      </div>
    </div>
  );
}
