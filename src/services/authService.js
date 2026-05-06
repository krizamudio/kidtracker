import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const authService = {

  // Registro de nuevo usuario
  async register(email, password, userData) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    if (userData.nombre) {
      await updateProfile(userCredential.user, { displayName: userData.nombre });
    }

    // Guardar perfil en Firestore
    await setDoc(doc(db, 'usuarios', uid), {
      uid,
      email,
      rol: userData.rol, // 'cuidador' | 'especialista'
      nombre: userData.nombre,
      especialidad: userData.especialidad || null,
      creadoEn: new Date().toISOString(),
    });

    return userCredential.user;
  },

  // Login
  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Logout
  async logout() {
    await signOut(auth);
  },

  // Obtener perfil del usuario
  async getPerfil(uid) {
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },

  // Escuchar cambios de auth
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },
};