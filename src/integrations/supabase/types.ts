export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          bio: string | null
          created_at: string
          expertise: string[] | null
          hourly_rate: number | null
          id: string
          instagram_url: string | null
          is_claimed: boolean | null
          is_verified: boolean | null
          last_activity_at: string | null
          linkedin_url: string | null
          personality: string | null
          rating: number | null
          show_on_homepage: boolean | null
          slug: string
          specialization: string | null
          status: Database["public"]["Enums"]["coach_status"]
          total_sessions: number | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          instagram_url?: string | null
          is_claimed?: boolean | null
          is_verified?: boolean | null
          last_activity_at?: string | null
          linkedin_url?: string | null
          personality?: string | null
          rating?: number | null
          show_on_homepage?: boolean | null
          slug: string
          specialization?: string | null
          status?: Database["public"]["Enums"]["coach_status"]
          total_sessions?: number | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          instagram_url?: string | null
          is_claimed?: boolean | null
          is_verified?: boolean | null
          last_activity_at?: string | null
          linkedin_url?: string | null
          personality?: string | null
          rating?: number | null
          show_on_homepage?: boolean | null
          slug?: string
          specialization?: string | null
          status?: Database["public"]["Enums"]["coach_status"]
          total_sessions?: number | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      coach_sessions: {
        Row: {
          coach_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          guest_session_id: string | null
          id: string
          message_count: number
          session_type: string
          started_at: string
          subscriber_id: string | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          guest_session_id?: string | null
          id?: string
          message_count?: number
          session_type?: string
          started_at?: string
          subscriber_id?: string | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          guest_session_id?: string | null
          id?: string
          message_count?: number
          session_type?: string
          started_at?: string
          subscriber_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_sessions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_sessions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          last_message_at: string
          title: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string | null
        }
        Relationships: []
      }
      daily_message_usage: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          message_count: number
          message_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          message_count?: number
          message_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          message_count?: number
          message_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      external_api_keys: {
        Row: {
          allowed_origins: string[] | null
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          permissions: string[] | null
          updated_at: string | null
        }
        Insert: {
          allowed_origins?: string[] | null
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          allowed_origins?: string[] | null
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          coach_id: string
          content: string | null
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          content?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          content?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      outbound_webhooks: {
        Row: {
          chat_enabled: boolean
          created_at: string
          description: string | null
          events: string[]
          expires_at: string | null
          id: string
          is_active: boolean
          last_response_status: number | null
          last_triggered_at: string | null
          name: string
          secret_key: string
          updated_at: string
          url: string
        }
        Insert: {
          chat_enabled?: boolean
          created_at?: string
          description?: string | null
          events?: string[]
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_response_status?: number | null
          last_triggered_at?: string | null
          name: string
          secret_key?: string
          updated_at?: string
          url: string
        }
        Update: {
          chat_enabled?: boolean
          created_at?: string
          description?: string | null
          events?: string[]
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_response_status?: number | null
          last_triggered_at?: string | null
          name?: string
          secret_key?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          subscriber_tier: Database["public"]["Enums"]["subscriber_tier"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          subscriber_tier?:
            | Database["public"]["Enums"]["subscriber_tier"]
            | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          subscriber_tier?:
            | Database["public"]["Enums"]["subscriber_tier"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          prompt: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          prompt: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          coach_id: string
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: string
          stripe_subscription_id: string | null
          subscriber_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          subscriber_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_directory"
            referencedColumns: ["user_id"]
          },
        ]
      }
      syndic8_eval_cases: {
        Row: {
          category: string
          created_at: string
          difficulty: string
          expected_council_template: string
          expected_dissent_topics: Json | null
          expected_themes: Json | null
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty: string
          expected_council_template?: string
          expected_dissent_topics?: Json | null
          expected_themes?: Json | null
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: string
          expected_council_template?: string
          expected_dissent_topics?: Json | null
          expected_themes?: Json | null
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      syndic8_eval_results: {
        Row: {
          created_at: string
          eval_case_id: string
          expert_critiques: Json | null
          expert_drafts: Json | null
          group_id: string
          id: string
          latency_ms: number | null
          notes: string | null
          passed: boolean | null
          scores: Json | null
          stage_timings: Json | null
          synthesis_output: Json | null
        }
        Insert: {
          created_at?: string
          eval_case_id: string
          expert_critiques?: Json | null
          expert_drafts?: Json | null
          group_id: string
          id?: string
          latency_ms?: number | null
          notes?: string | null
          passed?: boolean | null
          scores?: Json | null
          stage_timings?: Json | null
          synthesis_output?: Json | null
        }
        Update: {
          created_at?: string
          eval_case_id?: string
          expert_critiques?: Json | null
          expert_drafts?: Json | null
          group_id?: string
          id?: string
          latency_ms?: number | null
          notes?: string | null
          passed?: boolean | null
          scores?: Json | null
          stage_timings?: Json | null
          synthesis_output?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "syndic8_eval_results_eval_case_id_fkey"
            columns: ["eval_case_id"]
            isOneToOne: false
            referencedRelation: "syndic8_eval_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_eval_results_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "public_syndic8_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_eval_results_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "syndic8_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      syndic8_group_members: {
        Row: {
          added_at: string
          approved_at: string | null
          coach_id: string
          group_id: string
          has_approved_public: boolean | null
          id: string
        }
        Insert: {
          added_at?: string
          approved_at?: string | null
          coach_id: string
          group_id: string
          has_approved_public?: boolean | null
          id?: string
        }
        Update: {
          added_at?: string
          approved_at?: string | null
          coach_id?: string
          group_id?: string
          has_approved_public?: boolean | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndic8_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "public_syndic8_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "syndic8_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      syndic8_group_settings: {
        Row: {
          council_template: string
          created_at: string
          group_id: string
          require_dissent: boolean
          show_expert_reasoning: boolean
          synthesis_style: string
          updated_at: string
        }
        Insert: {
          council_template?: string
          created_at?: string
          group_id: string
          require_dissent?: boolean
          show_expert_reasoning?: boolean
          synthesis_style?: string
          updated_at?: string
        }
        Update: {
          council_template?: string
          created_at?: string
          group_id?: string
          require_dissent?: boolean
          show_expert_reasoning?: boolean
          synthesis_style?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndic8_group_settings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "public_syndic8_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_group_settings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "syndic8_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      syndic8_groups: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          name: string
          owner_id: string
          popularity_score: number | null
          public_description: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name: string
          owner_id: string
          popularity_score?: number | null
          public_description?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name?: string
          owner_id?: string
          popularity_score?: number | null
          public_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      syndic8_messages: {
        Row: {
          content: string
          created_at: string
          expert_coach_id: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string
          stage: string | null
        }
        Insert: {
          content: string
          created_at?: string
          expert_coach_id?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          stage?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          expert_coach_id?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syndic8_messages_expert_coach_id_fkey"
            columns: ["expert_coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_messages_expert_coach_id_fkey"
            columns: ["expert_coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "syndic8_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      syndic8_sessions: {
        Row: {
          council_template: string
          created_at: string
          ended_at: string | null
          group_id: string
          id: string
          message_count: number
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          council_template?: string
          created_at?: string
          ended_at?: string | null
          group_id: string
          id?: string
          message_count?: number
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          council_template?: string
          created_at?: string
          ended_at?: string | null
          group_id?: string
          id?: string
          message_count?: number
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndic8_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "public_syndic8_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "syndic8_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndic8_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          coach_type: string | null
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          coach_type?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
        }
        Update: {
          coach_type?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "outbound_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_coach_directory: {
        Row: {
          bio: string | null
          created_at: string | null
          expertise: string[] | null
          id: string | null
          instagram_url: string | null
          is_claimed: boolean | null
          is_verified: boolean | null
          linkedin_url: string | null
          rating: number | null
          show_on_homepage: boolean | null
          slug: string | null
          specialization: string | null
          status: Database["public"]["Enums"]["coach_status"] | null
          total_sessions: number | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string | null
          instagram_url?: string | null
          is_claimed?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          rating?: number | null
          show_on_homepage?: boolean | null
          slug?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          total_sessions?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string | null
          instagram_url?: string | null
          is_claimed?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          rating?: number | null
          show_on_homepage?: boolean | null
          slug?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["coach_status"] | null
          total_sessions?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      public_coach_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
        }
        Relationships: []
      }
      public_syndic8_groups: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_featured: boolean | null
          member_count: number | null
          name: string | null
          owner_id: string | null
          popularity_score: number | null
          public_description: string | null
          specializations: string[] | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_featured?: boolean | null
          member_count?: never
          name?: string | null
          owner_id?: string | null
          popularity_score?: number | null
          public_description?: string | null
          specializations?: never
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_featured?: boolean | null
          member_count?: never
          name?: string | null
          owner_id?: string | null
          popularity_score?: number | null
          public_description?: string | null
          specializations?: never
        }
        Relationships: []
      }
    }
    Functions: {
      count_coach_sessions: { Args: never; Returns: number }
      count_syndic8_groups: { Args: never; Returns: number }
      get_public_coach_profiles: {
        Args: { coach_ids: string[] }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
        }[]
      }
      get_subscription_limits: {
        Args: { user_tier: Database["public"]["Enums"]["subscriber_tier"] }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_daily_message_usage: {
        Args: { p_coach_id: string }
        Returns: Json
      }
      is_syndic8_group_owner: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_syndic8_group_public: { Args: { _group_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "coach" | "subscriber"
      coach_status:
        | "admin_setup"
        | "coach_claimed"
        | "onboarding_started"
        | "onboarding_completed"
        | "knowledge_base_setup"
        | "active"
        | "inactive"
      subscriber_tier: "free" | "plus" | "prime"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coach", "subscriber"],
      coach_status: [
        "admin_setup",
        "coach_claimed",
        "onboarding_started",
        "onboarding_completed",
        "knowledge_base_setup",
        "active",
        "inactive",
      ],
      subscriber_tier: ["free", "plus", "prime"],
    },
  },
} as const
