import { ArrowRight, HelpCircle, RefreshCw, ChevronDown, List, FileText } from "lucide-react";

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
  showFormatOptions?: boolean;
}

const defaultActions = [
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

const formatActions = [
  {
    label: "Quero em tópicos",
    message: "Quero o material final em tópicos organizados, por favor.",
    icon: List,
  },
  {
    label: "Quero texto redigido",
    message: "Quero o material final em texto redigido, pronto para pregar.",
    icon: FileText,
  },
];

export function QuickActions({ onAction, disabled, showFormatOptions }: QuickActionsProps) {
  const actions = showFormatOptions ? [...formatActions, ...defaultActions] : defaultActions;
  
  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/30">
      {actions.map((action) => {
        const Icon = action.icon;
        const isFormatAction = formatActions.some(f => f.label === action.label);
        return (
          <button
            key={action.label}
            onClick={() => onAction(action.message)}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isFormatAction 
                ? "text-primary bg-primary/10 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                : "text-muted-foreground bg-secondary/50 hover:bg-primary hover:text-primary-foreground border-border/50 hover:border-primary"
            }`}
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
