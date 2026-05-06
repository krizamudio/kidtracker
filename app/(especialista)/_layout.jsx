import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function EspecialistaLayout() {
  const { user, perfil, loadingAuth } = useAuth();

  if (loadingAuth) return null;

  if (!user || !perfil || perfil.rol !== 'especialista') {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="paciente" />
    </Stack>
  );
}
