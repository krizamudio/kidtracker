import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Dimensions, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';
import { useApp } from '../../src/context/AppContext';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

const RELACIONES = [
  { id: 'mama', label: 'Mamá', emoji: '👩' },
  { id: 'papa', label: 'Papá', emoji: '👨' },
  { id: 'abuelo', label: 'Abuelo/a', emoji: '👴' },
  { id: 'tutor', label: 'Tutor/a', emoji: '🧑' },
  { id: 'otro', label: 'Otro', emoji: '💛' },
];

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => {
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
        keyboardType={keyboardType}
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
});

export default function RegisterScreen() {
  const { updateCaregiver } = useApp();
  const { perfil } = useAuth();
  const [nombre, setNombre] = useState(perfil?.nombre || '');
  const [relacion, setRelacion] = useState('');
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!relacion) newErrors.relacion = 'Selecciona tu relación con el niño';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateCaregiver({ nombre: nombre.trim(), relacion });
    router.push('/(onboarding)/child-profile');
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>

          {/* Título */}
          <View style={styles.titleContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>👩‍👦</Text>
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.titleAccent}>del Cuidador</Text>
            <Text style={styles.subtitle}>
              Cuéntanos un poco sobre ti para personalizar tu experiencia.
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <InputField
              label="Tu nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholder="¿Cómo te llamas?"
            />
            {errors.nombre && <Text style={styles.errorText}>⚠️ {errors.nombre}</Text>}

            {/* Selector de relación */}
            <View style={styles.relacionContainer}>
              <Text style={styles.relacionLabel}>
                {nombre.trim() ? `Tu relación con el niño, ${nombre.trim()}` : 'Relación con el niño/a'}
              </Text>
              <View style={styles.relacionGrid}>
                {RELACIONES.map((rel) => (
                  <TouchableOpacity
                    key={rel.id}
                    style={[
                      styles.relacionItem,
                      relacion === rel.id && styles.relacionItemActive,
                    ]}
                    onPress={() => setRelacion(rel.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.relacionEmoji}>{rel.emoji}</Text>
                    <Text style={[
                      styles.relacionText,
                      relacion === rel.id && styles.relacionTextActive,
                    ]}>
                      {rel.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.relacion && <Text style={styles.errorText}>⚠️ {errors.relacion}</Text>}
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            <Button
              title="Continuar →"
              onPress={handleContinue}
              size="lg"
              style={styles.mainButton}
            />
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
              <Text style={styles.skipText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: typography.sizes.xl,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  titleContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconEmoji: { fontSize: 40 },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  relacionContainer: {
    gap: spacing.sm,
  },
  relacionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  relacionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  relacionItem: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  relacionItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  relacionEmoji: { fontSize: 24 },
  relacionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  relacionTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  buttonsContainer: {
    gap: spacing.md,
    alignItems: 'center',
  },
  mainButton: { width: '100%' },
  skipText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});