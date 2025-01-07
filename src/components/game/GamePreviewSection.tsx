import { Action } from "@/components/ActionSelector";
import { GamePreview } from "./GamePreview";
import { ObserverSelection } from "./ObserverSelection";

interface GamePreviewSectionProps {
  actions: Action[];
  onActionAdd: (action: Action) => void;
  onStartMatch: (observerType: "parent" | "player") => void;
}

export const GamePreviewSection = ({
  actions,
  onActionAdd,
  onStartMatch,
}: GamePreviewSectionProps) => {
  return (
    <div className="space-y-8">
      <GamePreview
        actions={actions}
        onActionAdd={onActionAdd}
        onStartMatch={() => {}} // We handle this differently now
      />
      <ObserverSelection onStartMatch={onStartMatch} />
    </div>
  );
};