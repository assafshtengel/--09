import { HavayaSelector } from "../HavayaSelector";
import { ActionSelector } from "@/components/ActionSelector";
import { SocialShareGoals } from "../SocialShareGoals";
import { motion } from "framer-motion";
import { Action } from "@/components/ActionSelector";
import { Json } from "@/integrations/supabase/types";

interface ActionsStepProps {
  position: string;
  havaya: string;
  selectedActions: Action[];
  onHavayaChange: (value: string) => void;
  onActionsSubmit: (actions: Json) => void;
}

export const ActionsStep = ({
  position,
  havaya,
  selectedActions,
  onHavayaChange,
  onActionsSubmit,
}: ActionsStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <HavayaSelector value={havaya} onChange={onHavayaChange} />
      
      <ActionSelector
        position={position}
        onSubmit={onActionsSubmit}
      />

      {selectedActions.length > 0 && (
        <SocialShareGoals goals={selectedActions} />
      )}
    </motion.div>
  );
};