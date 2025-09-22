// src/lib/supabase/persons.ts
import { supabase, handleSupabaseError } from './client'
import type { Person } from '@/lib/schemas/zod'

export class PersonsService {
  // Load all persons
  static async load(): Promise<Person[]> {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        handleSupabaseError(error, 'load persons')
      }

      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
      }))
    } catch (error) {
      handleSupabaseError(error, 'load persons')
      return []
    }
  }

  // Add new person
  static async add(name: string): Promise<Person> {
    try {
      // Check if person already exists
      const { data: existing } = await supabase
        .from('persons')
        .select('*')
        .ilike('name', name.trim())
        .single()

      if (existing) {
        throw new Error(`Person "${name}" existiert bereits`)
      }

      const { data, error } = await supabase
        .from('persons')
        .insert({ name: name.trim() })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'add person')
      }

      return {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
      }
    } catch (error) {
      handleSupabaseError(error, 'add person')
      throw error
    }
  }

  // Rename person
  static async rename(id: string, name: string): Promise<void> {
    try {
      const trimmedName = name.trim()
      if (!trimmedName) {
        throw new Error('Name darf nicht leer sein')
      }

      // Check if name already exists (except for current person)
      const { data: existing } = await supabase
        .from('persons')
        .select('*')
        .ilike('name', trimmedName)
        .neq('id', id)
        .single()

      if (existing) {
        throw new Error(`Person "${trimmedName}" existiert bereits`)
      }

      const { error } = await supabase
        .from('persons')
        .update({ name: trimmedName })
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'rename person')
      }
    } catch (error) {
      handleSupabaseError(error, 'rename person')
      throw error
    }
  }

  // Delete person
  static async remove(id: string): Promise<void> {
    try {
      // Check if person has entries
      const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('id, payload')
        .eq('type', 'work')

      if (entriesError) {
        handleSupabaseError(entriesError, 'check person entries')
      }

      const hasEntries = entries?.some(entry => {
        const payload = entry.payload as any
        return payload?.personId === id
      })

      if (hasEntries) {
        const confirmed = confirm(
          'Diese Person hat bereits Arbeitszeit-Einträge. Wirklich löschen? ' +
          'Die Einträge bleiben erhalten, aber die Person-Verknüpfung geht verloren.'
        )
        if (!confirmed) return
      }

      const { error } = await supabase
        .from('persons')
        .delete()
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'delete person')
      }
    } catch (error) {
      handleSupabaseError(error, 'delete person')
      throw error
    }
  }

  // Bulk operations for migration
  static async bulkAdd(persons: Omit<Person, 'id' | 'createdAt'>[]): Promise<Person[]> {
    try {
      const { data, error } = await supabase
        .from('persons')
        .insert(persons.map(person => ({ name: person.name })))
        .select()

      if (error) {
        handleSupabaseError(error, 'bulk add persons')
      }

      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
      }))
    } catch (error) {
      handleSupabaseError(error, 'bulk add persons')
      throw error
    }
  }

  // Clear all persons
  static async clear(): Promise<void> {
    try {
      const { error } = await supabase
        .from('persons')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) {
        handleSupabaseError(error, 'clear persons')
      }
    } catch (error) {
      handleSupabaseError(error, 'clear persons')
      throw error
    }
  }

  // Create default persons
  static async createDefaults(): Promise<Person[]> {
    const defaultNames = ['Yannik', 'Max', 'Anna', 'Team']
    
    try {
      // Check which ones don't exist yet
      const { data: existing } = await supabase
        .from('persons')
        .select('name')

      const existingNames = new Set(existing?.map(p => p.name) || [])
      const newNames = defaultNames.filter(name => !existingNames.has(name))

      if (newNames.length === 0) {
        return await this.load() // Return existing persons
      }

      const { data, error } = await supabase
        .from('persons')
        .insert(newNames.map(name => ({ name })))
        .select()

      if (error) {
        handleSupabaseError(error, 'create default persons')
      }

      console.log(`${newNames.length} Default-Personen erstellt:`, newNames)
      
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
      }))
    } catch (error) {
      handleSupabaseError(error, 'create default persons')
      throw error
    }
  }
}