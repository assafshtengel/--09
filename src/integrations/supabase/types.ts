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
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_credentials: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
          phone_number: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
          phone_number: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
          phone_number?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
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
      learning_resources: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
          url?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "match_actions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_halftime_notes: {
        Row: {
          created_at: string
          id: string
          match_id: string
          notes: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          notes: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_halftime_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_halftime_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_mental_feedback: {
        Row: {
          coach_feedback: string | null
          created_at: string
          id: string
          match_id: string
          mental_coach_feedback: string | null
          pressure_handling: string | null
          turning_points: string | null
        }
        Insert: {
          coach_feedback?: string | null
          created_at?: string
          id?: string
          match_id: string
          mental_coach_feedback?: string | null
          pressure_handling?: string | null
          turning_points?: string | null
        }
        Update: {
          coach_feedback?: string | null
          created_at?: string
          id?: string
          match_id?: string
          mental_coach_feedback?: string | null
          pressure_handling?: string | null
          turning_points?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_mental_feedback_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_mental_feedback_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_players"
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
          {
            foreignKeyName: "match_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_players"
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
          {
            foreignKeyName: "match_substitutions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          final_score: string | null
          id: string
          location: string | null
          match_date: string
          match_type: string | null
          observer_token: string | null
          opponent: string | null
          played_minutes: number | null
          player_id: string
          player_position: string | null
          player_role: string | null
          pre_match_report_id: string | null
          status: string
          team: string | null
          team_name: string | null
        }
        Insert: {
          created_at?: string
          final_score?: string | null
          id?: string
          location?: string | null
          match_date: string
          match_type?: string | null
          observer_token?: string | null
          opponent?: string | null
          played_minutes?: number | null
          player_id: string
          player_position?: string | null
          player_role?: string | null
          pre_match_report_id?: string | null
          status?: string
          team?: string | null
          team_name?: string | null
        }
        Update: {
          created_at?: string
          final_score?: string | null
          id?: string
          location?: string | null
          match_date?: string
          match_type?: string | null
          observer_token?: string | null
          opponent?: string | null
          played_minutes?: number | null
          player_id?: string
          player_position?: string | null
          player_role?: string | null
          pre_match_report_id?: string | null
          status?: string
          team?: string | null
          team_name?: string | null
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
          {
            foreignKeyName: "matches_pre_match_report_id_fkey"
            columns: ["pre_match_report_id"]
            isOneToOne: false
            referencedRelation: "pre_match_reports_with_details"
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
          message_type: string | null
          recipient_group: string[] | null
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
          message_type?: string | null
          recipient_group?: string[] | null
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
          message_type?: string | null
          recipient_group?: string[] | null
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
      player_achievements: {
        Row: {
          achievement_date: string | null
          achievement_type: string
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          player_id: string
          progress: number
          title: string
          updated_at: string
        }
        Insert: {
          achievement_date?: string | null
          achievement_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          player_id: string
          progress?: number
          title: string
          updated_at?: string
        }
        Update: {
          achievement_date?: string | null
          achievement_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          player_id?: string
          progress?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          media_type: string
          player_id: string
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          media_type: string
          player_id: string
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          media_type?: string
          player_id?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_media_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          assists: number | null
          created_at: string
          defensive_actions: number | null
          endurance_score: number | null
          goals: number | null
          id: string
          jump_height: number | null
          minutes_played: number | null
          pass_success_rate: number | null
          player_id: string
          season: string
          shots_on_target: number | null
          speed_record: number | null
          updated_at: string
        }
        Insert: {
          assists?: number | null
          created_at?: string
          defensive_actions?: number | null
          endurance_score?: number | null
          goals?: number | null
          id?: string
          jump_height?: number | null
          minutes_played?: number | null
          pass_success_rate?: number | null
          player_id: string
          season: string
          shots_on_target?: number | null
          speed_record?: number | null
          updated_at?: string
        }
        Update: {
          assists?: number | null
          created_at?: string
          defensive_actions?: number | null
          endurance_score?: number | null
          goals?: number | null
          id?: string
          jump_height?: number | null
          minutes_played?: number | null
          pass_success_rate?: number | null
          player_id?: string
          season?: string
          shots_on_target?: number | null
          speed_record?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
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
            foreignKeyName: "post_game_feedback_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches_with_players"
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
      pre_match_attribute_selections: {
        Row: {
          attribute_id: string | null
          created_at: string
          id: string
          match_id: string | null
          player_id: string | null
        }
        Insert: {
          attribute_id?: string | null
          created_at?: string
          id?: string
          match_id?: string | null
          player_id?: string | null
        }
        Update: {
          attribute_id?: string | null
          created_at?: string
          id?: string
          match_id?: string | null
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_match_attribute_selections_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "pre_match_attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_match_attribute_selections_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_match_attribute_selections_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_match_attribute_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_match_attributes: {
        Row: {
          category: string | null
          description: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          description: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      pre_match_reports: {
        Row: {
          actions: Json
          ai_insights: string[] | null
          created_at: string
          havaya: string | null
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
          havaya?: string | null
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
          havaya?: string | null
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
      professional_reviews: {
        Row: {
          created_at: string
          id: string
          player_id: string
          review_date: string
          review_text: string
          reviewer_name: string
          reviewer_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          review_date: string
          review_text: string
          reviewer_name: string
          reviewer_role: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          review_date?: string
          review_text?: string
          reviewer_name?: string
          reviewer_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_reviews_player_id_fkey"
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
          coach_email: string | null
          coach_phone_number: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          mental_coach_phone_number: string | null
          phone_number: string | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          roles: string[] | null
          team_year: number | null
          updated_at: string
        }
        Insert: {
          age_category?: string | null
          club?: string | null
          coach_email?: string | null
          coach_phone_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          mental_coach_phone_number?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roles?: string[] | null
          team_year?: number | null
          updated_at?: string
        }
        Update: {
          age_category?: string | null
          club?: string | null
          coach_email?: string | null
          coach_phone_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          mental_coach_phone_number?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roles?: string[] | null
          team_year?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      schedule_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          ai_priority: number | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_ai_generated: boolean | null
          meal_type: string | null
          notes: string | null
          priority: number | null
          recurring_days: number[] | null
          schedule_id: string
          start_time: string
          title: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          ai_priority?: number | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_ai_generated?: boolean | null
          meal_type?: string | null
          notes?: string | null
          priority?: number | null
          recurring_days?: number[] | null
          schedule_id: string
          start_time: string
          title?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          ai_priority?: number | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_ai_generated?: boolean | null
          meal_type?: string | null
          notes?: string | null
          priority?: number | null
          recurring_days?: number[] | null
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
      schedule_exams: {
        Row: {
          created_at: string
          exam_date: string
          id: string
          schedule_id: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          id?: string
          schedule_id?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          id?: string
          schedule_id?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_exams_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "weekly_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_matches: {
        Row: {
          created_at: string
          id: string
          match_date: string
          match_time: string
          opponent: string
          schedule_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_date: string
          match_time: string
          opponent: string
          schedule_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string
          match_time?: string
          opponent?: string
          schedule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_matches_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "weekly_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_social_events: {
        Row: {
          created_at: string
          description: string
          end_time: string
          event_date: string
          id: string
          schedule_id: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          description: string
          end_time: string
          event_date: string
          id?: string
          schedule_id?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          description?: string
          end_time?: string
          event_date?: string
          id?: string
          schedule_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_social_events_schedule_id_fkey"
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
          additional_commitments: Json | null
          ai_optimizations: Json | null
          chat_progress: Json | null
          created_at: string
          exams: Json | null
          id: string
          is_active: boolean
          notes: string | null
          player_id: string
          school_hours: Json | null
          shared_with: string[] | null
          social_events: Json | null
          start_date: string
          status: string | null
          team_games: Json | null
          training_hours: Json | null
        }
        Insert: {
          additional_commitments?: Json | null
          ai_optimizations?: Json | null
          chat_progress?: Json | null
          created_at?: string
          exams?: Json | null
          id?: string
          is_active?: boolean
          notes?: string | null
          player_id: string
          school_hours?: Json | null
          shared_with?: string[] | null
          social_events?: Json | null
          start_date: string
          status?: string | null
          team_games?: Json | null
          training_hours?: Json | null
        }
        Update: {
          additional_commitments?: Json | null
          ai_optimizations?: Json | null
          chat_progress?: Json | null
          created_at?: string
          exams?: Json | null
          id?: string
          is_active?: boolean
          notes?: string | null
          player_id?: string
          school_hours?: Json | null
          shared_with?: string[] | null
          social_events?: Json | null
          start_date?: string
          status?: string | null
          team_games?: Json | null
          training_hours?: Json | null
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
      "סרטונים מנטאליים": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      matches_with_players: {
        Row: {
          created_at: string | null
          final_score: string | null
          id: string | null
          location: string | null
          match_date: string | null
          match_type: string | null
          observer_token: string | null
          opponent: string | null
          played_minutes: number | null
          player_id: string | null
          player_name: string | null
          player_position: string | null
          player_role: string | null
          pre_match_report_id: string | null
          status: string | null
          team: string | null
          team_name: string | null
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
          {
            foreignKeyName: "matches_pre_match_report_id_fkey"
            columns: ["pre_match_report_id"]
            isOneToOne: false
            referencedRelation: "pre_match_reports_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_match_reports_with_details: {
        Row: {
          actions: Json | null
          created_at: string | null
          havaya: string | null
          id: string | null
          match_date: string | null
          match_time: string | null
          opponent: string | null
          player_name: string | null
          questions_answers: Json | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Relationships: []
      }
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
        | "team_game"
        | "exam_prep"
        | "social_event"
        | "meal"
        | "travel"
      activity_type_enum:
        | "sleep"
        | "screen_time"
        | "school"
        | "team_training"
        | "personal_training"
        | "match"
        | "exam"
        | "social_event"
        | "meal"
        | "free_time"
        | "study_time"
        | "travel"
      admin_role: "super_admin" | "admin"
      message_type: "incoming" | "outgoing"
      notification_type: "pre_match" | "weekly" | "mental_tip" | "custom"
      report_status: "draft" | "completed"
      resource_type: "video" | "article"
      user_role: "admin" | "player" | "coach" | "analyst"
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
