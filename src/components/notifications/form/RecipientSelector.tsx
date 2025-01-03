import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { NotificationData } from "@/types/notifications";

interface Player {
  id: string;
  full_name: string;
  club?: string;
}

interface RecipientSelectorProps {
  form: UseFormReturn<NotificationData>;
}

export const RecipientSelector = ({ form }: RecipientSelectorProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, club')
        .eq('role', 'player');
      
      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  return (
    <FormItem>
      <FormLabel>בחר שחקנים (אופציונלי)</FormLabel>
      <Command className="border rounded-md">
        <CommandInput placeholder="חפש שחקנים..." />
        <CommandEmpty>לא נמצאו שחקנים</CommandEmpty>
        <CommandGroup className="max-h-64 overflow-auto">
          {players.map((player) => (
            <CommandItem
              key={player.id}
              onSelect={() => {
                setSelectedPlayers(prev => {
                  const newSelection = prev.includes(player.id)
                    ? prev.filter(id => id !== player.id)
                    : [...prev, player.id];
                  form.setValue('recipient_id', newSelection[0] || null);
                  return newSelection;
                });
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedPlayers.includes(player.id) ? "opacity-100" : "opacity-0"
                )}
              />
              <span>{player.full_name}</span>
              {player.club && <span className="text-muted-foreground mr-2">({player.club})</span>}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </FormItem>
  );
};