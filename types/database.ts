export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          visibility: "private" | "unlisted" | "public";
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          visibility?: "private" | "unlisted" | "public";
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          visibility?: "private" | "unlisted" | "public";
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      steps: {
        Row: {
          id: string;
          project_id: string;
          index: number;
          title: string;
          notes: string | null;
          language: string;
          code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          index: number;
          title: string;
          notes?: string | null;
          language?: string;
          code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          index?: number;
          title?: string;
          notes?: string | null;
          language?: string;
          code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Step = Database["public"]["Tables"]["steps"]["Row"];

export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
export type StepInsert = Database["public"]["Tables"]["steps"]["Insert"];
export type StepUpdate = Database["public"]["Tables"]["steps"]["Update"];
