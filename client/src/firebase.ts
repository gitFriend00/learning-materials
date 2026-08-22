// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { isSupported, getAnalytics } from 'firebase/analytics'

const ApiKey = import.meta.env.VITE_API_CODE

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: ApiKey,
  authDomain: 'materials-d0ceb.firebaseapp.com',
  projectId: 'materials-d0ceb',
  storageBucket: 'materials-d0ceb.firebasestorage.app',
  messagingSenderId: '529684989811',
  appId: '1:529684989811:web:94714a9ef8ace79056a706',
  measurementId: 'G-S2T7T65JFZ',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Firestore is what stores/stickerJar.ts uses to save students + stickers
export const db = getFirestore(app)

// Auth is what stores/auth.ts uses for email/password sign-in
export const auth = getAuth(app)


isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app)
  })
  .catch(() => {

  })

export default app