// src/stores/auth.ts
import { defineStore } from 'pinia'
import { auth } from '@/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    initialized: false,
    loading: false,
    error: '' as string,
  }),
  getters: {
    isLoggedIn(state): boolean {
      return !!state.user
    },
  },
  actions: {
    // Wires up Firebase's auth listener exactly once and resolves as soon as
    // we know whether someone is already signed in (e.g. from a previous
    // session). The router guard awaits this before deciding to redirect.
    initAuthListener(): Promise<void> {
      if (this.initialized) return Promise.resolve()
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (firebaseUser) => {
          this.user = firebaseUser
          if (!this.initialized) {
            this.initialized = true
            resolve()
          }
        })
      })
    },

    async login(email: string, password: string): Promise<boolean> {
      this.loading = true
      this.error = ''
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
        this.user = cred.user
        return true
      } catch (err) {
        this.error = mapAuthError(err)
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await signOut(auth)
      this.user = null
    },
  },
})

function mapAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address doesn\u2019t look right.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return 'Something went wrong signing in. Please try again.'
  }
}
