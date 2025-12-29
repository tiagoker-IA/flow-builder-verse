import { ArrowRight, HelpCircle, RefreshCw, ChevronDown } from "lucide-react";

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const actions = [
  { 
    label: "Continuar", 
    message: "Continue, por favor.", 
    icon: ArrowRight,
  },
  { 
    label: "Tenho uma dúvida", 
    message: "Tenho uma dúvida sobre isso.", 
    icon: HelpCircle,
  },
  { 
    label: "Reformular", 
    message: "Pode reformular de outra forma?", 
    icon: RefreshCw,
  },
  { 
    label: "Aprofundar", 
    message: "Pode aprofundar mais este ponto?", 
    icon: ChevronDown,
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/30">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => onAction(action.message)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-full border border-border/50 hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
