import React from "react";
import { Button } from "@/components/ui/button";

interface SportBranchSelectorProps {
  selectedSports: string[];
  onToggleSport: (sport: string) => void;
  isPlayer: boolean;
}

export const SportBranchSelector = ({ selectedSports, onToggleSport, isPlayer }: SportBranchSelectorProps) => {
  const sports = ["כדורגל", "כדורסל", "טניס"];

  const handleSportClick = (sport: string) => {
    if (isPlayer) {
      // For players - only one sport can be selected
      onToggleSport(sport);
    } else {
      // For coaches - multiple sports can be selected
      onToggleSport(sport);
    }
  };

  return (
    <div>
      <label className="block text-right mb-2">ענף ספורט</label>
      <div className="space-y-2">
        {sports.map((sport) => (
          <Button
            key={sport}
            type="button"
            variant={selectedSports.includes(sport) ? "default" : "outline"}
            className="ml-2 mb-2"
            onClick={() => handleSportClick(sport)}
          >
            {sport}
          </Button>
        ))}
      </div>
    </div>
  );
};