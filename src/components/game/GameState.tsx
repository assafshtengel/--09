import { useState } from "react";
import { GamePhase, ActionLog, SubstitutionLog } from "@/types/game";
import { Action } from "@/components/ActionSelector";

export const useGameState = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [minute, setMinute] = useState(0);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [generalNote, setGeneralNote] = useState("");
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionLog[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  return {
    gamePhase,
    setGamePhase,
    minute,
    setMinute,
    actionLogs,
    setActionLogs,
    showSummary,
    setShowSummary,
    actions,
    setActions,
    generalNote,
    setGeneralNote,
    generalNotes,
    setGeneralNotes,
    substitutions,
    setSubstitutions,
    isTimerRunning,
    setIsTimerRunning,
  };
};