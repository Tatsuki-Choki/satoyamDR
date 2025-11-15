/**
 * Supabase Database Types
 *
 * データベーススキーマに対応する TypeScript 型定義
 *
 * Note: これらの型は Supabase CLI で自動生成することもできます:
 * ```
 * npx supabase gen types typescript --project-id xxlgbwnoqatpprixmslc > lib/supabase/types.ts
 * ```
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone_number: string | null
          avatar_url: string | null
          bio: string | null
          is_active: boolean
          email_verified: boolean
          phone_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_active?: boolean
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_active?: boolean
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dogs: {
        Row: {
          id: string
          user_id: string
          name: string
          breed: string
          size: string
          gender: string
          birth_date: string | null
          weight: number | null
          color: string | null
          personality: string | null
          medical_notes: string | null
          is_neutered: boolean
          registration_number: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          breed: string
          size: string
          gender: string
          birth_date?: string | null
          weight?: number | null
          color?: string | null
          personality?: string | null
          medical_notes?: string | null
          is_neutered?: boolean
          registration_number?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          breed?: string
          size?: string
          gender?: string
          birth_date?: string | null
          weight?: number | null
          color?: string | null
          personality?: string | null
          medical_notes?: string | null
          is_neutered?: boolean
          registration_number?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_urls: string[] | null
          status: string
          is_public: boolean
          likes_count: number
          comments_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_urls?: string[] | null
          status?: string
          is_public?: boolean
          likes_count?: number
          comments_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_urls?: string[] | null
          status?: string
          is_public?: boolean
          likes_count?: number
          comments_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          dog_id: string
          agree_to_terms: boolean
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dog_id: string
          agree_to_terms?: boolean
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dog_id?: string
          agree_to_terms?: boolean
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vaccination_records: {
        Row: {
          id: string
          dog_id: string
          vaccine_type: string
          vaccination_date: string
          expiration_date: string
          veterinarian: string | null
          clinic_name: string | null
          certificate_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          vaccine_type: string
          vaccination_date: string
          expiration_date: string
          veterinarian?: string | null
          clinic_name?: string | null
          certificate_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          vaccine_type?: string
          vaccination_date?: string
          expiration_date?: string
          veterinarian?: string | null
          clinic_name?: string | null
          certificate_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      entry_logs: {
        Row: {
          id: string
          user_id: string
          dog_id: string
          action: string
          entry_time: string | null
          exit_time: string | null
          duration_minutes: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dog_id: string
          action: string
          entry_time?: string | null
          exit_time?: string | null
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dog_id?: string
          action?: string
          entry_time?: string | null
          exit_time?: string | null
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          max_participants: number | null
          current_participants: number
          status: string
          image_url: string | null
          location: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          max_participants?: number | null
          current_participants?: number
          status?: string
          image_url?: string | null
          location?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          max_participants?: number | null
          current_participants?: number
          status?: string
          image_url?: string | null
          location?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      business_hours: {
        Row: {
          id: string
          day_of_week: number
          open_time: string | null
          close_time: string | null
          is_closed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notices: {
        Row: {
          id: string
          title: string
          content: string
          status: string
          priority: string
          start_date: string | null
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          status?: string
          priority?: string
          start_date?: string | null
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          status?: string
          priority?: string
          start_date?: string | null
          end_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      terms: {
        Row: {
          id: string
          version: string
          content: string
          effective_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          version: string
          content: string
          effective_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          version?: string
          content?: string
          effective_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      entry_action: 'entry' | 'exit'
      event_status: 'draft' | 'published' | 'cancelled' | 'completed'
      admin_role: 'super_admin' | 'admin' | 'moderator'
      application_status: 'pending' | 'approved' | 'rejected'
      post_status: 'draft' | 'published' | 'archived'
      notice_status: 'draft' | 'published' | 'archived'
      notice_priority: 'low' | 'medium' | 'high' | 'urgent'
    }
  }
}
