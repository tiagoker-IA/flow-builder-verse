import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "./FeedbackForm";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeedbackButtonProps {
  modoChat?: string;
  pagina?: string;
}

export function FeedbackButton({ modoChat, pagina }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enviar Feedback</p>
        </TooltipContent>
      </Tooltip>

      <FeedbackForm
        open={open}
        onOpenChange={setOpen}
        modoChat={modoChat}
        pagina={pagina}
      />
    </>
  );
}
