import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useApp } from '../src/context/AppContext';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { loading, onboardingDone } = useApp();
  const { loadingAuth, user, perfil } = useAuth();

  if (loading || loadingAuth) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si hay usuario logueado
  if (user && perfil) {
    if (perfil.rol === 'especialista') {
      return <Redirect href="/(especialista)/home" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  // Sin sesión — flujo normal
  if (onboardingDone) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});