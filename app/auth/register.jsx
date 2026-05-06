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

const ROLES = [
  { id: 'cuidador', label: 'Cuidador/Padre', emoji: '👨‍👩‍👧', desc: 'Registro y seguimiento diario' },
  { id: 'especialista', label: 'Especialista', emoji: '🧑‍⚕️', desc: 'Psicólogo, Psiquiatra, Terapeuta' },
];

const ESPECIALIDADES = [
  'Psicología clínica',
  'Psiquiatría infantil',
  'Neurología pediátrica',
  'Terapia ocupacional',
  'Fonoaudiología',
  'Neuropediatría',
  'Otro',
];

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
        keyboardType={secureTextEntry ? 'default' : label.includes('orreo') ? 'email-address' : 'default'}
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const { resetApp } = useApp();

  const [rol, setRol] = useState('cuidador');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre es requerido'); return false; }
    if (!email.trim()) { Alert.alert('Error', 'El correo es requerido'); return false; }
    if (password.length < 6) { Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres'); return false; }
    if (password !== confirmPassword) { Alert.alert('Error', 'Las contraseñas no coinciden'); return false; }
    if (rol === 'especialista' && !especialidad) { Alert.alert('Error', 'Selecciona tu especialidad'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim(), password, {
        nombre: nombre.trim(),
        rol,
        especialidad: rol === 'especialista' ? especialidad : null,
      });

      await resetApp();

      if (rol === 'especialista') {
        router.replace('/(especialista)/home');
      } else {
        router.replace('/(onboarding)/register');
      }
    } catch (error) {
      let mensaje = 'Error al crear la cuenta.';
      if (error.code === 'auth/email-already-in-use') mensaje = 'Este correo ya está registrado.';
      if (error.code === 'auth/invalid-email') mensaje = 'Correo inválido.';
      if (error.code === 'auth/weak-password') mensaje = 'Contraseña muy débil.';
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>

          {/* Selector de rol */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Cómo usarás la app?</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.rolCard, rol === r.id && styles.rolCardActive]}
                  onPress={() => setRol(r.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rolEmoji}>{r.emoji}</Text>
                  <Text style={[styles.rolLabel, rol === r.id && styles.rolLabelActive]}>
                    {r.label}
                  </Text>
                  <Text style={styles.rolDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Datos personales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos personales</Text>
            <View style={styles.form}>
              <InputField
                label="Nombre completo"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
              />
              <InputField
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                placeholder="tucorreo@ejemplo.com"
              />
              <InputField
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
              />
              <InputField
                label="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                secureTextEntry
              />
            </View>
          </View>

          {/* Especialidad — solo si es especialista */}
          {rol === 'especialista' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Especialidad</Text>
              <View style={styles.especialidadesGrid}>
                {ESPECIALIDADES.map(esp => (
                  <TouchableOpacity
                    key={esp}
                    style={[
                      styles.especialidadChip,
                      especialidad === esp && styles.especialidadChipActive,
                    ]}
                    onPress={() => setEspecialidad(esp)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.especialidadText,
                      especialidad === esp && styles.especialidadTextActive,
                    ]}>
                      {esp}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            <Button
              title={loading ? 'Creando cuenta...' : 'Crear Cuenta 🎉'}
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={styles.mainButton}
            />
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}> Inicia sesión</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: typography.sizes.xl,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  rolesGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rolCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  rolCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rolEmoji: { fontSize: 32 },
  rolLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  rolLabelActive: { color: colors.primary },
  rolDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  form: { gap: spacing.md },
  especialidadesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  especialidadChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  especialidadChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  especialidadText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  especialidadTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  buttonsContainer: {
    gap: spacing.md,
    alignItems: 'center',
  },
  mainButton: { width: '100%' },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});