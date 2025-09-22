// src/lib/supabase/entries.ts
import { supabase, handleSupabaseError } from './client'
import type { Entry } from '@/lib/schemas/zod'

export class EntriesService {
  // Load entries with optional filtering
  static async load(filter?: {
    type?: 'work' | 'expense' | 'projectCost'
    from?: string
    to?: string
  }): Promise<Entry[]> {
    try {
      let query = supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: true })

      // Apply filters
      if (filter?.type) {
        query = query.eq('type', filter.type)
      }
      
      if (filter?.from) {
        query = query.gte('date', filter.from)
      }
      
      if (filter?.to) {
        query = query.lte('date', filter.to)
      }

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error, 'load entries')
      }

      // Transform to match our Entry type
      return (data || []).map(row => ({
        id: row.id,
        type: row.type,
        date: row.date,
        tags: row.tags || [],
        payload: row.payload as any,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch (error) {
      handleSupabaseError(error, 'load entries')
      return []
    }
  }

  // Add new entry
  static async add(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry> {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert({
          type: entry.type,
          date: entry.date,
          tags: entry.tags,
          payload: entry.payload as any,
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'add entry')
      }

      return {
        id: data.id,
        type: data.type,
        date: data.date,
        tags: data.tags || [],
        payload: data.payload as any,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      handleSupabaseError(error, 'add entry')
      throw error
    }
  }

  // Update existing entry
  static async update(entry: Entry): Promise<void> {
    try {
      const { error } = await supabase
        .from('entries')
        .update({
          type: entry.type,
          date: entry.date,
          tags: entry.tags,
          payload: entry.payload as any,
        })
        .eq('id', entry.id)

      if (error) {
        handleSupabaseError(error, 'update entry')
      }
    } catch (error) {
      handleSupabaseError(error, 'update entry')
      throw error
    }
  }

  // Delete entry
  static async remove(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'delete entry')
      }
    } catch (error) {
      handleSupabaseError(error, 'delete entry')
      throw error
    }
  }

  // Bulk operations for migration
  static async bulkAdd(entries: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Entry[]> {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert(entries.map(entry => ({
          type: entry.type,
          date: entry.date,
          tags: entry.tags,
          payload: entry.payload as any,
        })))
        .select()

      if (error) {
        handleSupabaseError(error, 'bulk add entries')
      }

      return (data || []).map(row => ({
        id: row.id,
        type: row.type,
        date: row.date,
        tags: row.tags || [],
        payload: row.payload as any,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch (error) {
      handleSupabaseError(error, 'bulk add entries')
      throw error
    }
  }

  // Clear all entries (for reset functionality)
  static async clear(): Promise<void> {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) {
        handleSupabaseError(error, 'clear entries')
      }
    } catch (error) {
      handleSupabaseError(error, 'clear entries')
      throw error
    }
  }
}