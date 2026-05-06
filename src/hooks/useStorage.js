import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CAREGIVER: '@kidtracker_caregiver',
  CHILD: '@kidtracker_child',
  CASE_CONFIG: '@kidtracker_case_config',
  REGISTROS: '@kidtracker_registros',
  ONBOARDING_DONE: '@kidtracker_onboarding_done',
};

export const storage = {
  // Guardar
  async save(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error guardando:', error);
      return false;
    }
  },

  // Leer
  async load(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error cargando:', error);
      return null;
    }
  },

  // Eliminar
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error eliminando:', error);
      return false;
    }
  },

  // Limpiar todo
  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
      return true;
    } catch (error) {
      console.error('Error limpiando:', error);
      return false;
    }
  },
};

export { KEYS };