import { Action } from "@/components/ActionSelector";

interface GamePreviewProps {
  actions: Action[];
  onActionAdd: (action: Action) => void;
}

export const GamePreview = ({
  actions,
  onActionAdd,
}: GamePreviewProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">בחר פעולות למעקב במשחק</h2>
      <div className="flex flex-col space-y-2">
        {actions.map(action => (
          <div key={action.id} className="flex items-center justify-between">
            <span>{action.name}</span>
            <button
              onClick={() => onActionAdd(action)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              הוסף
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
