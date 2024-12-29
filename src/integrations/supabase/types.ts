export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_routines: {
        Row: {
          breakfast: string | null
          created_at: string
          date: string
          dinner: string | null
          id: string
          lunch: string | null
          notes: string | null
          player_id: string
          sleep_hours: number
          snacks: string | null
          water_intake: number | null
        }
        Insert: {
          breakfast?: string | null
          created_at?: string
          date?: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          notes?: string | null
          player_id: string
          sleep_hours: number
          snacks?: string | null
          water_intake?: number | null
        }
        Update: {
          breakfast?: string | null
          created_at?: string
          date?: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          notes?: string | null
          player_id?: string
          sleep_hours?: number
          snacks?: string | null
          water_intake?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_routines_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_actions: {
        Row: {
          action_id: string
          id: string
          match_id: string
          minute: number
          note: string | null
          result: string
        }
        Insert: {
          action_id: string
          id?: string
          match_id: string
          minute: number
          note?: string | null
          result: string
        }
        Update: {
          action_id?: string
          id?: string
          match_id?: string
          minute?: number
          note?: string | null
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_actions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_notes: {
        Row: {
          id: string
          match_id: string
          minute: number
          note: string
        }
        Insert: {
          id?: string
          match_id: string
          minute: number
          note: string
        }
        Update: {
          id?: string
          match_id?: string
          minute?: number
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_substitutions: {
        Row: {
          id: string
          match_id: string
          minute: number
          player_in: string
          player_out: string
        }
        Insert: {
          id?: string
          match_id: string
          minute: number
          player_in: string
          player_out: string
        }
        Update: {
          id?: string
          match_id?: string
          minute?: number
          player_in?: string
          player_out?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_substitutions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          location: string | null
          match_date: string
          opponent: string | null
          player_id: string
          pre_match_report_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          match_date: string
          opponent?: string | null
          player_id: string
          pre_match_report_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          match_date?: string
          opponent?: string | null
          player_id?: string
          pre_match_report_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_pre_match_report_id_fkey"
            columns: ["pre_match_report_id"]
            isOneToOne: false
            referencedRelation: "pre_match_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          recipient_id: string | null
          sender_id: string | null
          type: Database["public"]["Enums"]["message_type"]
          whatsapp_message_id: string | null
          whatsapp_status: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
          type: Database["public"]["Enums"]["message_type"]
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
          type?: Database["public"]["Enums"]["message_type"]
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          condition: Json | null
          created_at: string
          id: string
          message: string
          recipient_id: string | null
          scheduled_for: string | null
          sender_id: string
          status: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          condition?: Json | null
          created_at?: string
          id?: string
          message: string
          recipient_id?: string | null
          scheduled_for?: string | null
          sender_id: string
          status?: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          condition?: Json | null
          created_at?: string
          id?: string
          message?: string
          recipient_id?: string | null
          scheduled_for?: string | null
          sender_id?: string
          status?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_game_feedback: {
        Row: {
          created_at: string
          id: string
          match_id: string
          performance_ratings: Json
          player_id: string
          questions_answers: Json
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          performance_ratings?: Json
          player_id: string
          questions_answers?: Json
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          performance_ratings?: Json
          player_id?: string
          questions_answers?: Json
        }
        Relationships: [
          {
            foreignKeyName: "post_game_feedback_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_game_feedback_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_match_reports: {
        Row: {
          actions: Json
          ai_insights: string[] | null
          created_at: string
          id: string
          match_date: string
          match_time: string | null
          opponent: string | null
          player_id: string
          questions_answers: Json
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          actions?: Json
          ai_insights?: string[] | null
          created_at?: string
          id?: string
          match_date: string
          match_time?: string | null
          opponent?: string | null
          player_id: string
          questions_answers?: Json
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          actions?: Json
          ai_insights?: string[] | null
          created_at?: string
          id?: string
          match_date?: string
          match_time?: string | null
          opponent?: string | null
          player_id?: string
          questions_answers?: Json
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_match_reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_category: string | null
          club: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          phone_number: string | null
          profile_picture_url: string | null
          roles: string[] | null
          team_year: number | null
          updated_at: string
        }
        Insert: {
          age_category?: string | null
          club?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          profile_picture_url?: string | null
          roles?: string[] | null
          team_year?: number | null
          updated_at?: string
        }
        Update: {
          age_category?: string | null
          club?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          roles?: string[] | null
          team_year?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      schedule_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          notes: string | null
          priority: number | null
          schedule_id: string
          start_time: string
          title: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          notes?: string | null
          priority?: number | null
          schedule_id: string
          start_time: string
          title?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          notes?: string | null
          priority?: number | null
          schedule_id?: string
          start_time?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_activities_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "weekly_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_summaries: {
        Row: {
          challenge_handling_rating: number
          created_at: string
          energy_focus_rating: number
          id: string
          player_id: string
          questions_answers: Json
          satisfaction_rating: number
          training_date: string
          training_time: string
        }
        Insert: {
          challenge_handling_rating: number
          created_at?: string
          energy_focus_rating: number
          id?: string
          player_id: string
          questions_answers: Json
          satisfaction_rating: number
          training_date: string
          training_time: string
        }
        Update: {
          challenge_handling_rating?: number
          created_at?: string
          energy_focus_rating?: number
          id?: string
          player_id?: string
          questions_answers?: Json
          satisfaction_rating?: number
          training_date?: string
          training_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_summaries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_schedules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          player_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          player_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          player_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_schedules_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "school"
        | "team_training"
        | "personal_training"
        | "mental_training"
        | "other"
        | "free_time"
        | "lunch"
        | "wake_up"
        | "departure"
      message_type: "incoming" | "outgoing"
      notification_type: "pre_match" | "weekly" | "mental_tip" | "custom"
      report_status: "draft" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
