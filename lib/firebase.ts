import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Config pública do Firebase — chaves NEXT_PUBLIC são expostas no client por design.
// A segurança fica nas Firestore Rules, não em esconder estas chaves.
const firebaseConfig = {
  apiKey: 'AIzaSyCeFDQ6lxaJT3wC4LNqC8TM1ap2FtRSH2E',
  authDomain: 'dasilva-vidros.firebaseapp.com',
  projectId: 'dasilva-vidros',
  storageBucket: 'dasilva-vidros.firebasestorage.app',
  messagingSenderId: '940122303490',
  appId: '1:940122303490:web:b0a529525e175f4e868b1b',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
