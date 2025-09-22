// src/lib/supabase/types.ts
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
      persons: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          type: 'work' | 'expense' | 'projectCost'
          date: string
          tags: string[]
          payload: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'work' | 'expense' | 'projectCost'
          date: string
          tags?: string[]
          payload: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'work' | 'expense' | 'projectCost'
          date?: string
          tags?: string[]
          payload?: Json
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          default_currency: string
          week_start: number
          export_format: 'csv' | 'json'
          backup_policy: 'manual' | 'on-online' | 'daily'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          default_currency?: string
          week_start?: number
          export_format?: 'csv' | 'json'
          backup_policy?: 'manual' | 'on-online' | 'daily'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          default_currency?: string
          week_start?: number
          export_format?: 'csv' | 'json'
          backup_policy?: 'manual' | 'on-online' | 'daily'
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}