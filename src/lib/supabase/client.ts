// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper function for handling Supabase errors
export function handleSupabaseError(error: any, operation: string) {
  console.error(`Supabase error in ${operation}:`, error)
  throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`)
}