import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SecaoConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface ReuniaoProgressBarProps {
  secaoAtiva: string;
  secoes: readonly SecaoConfig[];
}

export function ReuniaoProgressBar({ secaoAtiva, secoes }: ReuniaoProgressBarProps) {
  const activeIndex = secoes.findIndex(s => s.id === secaoAtiva);
  const progress = ((activeIndex + 1) / secoes.length) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        {secoes.map((secao, index) => {
          const Icon = secao.icon;
          const isPast = index < activeIndex;
          const isCurrent = index === activeIndex;
          return (
            <div key={secao.id} className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                isCurrent && "bg-primary text-primary-foreground",
                isPast && "bg-primary/20 text-primary",
                !isPast && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:block">{secao.label}</span>
            </div>
          );
        })}
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
