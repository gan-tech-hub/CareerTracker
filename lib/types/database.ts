export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          login_url: string | null;
          registered_email: string | null;
          login_id: string | null;
          status: string;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["services"]["Row"]> & {
          user_id: string;
          name: string;
          type?: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          industry: string | null;
          location: string | null;
          corporate_url: string | null;
          recruitment_url: string | null;
          interest_level: string;
          concerns: string | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["companies"]["Row"]> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Row"]>;
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          organization: string | null;
          role: string;
          email: string | null;
          phone: string | null;
          service_id: string | null;
          company_id: string | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contacts"]["Row"]> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Row"]>;
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          service_id: string | null;
          title: string;
          job_url: string | null;
          job_type: string | null;
          employment_type: string;
          salary_min: number | null;
          salary_max: number | null;
          location: string | null;
          remote_type: string;
          side_job_allowed: string;
          required_skills: string | null;
          preferred_skills: string | null;
          description: string | null;
          attractive_points: string | null;
          concerns: string | null;
          priority: string;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["jobs"]["Row"]> & {
          user_id: string;
          company_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Row"]>;
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          status: string;
          applied_at: string | null;
          next_action: string | null;
          next_deadline: string | null;
          interest_level: string;
          selection_memo: string | null;
          decline_reason: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["applications"]["Row"]> & {
          user_id: string;
          job_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Row"]>;
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          type: string;
          scheduled_at: string;
          duration_minutes: number | null;
          location: string | null;
          online_url: string | null;
          participants: string | null;
          preparation_memo: string | null;
          interview_memo: string | null;
          result_memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["interviews"]["Row"]> & {
          user_id: string;
          application_id: string;
          scheduled_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["interviews"]["Row"]>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          title: string;
          type: string;
          due_date: string;
          is_completed: boolean;
          priority: string;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          user_id: string;
          title: string;
          due_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
