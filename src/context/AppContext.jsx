import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, KEYS } from '../hooks/useStorage';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [caregiver, setCaregiver] = useState(null);
  const [child, setChild] = useState(null);
  const [caseConfig, setCaseConfig] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const { perfil } = useAuth();

  // Cargar datos al iniciar
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        savedCaregiver,
        savedChild,
        savedCaseConfig,
        savedRegistros,
        savedOnboarding,
      ] = await Promise.all([
        storage.load(KEYS.CAREGIVER),
        storage.load(KEYS.CHILD),
        storage.load(KEYS.CASE_CONFIG),
        storage.load(KEYS.REGISTROS),
        storage.load(KEYS.ONBOARDING_DONE),
      ]);

      if (savedCaregiver) setCaregiver(savedCaregiver);
      if (savedChild) setChild(savedChild);
      if (savedCaseConfig) setCaseConfig(savedCaseConfig);
      if (savedRegistros) {
        // Deduplicar por id por si hubiera entradas duplicadas en storage
        const seen = new Set();
        const unicos = savedRegistros.filter(r => {
          if (!r.id || seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        setRegistros(unicos);
      }
      if (savedOnboarding) setOnboardingDone(savedOnboarding);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si hay perfil en AuthContext (usuario autenticado), sincronizar al estado local
  useEffect(() => {
    if (perfil) {
      setCaregiver(perfil);
      storage.save(KEYS.CAREGIVER, perfil).catch(() => {});

      // Sincronizar registros pendientes si es cuidador
      if (perfil.rol === 'cuidador') {
        storage.load(KEYS.CHILD).then(savedChild => {
          syncPendingRegistros(perfil.uid, savedChild?.nombre || '');
        }).catch(() => {});
      }
    } else {
      // Si se deslogueó, limpiar caregiver local
      setCaregiver(null);
      storage.remove(KEYS.CAREGIVER).catch(() => {});
    }
  }, [perfil]);

  const updateCaregiver = async (data) => {
  const updated = { ...caregiver, ...data };
  setCaregiver(updated);
  await storage.save(KEYS.CAREGIVER, updated);

  // Sincronizar nombre con Firebase si hay sesión
  try {
    const { getAuth } = await import('firebase/auth');
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      await updateDoc(doc(db, 'usuarios', currentUser.uid), {
        nombre: updated.nombre || '',
        childNombre: child?.nombre || '',
      });
    }
  } catch (error) {
    console.log('Sin sesión, guardado solo local');
  }
};

  const updateChild = async (data) => {
    const updated = { ...child, ...data };
    setChild(updated);
    await storage.save(KEYS.CHILD, updated);

    try {
      const { getAuth } = await import('firebase/auth');
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      const currentUser = getAuth().currentUser;
      if (currentUser && updated.nombre) {
        await updateDoc(doc(db, 'usuarios', currentUser.uid), {
          childNombre: updated.nombre,
        });
      }
    } catch (e) {
      // Sin sesión o sin conexión, solo local
    }
  };

  const updateCaseConfig = async (data) => {
    const updated = { ...caseConfig, ...data };
    setCaseConfig(updated);
    await storage.save(KEYS.CASE_CONFIG, updated);
  };

  const addRegistro = async (registro) => {
    const updated = [registro, ...registros];
    setRegistros(updated);
    await storage.save(KEYS.REGISTROS, updated);

    try {
      const { getAuth } = await import('firebase/auth');
      const { registroService } = await import('../services/registroService');
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        await registroService.crear(registro, currentUser.uid, child?.nombre || '');
        const synced = updated.map(r =>
          r.id === registro.id ? { ...r, _synced: true } : r
        );
        setRegistros(synced);
        await storage.save(KEYS.REGISTROS, synced);
      }
    } catch (error) {
      console.error('[Firebase] Error guardando registro:', error.message);
    }
  };

  // Sincronización bidireccional: Firestore es fuente de verdad.
  // - Sube locales sin sincronizar
  // - Elimina locales que ya no existen en Firestore
  // - Agrega a local los que están en Firestore pero no localmente
  const syncPendingRegistros = async (uid, childNombre, showResult = false) => {
    const { Alert } = await import('react-native');
    try {
      const { registroService } = await import('../services/registroService');
      const localGuardados = await storage.load(KEYS.REGISTROS) || [];

      // 1. Subir los que no han llegado a Firestore
      const pendientes = localGuardados.filter(r => !r._synced);
      for (const r of pendientes) {
        try {
          await registroService.crear(r, uid, childNombre || '');
        } catch (e) {
          // Si falla la subida, se mantiene local sin _synced
        }
      }

      // 2. Obtener lista definitiva desde Firestore
      const enFirestore = await registroService.getRegistrosCuidador(uid);
      const firestoreIds = new Set(enFirestore.map(r => r.id));

      // 3. Conservar locales que aún no se subieron (pendientes fallidos)
      const pendientesFallidos = localGuardados.filter(r => !r._synced && !firestoreIds.has(r.id));

      // 4. Lista final: lo que está en Firestore + pendientes que no llegaron
      const final = [
        ...enFirestore.map(r => ({ ...r, _synced: true })),
        ...pendientesFallidos,
      ].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

      setRegistros(final);
      await storage.save(KEYS.REGISTROS, final);

      if (showResult) {
        Alert.alert('Sincronización ✅', `${final.length} registro(s) en total.`);
      }
    } catch (error) {
      if (showResult) Alert.alert('Error de sync', error.message || 'Error desconocido');
      console.error('[Sync]', error.message);
    }
  };

  const deleteRegistro = async (id) => {
    const updated = registros.filter(r => r.id !== id);
    setRegistros(updated);
    await storage.save(KEYS.REGISTROS, updated);

    try {
      const { getAuth } = await import('firebase/auth');
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const firestoreId = `${currentUser.uid}_${id}`;
        await deleteDoc(doc(db, 'registros', firestoreId));
      }
    } catch (e) {
      // Sin sesión o el doc no existía en Firestore
    }
  };

  const completeOnboarding = async () => {
    setOnboardingDone(true);
    await storage.save(KEYS.ONBOARDING_DONE, true);
  };

  const resetApp = async () => {
    await storage.clearAll();
    setCaregiver(null);
    setChild(null);
    setCaseConfig(null);
    setRegistros([]);
    setOnboardingDone(false);
  };

  return (
    <AppContext.Provider value={{
      caregiver, updateCaregiver,
      child, updateChild,
      caseConfig, updateCaseConfig,
      registros, addRegistro, deleteRegistro,
      onboardingDone, completeOnboarding,
      loading,
      resetApp,
      syncPendingRegistros,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider');
  return context;
};