import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';
import { useApp } from '../../src/context/AppContext';

const InputField = ({ label, value, onChangeText, placeholder, secureTextEntry }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.container}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={[inputStyles.input, focused && inputStyles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        keyboardType={secureTextEntry ? 'default' : 'email-address'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.primary,
    elevation: 2,
  },
});

export default function LoginScreen() {
  const { login } = useAuth();
  const { onboardingDone, child, updateChild } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cuidador');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { perfil } = await login(email.trim(), password);

      // Validar que el rol de la cuenta coincida con el rol seleccionado
      if (perfil?.rol && perfil.rol !== rol) {
        Alert.alert('Rol incorrecto', `La cuenta que ingresaste es de tipo "${perfil.rol}" y no coincide con "${rol}" seleccionado.`);
        setLoading(false);
        return;
      }

      // Si en Firestore el perfil trae datos del niño, sincronizarlos localmente
      if (perfil?.child) {
        try { await updateChild(perfil.child); } catch (e) { /* ignore */ }
      }

      // Redirigir según rol y si completó onboarding
      if (perfil?.rol === 'especialista') {
        router.replace('/(especialista)/home');
      } else {
        const hasChild = !!child;
        const doneOnboarding = !!onboardingDone;

        if (hasChild || doneOnboarding || perfil?.nombre) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(onboarding)/register');
        }
      }
    } catch (error) {
      let mensaje = 'Error al iniciar sesión. Verifica tus datos.';
      if (error.code === 'auth/user-not-found') mensaje = 'No existe una cuenta con este correo.';
      if (error.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta.';
      if (error.code === 'auth/invalid-email') mensaje = 'Correo inválido.';
      if (error.code === 'auth/too-many-requests') mensaje = 'Demasiados intentos. Intenta más tarde.';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCircle} />
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>👦</Text>
            </View>
            <Text style={styles.appName}>KidTracker</Text>
          </View>
        </View>

        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>

          {/* Título */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>¡Bienvenido de vuelta!</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Selector de rol */}
          <View style={styles.rolContainer}>
            <Text style={styles.rolLabel}>Iniciar como:</Text>
            <View style={styles.rolRow}>
              <TouchableOpacity
                style={[
                  styles.rolChip,
                  rol === 'cuidador' ? styles.rolChipActive : styles.rolChipSecondary,
                ]}
                onPress={() => setRol('cuidador')}
                activeOpacity={0.7}
              >
                <Text style={styles.rolEmoji}>👨‍👩‍👧</Text>
                <Text style={[styles.rolText, rol === 'cuidador' && styles.rolTextActive]}>Cuidador</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rolChip,
                  rol === 'especialista' ? styles.rolChipActive : styles.rolChipSecondary,
                ]}
                onPress={() => setRol('especialista')}
                activeOpacity={0.7}
              >
                <Text style={styles.rolEmoji}>🧑‍⚕️</Text>
                <Text style={[styles.rolText, rol === 'especialista' && styles.rolTextActive]}>Especialista</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <InputField
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder={rol === 'especialista' ? 'correo@especialista.com' : 'tucorreo@ejemplo.com'}
            />
            <View>
              <InputField
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.showPassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? '🙈 Ocultar' : '👁️ Mostrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            <Button
              title={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.mainButton}
            />
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerLink}> Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxxxl,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxxl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -80,
    right: -60,
  },
  logoContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoEmoji: { fontSize: 48 },
  appName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
  },
  titleContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  rolContainer: {
    gap: spacing.sm,
  },
  rolLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  rolRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rolChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  rolChipSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  rolChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  rolEmoji: { fontSize: 20 },
  rolText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  rolTextActive: {
    color: colors.primary,
  },
  form: { gap: spacing.lg },
  showPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginRight: spacing.xs,
  },
  showPasswordText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  buttonsContainer: {
    gap: spacing.md,
    alignItems: 'center',
  },
  mainButton: { width: '100%' },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});