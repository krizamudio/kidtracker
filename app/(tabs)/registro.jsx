import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { ConductaSelector } from '../../src/components/forms/ConductaSelector';
import { useApp } from '../../src/context/AppContext';
import { CONDUCTAS_POR_CATEGORIA } from '../../src/data/conductas';

const INTENSIDADES = [
  { id: 'leve',     label: 'Leve',     emoji: '🟢', color: colors.good },
  { id: 'moderada', label: 'Moderada', emoji: '🟡', color: '#FCD34D' },
  { id: 'grave',    label: 'Grave',    emoji: '🔴', color: colors.difficult },
];

const ESTADO_DIA = [
  { id: 'bueno',   label: 'Buen día', emoji: '😊', color: colors.good },
  { id: 'regular', label: 'Regular',  emoji: '😐', color: '#FCD34D' },
  { id: 'dificil', label: 'Difícil',  emoji: '😔', color: colors.difficult },
];

const FRECUENCIAS = [
  { id: '1',   label: '1 vez' },
  { id: '2-3', label: '2-3 veces' },
  { id: '4-6', label: '4-6 veces' },
  { id: '7+',  label: '7+ veces' },
];

const SectionHeader = ({ emoji, title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionEmoji}>{emoji}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

const ChipSelector = ({ options, selected, onSelect }) => (
  <View style={styles.chipRow}>
    {options.map((opt) => {
      const isSelected = selected === opt.id;
      return (
        <TouchableOpacity
          key={opt.id}
          style={[
            styles.chip,
            isSelected && styles.chipActive,
            opt.color && isSelected && { backgroundColor: opt.color + '30', borderColor: opt.color },
          ]}
          onPress={() => onSelect(opt.id)}
          activeOpacity={0.7}
        >
          {opt.emoji && <Text style={styles.chipEmoji}>{opt.emoji}</Text>}
          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const TextAreaField = ({ label, value, onChangeText, placeholder, maxLength = 300 }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldContainer}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        style={[styles.textArea, focused && styles.textAreaFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        multiline
        numberOfLines={3}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
    </View>
  );
};

export default function RegistroScreen() {
  const { child, caseConfig, addRegistro } = useApp();
  const { tipo } = useLocalSearchParams();
  const esInmediato = tipo === 'inmediato';

  const [estadoDia, setEstadoDia] = useState('');
  const [intensidad, setIntensidad] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detonante, setDetonante] = useState('');
  const [manejoUtilizado, setManejoUtilizado] = useState('');
  const [conductasSeleccionadas, setConductasSeleccionadas] = useState([]);
  const [saving, setSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Obtener categorías configuradas del perfil
  const categoriasActivas = (caseConfig?.categorias || [])
    .map(id => CONDUCTAS_POR_CATEGORIA[id])
    .filter(Boolean);

  const handleToggleConducta = (conductaId) => {
    setConductasSeleccionadas(prev =>
      prev.includes(conductaId)
        ? prev.filter(id => id !== conductaId)
        : [...prev, conductaId]
    );
  };

  const resetForm = () => {
    setEstadoDia('');
    setIntensidad('');
    setFrecuencia('');
    setObservaciones('');
    setDetonante('');
    setManejoUtilizado('');
    setConductasSeleccionadas([]);
  };

  const handleGuardar = () => {
    if (!estadoDia) {
      Alert.alert(
        'Campo requerido',
        'Por favor indica cómo estuvo el día de ' + child?.nombre
      );
      return;
    }

    setSaving(true);

    const nuevoRegistro = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      tipo: esInmediato ? 'inmediato' : 'diario',
      estado: estadoDia,
      intensidad,
      frecuencia,
      observaciones,
      detonante,
      manejoUtilizado,
      conductasSeleccionadas,
      hora: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit', minute: '2-digit'
      }),
    };

    setTimeout(() => {
      addRegistro(nuevoRegistro);
      setSaving(false);
      Alert.alert(
        '¡Registro guardado! 🎉',
        `${conductasSeleccionadas.length > 0
          ? `Se registraron ${conductasSeleccionadas.length} conducta(s) de ${child?.nombre}.`
          : `El registro de ${child?.nombre} fue guardado.`}`,
        [{ text: 'Aceptar', onPress: resetForm }]
      );
    }, 800);
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
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.headerTitle}>
              {esInmediato ? '⚡ Registro Rápido' : '📋 Registro Diario'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {child?.nombre} • {new Date().toLocaleDateString('es-MX', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </Text>
            <Text style={styles.headerTipo}>
              {esInmediato
                ? 'Captura rápida del momento actual'
                : 'Resumen completo del día'}
            </Text>
            {conductasSeleccionadas.length > 0 && (
              <View style={styles.conductasBadge}>
                <Text style={styles.conductasBadgeText}>
                  ✓ {conductasSeleccionadas.length} conducta{conductasSeleccionadas.length > 1 ? 's' : ''} seleccionada{conductasSeleccionadas.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        <Animated.View style={[
          styles.body,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>

          {/* 1. Estado general */}
          <Card>
            <SectionHeader emoji="🌅" title="¿Cómo estuvo el día?" />
            <ChipSelector
              options={ESTADO_DIA}
              selected={estadoDia}
              onSelect={setEstadoDia}
            />
          </Card>

          {/* 2. Nota rápida (solo inmediato) */}
          {esInmediato && (
            <Card>
              <SectionHeader emoji="📝" title="Nota rápida" subtitle="Opcional" />
              <TextAreaField
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="¿Qué está pasando en este momento?"
                maxLength={200}
              />
            </Card>
          )}

          {/* Secciones del registro diario */}
          {!esInmediato && (
            <>
              {/* Conductas específicas por diagnóstico */}
              {categoriasActivas.length > 0 && (
                <Card>
                  <SectionHeader
                    emoji="🔍"
                    title="Conductas Observadas"
                    subtitle="Selecciona las que observaste hoy"
                  />
                  <View style={styles.conductasContainer}>
                    {categoriasActivas.map(categoria => (
                      <ConductaSelector
                        key={categoria.label}
                        categoria={categoria}
                        selectedIds={conductasSeleccionadas}
                        onToggle={handleToggleConducta}
                      />
                    ))}
                  </View>
                </Card>
              )}

              {/* Intensidad */}
              <Card>
                <SectionHeader emoji="📊" title="Intensidad general" />
                <ChipSelector
                  options={INTENSIDADES}
                  selected={intensidad}
                  onSelect={setIntensidad}
                />
              </Card>

              {/* Frecuencia */}
              <Card>
                <SectionHeader emoji="🔄" title="Frecuencia de conductas" />
                <ChipSelector
                  options={FRECUENCIAS}
                  selected={frecuencia}
                  onSelect={setFrecuencia}
                />
              </Card>

              {/* Observaciones */}
              <Card>
                <SectionHeader emoji="📝" title="Observaciones adicionales" />
                <TextAreaField
                  value={observaciones}
                  onChangeText={setObservaciones}
                  placeholder="¿Algo más que quieras agregar sobre el día?"
                />
              </Card>

              {/* Detonante */}
              <Card>
                <SectionHeader emoji="⚡" title="Detonante" />
                <TextAreaField
                  value={detonante}
                  onChangeText={setDetonante}
                  placeholder="¿Qué desencadenó la conducta?"
                  maxLength={200}
                />
              </Card>

              {/* Manejo */}
              <Card>
                <SectionHeader emoji="🛠️" title="¿Cómo se manejó?" />
                <TextAreaField
                  value={manejoUtilizado}
                  onChangeText={setManejoUtilizado}
                  placeholder="¿Qué estrategia usaste?"
                  maxLength={200}
                />
              </Card>
            </>
          )}

          {/* Botón guardar */}
          <Button
            title={saving ? 'Guardando...' : 'Guardar Registro 💾'}
            onPress={handleGuardar}
            loading={saving}
            size="lg"
            style={styles.saveButton}
          />

          {(estadoDia || conductasSeleccionadas.length > 0) && (
            <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
              <Text style={styles.resetText}>🗑️ Limpiar formulario</Text>
            </TouchableOpacity>
          )}

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
    backgroundColor: colors.primaryDark,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  headerTipo: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  conductasBadge: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
  },
  conductasBadgeText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  body: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  conductasContainer: {
    gap: spacing.xl,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipEmoji: { fontSize: 14 },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  fieldContainer: { gap: spacing.xs },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 90,
  },
  textAreaFocused: {
    borderColor: colors.primary,
    elevation: 2,
  },
  charCount: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'right',
    marginRight: spacing.xs,
  },
  saveButton: {
    width: '100%',
    marginTop: spacing.sm,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  resetText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
});