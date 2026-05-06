import {
  collection, query, where, doc, deleteDoc,
  setDoc, getDocsFromServer,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Elimina duplicados por campo `id` (puede haber dos docs Firestore del mismo registro)
const deduplicarPorId = (docs) => {
  const seen = new Set();
  return docs
    .filter(r => {
      if (!r.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
};

export const registroService = {

  // Subir registro a Firestore (idempotente: usa ID fijo para evitar duplicados)
  async crear(registro, cuidadorId, childNombre) {
    const docId = `${cuidadorId}_${registro.id}`;
    await setDoc(doc(db, 'registros', docId), {
      ...registro,
      cuidadorId,
      childNombre,
      creadoEn: new Date().toISOString(),
    });
    return docId;
  },

  // Obtener registros de un cuidador
  async getRegistrosCuidador(cuidadorId) {
    const q = query(
      collection(db, 'registros'),
      where('cuidadorId', '==', cuidadorId)
    );
    const snapshot = await getDocsFromServer(q);
    return deduplicarPorId(
      snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }))
    );
  },

  // Obtener registros de un paciente (para especialista)
  async getRegistrosPaciente(cuidadorId) {
    const q = query(
      collection(db, 'registros'),
      where('cuidadorId', '==', cuidadorId)
    );
    const snapshot = await getDocsFromServer(q);
    return deduplicarPorId(
      snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }))
    );
  },

  // Eliminar registro
  async eliminar(firestoreId) {
    await deleteDoc(doc(db, 'registros', firestoreId));
  },
};