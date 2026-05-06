import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCHLSBQ42qMwSLQVAs-eiN62u4V8A_pmN0",
  authDomain: "kidtracker-282aa.firebaseapp.com",
  projectId: "kidtracker-282aa",
  storageBucket: "kidtracker-282aa.firebasestorage.app",
  messagingSenderId: "T362755272484",
  appId: "1:362755272484:web:f0642260c17419ee1acdb1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);

// initializeAuth con persistencia nativa para iOS/Android (evita "native module doesn't exist")
// El try/catch maneja el caso de hot-reload donde ya está inicializado
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(app);
}
export const auth = _auth;