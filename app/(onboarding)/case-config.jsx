import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';
import { useApp } from '../../src/context/AppContext';
import { MOTIVOS_USO, CATEGORIAS_DIAGNOSTICO } from '../../src/data/diagnosticos';

export default function CaseConfigScreen() {
  const { updateCaseConfig } = useApp();

  const [motivo, setMotivo] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleCategoria = (id) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!motivo) newErrors.motivo = 'Selecciona el motivo de uso';
    if (motivo !== 'monitoreo' && categoriasSeleccionadas.length === 0)
      newErrors.categorias = 'Selecciona al menos una categoría';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinish = () => {
    if (!validate()) return;
    updateCaseConfig({ motivo, categorias: categoriasSeleccionadas });
    router.replace('/(tabs)/home');
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
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>

          {/* Título */}
          <View style={styles.titleContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>⚙️</Text>
            </View>
            <Text style={styles.title}>Configuración</Text>
            <Text style={styles.titleAccent}>del Caso</Text>
            <Text style={styles.subtitle}>
              Esta información nos ayuda a mostrarte las conductas más relevantes.
            </Text>
          </View>

          {/* Motivo de uso */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Cuál es tu motivo de uso?</Text>
            <View style={styles.motivoList}>
              {MOTIVOS_USO.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.motivoItem, motivo === m.id && styles.motivoItemActive]}
                  onPress={() => setMotivo(m.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.motivoLeft}>
                    <Text style={styles.motivoEmoji}>{m.emoji}</Text>
                    <Text style={[
                      styles.motivoText,
                      motivo === m.id && styles.motivoTextActive
                    ]}>
                      {m.label}
                    </Text>
                  </View>
                  <View style={[
                    styles.radioOuter,
                    motivo === m.id && styles.radioOuterActive
                  ]}>
                    {motivo === m.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {errors.motivo && <Text style={styles.errorText}>⚠️ {errors.motivo}</Text>}
          </View>

          {/* Categorías diagnósticas — solo si no es monitoreo general */}
          {motivo && motivo !== 'monitoreo' && (
            <Animated.View style={styles.section}>
              <Text style={styles.sectionTitle}>Selección de diagnóstico</Text>
              <Text style={styles.sectionSubtitle}>Puedes seleccionar varias categorías</Text>
              <View style={styles.categoriasGrid}>
                {CATEGORIAS_DIAGNOSTICO.map((cat) => {
                  const selected = categoriasSeleccionadas.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoriaItem, selected && styles.categoriaItemActive]}
                      onPress={() => toggleCategoria(cat.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.categoriaCheck}>
                        {selected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                      <Text style={[
                        styles.categoriaText,
                        selected && styles.categoriaTextActive
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.categorias && <Text style={styles.errorText}>⚠️ {errors.categorias}</Text>}
            </Animated.View>
          )}

          {/* Nota informativa */}
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>💡</Text>
            <Text style={styles.infoText}>
              Puedes cambiar esta configuración en cualquier momento desde el perfil.
            </Text>
          </View>

          {/* Botón */}
          <View style={styles.buttonsContainer}>
            <Button
              title="¡Empezar! 🎉"
              onPress={handleFinish}
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  motivoList: {
    gap: spacing.sm,
  },
  motivoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  motivoItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  motivoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  motivoEmoji: { fontSize: 22 },
  motivoText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  motivoTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  categoriasGrid: {
    gap: spacing.sm,
  },
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  categoriaItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  categoriaCheck: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkmark: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  categoriaEmoji: { fontSize: 20 },
  categoriaText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  categoriaTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoEmoji: { fontSize: 22 },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  buttonsContainer: {
    alignItems: 'center',
  },
  mainButton: { width: '100%' },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },
});