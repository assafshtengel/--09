import { Action } from "@/components/ActionSelector";
import { Json } from "@/integrations/supabase/types";

export const convertJsonToAction = (json: Json): Action | null => {
  if (typeof json === 'object' && json !== null && 
      'id' in json && 
      'name' in json && 
      'isSelected' in json) {
    return {
      id: String(json.id),
      name: String(json.name),
      isSelected: Boolean(json.isSelected),
      goal: 'goal' in json ? String(json.goal) : undefined
    };
  }
  return null;
};

export const convertJsonArrayToActions = (jsonArray: Json): Action[] => {
  if (!Array.isArray(jsonArray)) return [];
  return jsonArray
    .map(convertJsonToAction)
    .filter((action): action is Action => action !== null);
};