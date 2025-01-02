import { Action } from "@/components/ActionSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ActionSelectionStepProps {
  actions: Action[];
  onNext: (actions: Action[]) => void;
  onBack: () => void;
}

export const ActionSelectionStep = ({ actions, onNext, onBack }: ActionSelectionStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">בחר פעולות למעקב</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-semibold text-right">{action.name}</h3>
            {action.goal && (
              <p className="text-sm text-gray-600 mt-1 text-right">יעד: {action.goal}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button onClick={() => onNext(actions)}>
          המשך
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onBack}>
          חזור
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};