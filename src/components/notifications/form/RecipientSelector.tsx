import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecipientSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function RecipientSelector({ value, onChange }: RecipientSelectorProps) {
  const [open, setOpen] = useState(false);

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["recipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      return data || [];
    },
  });

  const selectedRecipient = recipients.find((recipient) => recipient.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedRecipient
            ? selectedRecipient.full_name
            : "בחר נמען..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="חפש נמען..." />
          <CommandEmpty>לא נמצאו תוצאות.</CommandEmpty>
          <CommandGroup>
            {recipients.map((recipient) => (
              <CommandItem
                key={recipient.id}
                value={recipient.id}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === recipient.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {recipient.full_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}