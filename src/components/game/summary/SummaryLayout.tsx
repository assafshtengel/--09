import { ScrollArea } from "@/components/ui/scroll-area";
import { SummaryHeader } from "./SummaryHeader";
import { SummaryContent } from "./SummaryContent";
import { SummaryActions } from "./SummaryActions";
import { Action } from "@/components/ActionSelector";
import { ReactNode } from "react";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

interface SummaryLayoutProps {
  actions: Action[];
  actionLogs: ActionLog[];
  generalNotes: Array<{ text: string; minute: number }>;
  substitutions: SubstitutionLog[];
  onClose: () => void;
  gamePhase?: "halftime" | "ended";
  onContinueGame?: () => void;
  matchId?: string;
  isSendingEmail: boolean;
  onSubmit: () => void;
  onSendEmail: () => void;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  onScreenshot: () => void;
  opponent?: string;
  children?: ReactNode;
}

export const SummaryLayout = ({
  actions,
  actionLogs,
  generalNotes,
  substitutions,
  onClose,
  gamePhase = "ended",
  onContinueGame,
  matchId,
  isSendingEmail,
  onSubmit,
  onSendEmail,
  onShareSocial,
  onScreenshot,
  opponent,
  children
}: SummaryLayoutProps) => {
  return (
    <ScrollArea className="h-[80vh] md:h-[600px]">
      <div className="space-y-4 p-2 md:p-4 bg-background">
        <div id="game-summary-content" className="space-y-4">
          <SummaryHeader gamePhase={gamePhase} matchId={matchId} opponent={opponent} />
          {children}
          <SummaryContent
            actions={actions}
            actionLogs={actionLogs}
            generalNotes={generalNotes}
            gamePhase={gamePhase}
          />
        </div>
        <SummaryActions
          gamePhase={gamePhase}
          isSendingEmail={isSendingEmail}
          onSubmit={onSubmit}
          onSendEmail={onSendEmail}
          onShareSocial={onShareSocial}
          onScreenshot={onScreenshot}
          onClose={onClose}
          onContinueGame={onContinueGame}
          matchId={matchId}
        />
      </div>
    </ScrollArea>
  );
};