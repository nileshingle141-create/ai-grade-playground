export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      lessons: {
        Row: {
          created_at: string;
          duration_minutes: number;
          grade: number;
          id: string;
          key_points: string[] | null;
          lesson_content: string;
          story: string | null;
          subject: string;
          topic: string;
        };
        Insert: {
          created_at?: string;
          duration_minutes?: number;
          grade: number;
          id?: string;
          key_points?: string[] | null;
          lesson_content: string;
          story?: string | null;
          subject: string;
          topic: string;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number;
          grade?: number;
          id?: string;
          key_points?: string[] | null;
          lesson_content?: string;
          story?: string | null;
          subject?: string;
          topic?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          grade: number;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          grade: number;
          id: string;
          name: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          grade?: number;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      quizzes: {
        Row: {
          correct_answer: string;
          id: string;
          lesson_id: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          question: string;
        };
        Insert: {
          correct_answer: string;
          id?: string;
          lesson_id: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          question: string;
        };
        Update: {
          correct_answer?: string;
          id?: string;
          lesson_id?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          question?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      student_progress: {
        Row: {
          completed: boolean;
          id: string;
          lesson_id: string;
          score: number | null;
          student_id: string;
          time_spent_minutes: number | null;
          updated_at: string;
        };
        Insert: {
          completed?: boolean;
          id?: string;
          lesson_id: string;
          score?: number | null;
          student_id: string;
          time_spent_minutes?: number | null;
          updated_at?: string;
        };
        Update: {
          completed?: boolean;
          id?: string;
          lesson_id?: string;
          score?: number | null;
          student_id?: string;
          time_spent_minutes?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          created_at: string;
          grade: number;
          icon_name: string;
          id: string;
          subject_color: string;
          subject_name: string;
        };
        Insert: {
          created_at?: string;
          grade: number;
          icon_name?: string;
          id?: string;
          subject_color: string;
          subject_name: string;
        };
        Update: {
          created_at?: string;
          grade?: number;
          icon_name?: string;
          id?: string;
          subject_color?: string;
          subject_name?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      worksheets: {
        Row: {
          answer_key: string;
          created_at: string;
          id: string;
          lesson_id: string;
          worksheet_content: string;
        };
        Insert: {
          answer_key: string;
          created_at?: string;
          id?: string;
          lesson_id: string;
          worksheet_content: string;
        };
        Update: {
          answer_key?: string;
          created_at?: string;
          id?: string;
          lesson_id?: string;
          worksheet_content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "worksheets_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "student";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
    },
  },
} as const;
