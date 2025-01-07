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
    <div className="flex flex-col space-y-8 p-4">
      <GamePreview
        actions={actions}
        onActionAdd={onActionAdd}
      />
      <ObserverSelection onStartMatch={onStartMatch} />
    </div>
  );
};