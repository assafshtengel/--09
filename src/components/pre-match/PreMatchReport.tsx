import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionSelector, Action } from "@/components/ActionSelector";
import { GamePreview } from "@/components/game/GamePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";

export const PreMatchReport = () => {
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [currentStep, setCurrentStep] = useState<"goals" | "preview" | "questionnaire">("goals");
  const [position, setPosition] = useState("forward"); // This should come from the user's profile

  const handleActionSubmit = (actions: Action[]) => {
    setSelectedActions(actions);
    setCurrentStep("preview");
  };

  const handleStartMatch = () => {
    // Navigate to match tracking or implement other logic
    console.log("Starting match with actions:", selectedActions);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-right">דוח טרום משחק</h1>
      
      <Tabs defaultValue="goals" className="w-full" dir="rtl">
        <TabsList className="w-full justify-end mb-6">
          <TabsTrigger value="goals">יעדים</TabsTrigger>
          <TabsTrigger value="questionnaire">שאלון הכנה</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          {currentStep === "goals" && (
            <ActionSelector
              position={position}
              onSubmit={handleActionSubmit}
            />
          )}
          
          {currentStep === "preview" && (
            <GamePreview
              actions={selectedActions}
              onActionAdd={(action) => setSelectedActions([...selectedActions, action])}
              onStartMatch={handleStartMatch}
            />
          )}
        </TabsContent>

        <TabsContent value="questionnaire">
          <PreMatchQuestionnaire />
        </TabsContent>
      </Tabs>
    </div>
  );
};