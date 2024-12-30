import { Json } from "@/integrations/supabase/types";

export type NotificationType = "custom" | "pre_match" | "weekly" | "mental_tip";

export interface NotificationData {
  sender_id: string;
  message: string;
  scheduled_for: string;
  condition?: Json;
  recipient_id?: string;
  type: NotificationType;
  status: string;
}