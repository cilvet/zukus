import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './client'

export type ZukusAuthState = {
  session: Session | null
  user: User | null
  isLoading: boolean
}

// Global singleton state
let authState: ZukusAuthState = {
  session: null,
  user: null,
  isLoading: true,
}

// Listeners for state changes
const authListeners: Set<(state: ZukusAuthState) => void> = new Set()

function notifyListeners(): void {
  for (const listener of authListeners) {
    listener(authState)
  }
}

function updateAuthState(updates: Partial<ZukusAuthState>): void {
  authState = { ...authState, ...updates }
  notifyListeners()
}

/**
 * Initialize auth state. Call this once in Hooks.once('ready').
 */
export async function initAuth(): Promise<void> {
  // Get initial session from localStorage
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.warn('[Zukus] Failed to get session:', error.message)
  }

  updateAuthState({
    session: data.session ?? null,
    user: data.session?.user ?? null,
    isLoading: false,
  })

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, nextSession) => {
    updateAuthState({
      session: nextSession ?? null,
      user: nextSession?.user ?? null,
      isLoading: false,
    })
  })
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw error
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

/**
 * Get the current auth state.
 */
export function getAuthState(): ZukusAuthState {
  return authState
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: (state: ZukusAuthState) => void): () => void {
  authListeners.add(callback)
  // Call immediately with current state
  callback(authState)

  return () => {
    authListeners.delete(callback)
  }
}

/**
 * Check if user is logged in.
 */
export function isLoggedIn(): boolean {
  return authState.session !== null
}

/**
 * Get current user email.
 */
export function getUserEmail(): string | null {
  return authState.user?.email ?? null
}
