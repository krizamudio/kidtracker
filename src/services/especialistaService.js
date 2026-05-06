import {
  collection, getDocs, query, where,
  doc, setDoc, deleteDoc, getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const especialistaService = {

  // Buscar paciente por nombre o ID
  async buscarPaciente(termino) {
    const q = query(
      collection(db, 'usuarios'),
      where('rol', '==', 'cuidador')
    );
    const snapshot = await getDocs(q);
    const todos = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));

    // Filtrar por nombre o uid
    const terminoLower = termino.toLowerCase();
    return todos.filter(u =>
      u.nombre?.toLowerCase().includes(terminoLower) ||
      u.uid?.toLowerCase().includes(terminoLower) ||
      u.childNombre?.toLowerCase().includes(terminoLower)
    );
  },

  // Vincular especialista con cuidador
  async vincular(especialistaId, cuidadorId) {
    const vinculacionId = `${especialistaId}_${cuidadorId}`;
    await setDoc(doc(db, 'vinculaciones', vinculacionId), {
      especialistaId,
      cuidadorId,
      creadoEn: new Date().toISOString(),
    });
  },

  // Desvincular
  async desvincular(especialistaId, cuidadorId) {
    const vinculacionId = `${especialistaId}_${cuidadorId}`;
    await deleteDoc(doc(db, 'vinculaciones', vinculacionId));
  },

  // Obtener pacientes vinculados
  async getMisPacientes(especialistaId) {
    const q = query(
      collection(db, 'vinculaciones'),
      where('especialistaId', '==', especialistaId)
    );
    const snapshot = await getDocs(q);
    const vinculaciones = snapshot.docs.map(d => d.data());

    // Obtener perfiles de cuidadores
    const pacientes = await Promise.all(
      vinculaciones.map(async v => {
        const userDoc = await getDoc(doc(db, 'usuarios', v.cuidadorId));
        return userDoc.exists()
          ? { uid: userDoc.id, ...userDoc.data() }
          : null;
      })
    );

    return pacientes.filter(Boolean);
  },
};