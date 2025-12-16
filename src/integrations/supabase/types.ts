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
      syndic8_group_members: {
        Row: {
          added_at: string
          coach_id: string
          group_id: string
          id: string
        }
        Insert: {
          added_at?: string
          coach_id: string
          group_id: string
          id?: string
        }
        Update: {
          added_at?: string
          coach_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndic8_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "syndic8_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      syndic8_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
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
    }
    Functions: {
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
