import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
  TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';
import { useApp } from '../../src/context/AppContext';

const { width } = Dimensions.get('window');

const SEXOS = [
  { id: 'nino', label: 'Niño', emoji: '👦' },
  { id: 'nina', label: 'Niña', emoji: '👧' },
  { id: 'otro', label: 'Otro', emoji: '🌈' },
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

export default function ChildProfileScreen() {
  const { updateChild } = useApp();

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [residencia, setResidencia] = useState('');
  const [escuela, setEscuela] = useState('');
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
    if (!edad.trim()) newErrors.edad = 'La edad es requerida';
    else if (isNaN(edad) || Number(edad) < 0 || Number(edad) > 18)
      newErrors.edad = 'Ingresa una edad válida (0-18)';
    if (!sexo) newErrors.sexo = 'Selecciona una opción';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateChild({
      nombre: nombre.trim(),
      edad: Number(edad),
      sexo,
      residencia: residencia.trim(),
      escuela: escuela.trim(),
    });
    router.push('/(onboarding)/case-config');
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
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
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
              <Text style={styles.iconEmoji}>👶</Text>
            </View>
            <Text style={styles.title}>Perfil del</Text>
            <Text style={styles.titleAccent}>Niño/a</Text>
            <Text style={styles.subtitle}>
              Esta información nos ayuda a personalizar el seguimiento.
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>

            <InputField
              label="Nombre del niño/a"
              value={nombre}
              onChangeText={setNombre}
              placeholder="¿Cómo se llama?"
            />
            {errors.nombre && <Text style={styles.errorText}>⚠️ {errors.nombre}</Text>}

            {/* Edad y Sexo en fila */}
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <InputField
                  label="Edad"
                  value={edad}
                  onChangeText={setEdad}
                  placeholder="Años"
                  keyboardType="numeric"
                />
                {errors.edad && <Text style={styles.errorText}>⚠️ {errors.edad}</Text>}
              </View>

              <View style={styles.rowItem}>
                <Text style={styles.selectorLabel}>Sexo</Text>
                <View style={styles.sexoRow}>
                  {SEXOS.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.sexoItem, sexo === s.id && styles.sexoItemActive]}
                      onPress={() => setSexo(s.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.sexoEmoji}>{s.emoji}</Text>
                      <Text style={[
                        styles.sexoText,
                        sexo === s.id && styles.sexoTextActive
                      ]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.sexo && <Text style={styles.errorText}>⚠️ {errors.sexo}</Text>}
              </View>
            </View>

            <InputField
              label="Lugar de residencia"
              value={residencia}
              onChangeText={setResidencia}
              placeholder="Ciudad o municipio (opcional)"
            />

            <InputField
              label="Escuela / Contexto escolar"
              value={escuela}
              onChangeText={setEscuela}
              placeholder="Nombre de la escuela (opcional)"
            />

          </View>

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            <Button
              title="Continuar →"
              onPress={handleContinue}
              size="lg"
              style={styles.mainButton}
            />
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
    gap: spacing.xs,
  },
  selectorLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  sexoRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sexoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 2,
  },
  sexoItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sexoEmoji: { fontSize: 18 },
  sexoText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  sexoTextActive: {
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
});