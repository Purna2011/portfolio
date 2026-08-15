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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_id: string
          file_url: string
          id: string
          issue_date: string
          issuer: string
          name: string
          sort_order: number
          verification_url: string
        }
        Insert: {
          created_at?: string
          credential_id?: string
          file_url?: string
          id?: string
          issue_date?: string
          issuer?: string
          name: string
          sort_order?: number
          verification_url?: string
        }
        Update: {
          created_at?: string
          credential_id?: string
          file_url?: string
          id?: string
          issue_date?: string
          issuer?: string
          name?: string
          sort_order?: number
          verification_url?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          description: string
          end_date: string
          grade: string
          id: string
          institution: string
          sort_order: number
          specialization: string
          start_date: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string
          end_date?: string
          grade?: string
          id?: string
          institution?: string
          sort_order?: number
          specialization?: string
          start_date?: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string
          end_date?: string
          grade?: string
          id?: string
          institution?: string
          sort_order?: number
          specialization?: string
          start_date?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          achievements: string[]
          created_at: string
          description: string
          end_date: string
          id: string
          location: string
          organization: string
          responsibilities: string[]
          sort_order: number
          start_date: string
          technologies: string[]
          title: string
          visible: boolean
        }
        Insert: {
          achievements?: string[]
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          location?: string
          organization?: string
          responsibilities?: string[]
          sort_order?: number
          start_date?: string
          technologies?: string[]
          title: string
          visible?: boolean
        }
        Update: {
          achievements?: string[]
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          location?: string
          organization?: string
          responsibilities?: string[]
          sort_order?: number
          start_date?: string
          technologies?: string[]
          title?: string
          visible?: boolean
        }
        Relationships: []
      }
      profile: {
        Row: {
          about_description: string
          about_headline: string
          created_at: string
          email: string
          full_name: string
          github_url: string
          headline: string
          id: string
          linkedin_url: string
          location: string
          open_to_work: boolean
          phone: string
          photo_url: string
          professional_summary: string
          resume_url: string
          short_bio: string
          title: string
          updated_at: string
        }
        Insert: {
          about_description?: string
          about_headline?: string
          created_at?: string
          email?: string
          full_name?: string
          github_url?: string
          headline?: string
          id?: string
          linkedin_url?: string
          location?: string
          open_to_work?: boolean
          phone?: string
          photo_url?: string
          professional_summary?: string
          resume_url?: string
          short_bio?: string
          title?: string
          updated_at?: string
        }
        Update: {
          about_description?: string
          about_headline?: string
          created_at?: string
          email?: string
          full_name?: string
          github_url?: string
          headline?: string
          id?: string
          linkedin_url?: string
          location?: string
          open_to_work?: boolean
          phone?: string
          photo_url?: string
          professional_summary?: string
          resume_url?: string
          short_bio?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_versions: {
        Row: {
          created_at: string
          id: string
          label: string
          project_id: string
          snapshot: Json
          version_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          project_id: string
          snapshot: Json
          version_number?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          project_id?: string
          snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          business_impact: string
          category: string
          cover_image: string
          created_at: string
          dataset: string
          demo_url: string
          featured: boolean
          full_description: string
          github_url: string
          id: string
          images: string[]
          key_findings: string
          methodology: string
          name: string
          objective: string
          problem_statement: string
          published: boolean
          short_description: string
          slug: string
          sort_order: number
          technologies: string[]
          updated_at: string
          video_url: string
        }
        Insert: {
          business_impact?: string
          category?: string
          cover_image?: string
          created_at?: string
          dataset?: string
          demo_url?: string
          featured?: boolean
          full_description?: string
          github_url?: string
          id?: string
          images?: string[]
          key_findings?: string
          methodology?: string
          name: string
          objective?: string
          problem_statement?: string
          published?: boolean
          short_description?: string
          slug: string
          sort_order?: number
          technologies?: string[]
          updated_at?: string
          video_url?: string
        }
        Update: {
          business_impact?: string
          category?: string
          cover_image?: string
          created_at?: string
          dataset?: string
          demo_url?: string
          featured?: boolean
          full_description?: string
          github_url?: string
          id?: string
          images?: string[]
          key_findings?: string
          methodology?: string
          name?: string
          objective?: string
          problem_statement?: string
          published?: boolean
          short_description?: string
          slug?: string
          sort_order?: number
          technologies?: string[]
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          file_url: string
          id: string
          is_active: boolean
          label: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          is_active?: boolean
          label?: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          is_active?: boolean
          label?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          featured: boolean
          id: string
          name: string
          note: string
          sort_order: number
        }
        Insert: {
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          name: string
          note?: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          name?: string
          note?: string
          sort_order?: number
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          sort_order: number
          url: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          label: string
          sort_order?: number
          url?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          sort_order?: number
          url?: string
          visible?: boolean
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
