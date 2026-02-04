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
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: 'todo' | 'done' | 'recurring' | 'waiting_followup'
          created_at: string
          updated_at: string
          is_voice_note: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: 'todo' | 'done' | 'recurring' | 'waiting_followup'
          created_at?: string
          updated_at?: string
          is_voice_note?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: 'todo' | 'done' | 'recurring' | 'waiting_followup'
          created_at?: string
          updated_at?: string
          is_voice_note?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
