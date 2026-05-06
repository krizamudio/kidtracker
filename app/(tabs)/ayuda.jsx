import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Linking, Alert,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/common/Card';

const CRISIS_LINES = [
  {
    nombre: 'Línea de la Vida',
    numero: '800-911-2000',
    descripcion: 'Atención en crisis, 24/7 gratuita',
    emoji: '🆘',
    color: '#EF4444',
  },
  {
    nombre: 'SAPTEL',
    numero: '55-5259-8121',
    descripcion: 'Crisis emocional, 24/7',
    emoji: '💙',
    color: '#3B82F6',
  },
  {
    nombre: 'CAPA',
    numero: '800-290-0024',
    descripcion: 'Centro de Atención Psicológica',
    emoji: '🧠',
    color: '#8B5CF6',
  },
];

const COMUNIDAD = [
  {
    nombre: 'Reddit r/autism_parents',
    descripcion: 'Comunidad de padres en inglés/español',
    emoji: '👥',
    url: 'https://reddit.com/r/autism_parents',
    color: '#FF4500',
  },
  {
    nombre: 'Grupo Facebook TDAH México',
    descripcion: 'Padres de niños con TDAH en México',
    emoji: '👨‍👩‍👧',
    url: 'https://facebook.com',
    color: '#1877F2',
  },
  {
    nombre: 'YouTube — Understood',
    descripcion: 'Videos educativos sobre neurodesarrollo',
    emoji: '▶️',
    url: 'https://youtube.com/@understood',
    color: '#FF0000',
  },
];

const RECURSOS = [
  {
    titulo: '¿Qué es el TDAH?',
    descripcion: 'Guía completa para padres sobre el Trastorno por Déficit de Atención',
    emoji: '🧩',
    tiempo: '5 min lectura',
  },
  {
    titulo: 'Hitos del desarrollo por edad',
    descripcion: 'Qué esperar en cada etapa del desarrollo infantil',
    emoji: '📈',
    tiempo: '8 min lectura',
  },
  {
    titulo: 'Estrategias de manejo conductual',
    descripcion: 'Técnicas prácticas para el día a día',
    emoji: '🛠️',
    tiempo: '10 min lectura',
  },
  {
    titulo: 'Cómo hablar con la escuela',
    descripcion: 'Guía para comunicarte efectivamente con maestros',
    emoji: '🏫',
    tiempo: '6 min lectura',
  },
];

const FRASES_MOTIVACIONALES = [
  'Cada día que registras es un paso más hacia entender a tu hijo. 💛',
  'No estás solo/a en este camino. Hay una comunidad que te apoya. 🤝',
  'Conocer a tu hijo es el mejor regalo que puedes darle. 🎁',
];

const SectionHeader = ({ emoji, title, subtitle }) => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionEmoji}>{emoji}</Text>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

export default function AyudaScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fraseDelDia = FRASES_MOTIVACIONALES[new Date().getDay() % FRASES_MOTIVACIONALES.length];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLlamar = (linea) => {
    Alert.alert(
      `Llamar a ${linea.nombre}`,
      `¿Deseas llamar al ${linea.numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: () => Linking.openURL(`tel:${linea.numero.replace(/-/g, '')}`),
        },
      ]
    );
  };

  const handleOpenURL = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir el enlace')
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.headerTitle}>Centro de Apoyo</Text>
          <Text style={styles.headerSubtitle}>Recursos, comunidad y ayuda en crisis</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Frase del día */}
        <View style={styles.fraseCard}>
          <Text style={styles.fraseEmoji}>💛</Text>
          <Text style={styles.fraseTexto}>{fraseDelDia}</Text>
        </View>

        {/* Estado emocional del cuidador */}
        <Card>
          <SectionHeader
            emoji="💆"
            title="¿Cómo te sientes hoy?"
            subtitle="Tu bienestar también importa"
          />
          <View style={styles.estadoRow}>
            {[
              { emoji: '😊', label: 'Bien' },
              { emoji: '😐', label: 'Regular' },
              { emoji: '😔', label: 'Cansado/a' },
              { emoji: '😰', label: 'Estresado/a' },
              { emoji: '💪', label: 'Con energía' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.estadoItem}
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert(
                    'Registrado 💛',
                    'Recuerda que cuidarte a ti mismo/a te permite cuidar mejor a tu hijo.'
                  )
                }
              >
                <Text style={styles.estadoEmoji}>{item.emoji}</Text>
                <Text style={styles.estadoLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Líneas de crisis */}
        <Card>
          <SectionHeader
            emoji="🆘"
            title="Líneas de Crisis"
            subtitle="Disponibles 24/7 — totalmente gratuitas"
          />
          <View style={styles.crisisList}>
            {CRISIS_LINES.map((linea) => (
              <TouchableOpacity
                key={linea.nombre}
                style={[styles.crisisItem, { borderLeftColor: linea.color }]}
                onPress={() => handleLlamar(linea)}
                activeOpacity={0.8}
              >
                <Text style={styles.crisisEmoji}>{linea.emoji}</Text>
                <View style={styles.crisisInfo}>
                  <Text style={styles.crisisNombre}>{linea.nombre}</Text>
                  <Text style={styles.crisisDescripcion}>{linea.descripcion}</Text>
                  <Text style={[styles.crisisNumero, { color: linea.color }]}>
                    📞 {linea.numero}
                  </Text>
                </View>
                <Text style={styles.crisisArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Recursos educativos */}
        <Card>
          <SectionHeader
            emoji="📚"
            title="Recursos Educativos"
            subtitle="Guías y artículos para padres"
          />
          <View style={styles.recursosList}>
            {RECURSOS.map((recurso) => (
              <TouchableOpacity
                key={recurso.titulo}
                style={styles.recursoItem}
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert('Próximamente', 'Este recurso estará disponible pronto. 📖')
                }
              >
                <View style={styles.recursoIcono}>
                  <Text style={styles.recursoEmoji}>{recurso.emoji}</Text>
                </View>
                <View style={styles.recursoInfo}>
                  <Text style={styles.recursoTitulo}>{recurso.titulo}</Text>
                  <Text style={styles.recursoDescripcion}>{recurso.descripcion}</Text>
                  <Text style={styles.recursoTiempo}>⏱ {recurso.tiempo}</Text>
                </View>
                <Text style={styles.recursoArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Comunidad */}
        <Card>
          <SectionHeader
            emoji="🌐"
            title="Comunidad"
            subtitle="Conecta con otros padres"
          />
          <View style={styles.comunidadList}>
            {COMUNIDAD.map((item) => (
              <TouchableOpacity
                key={item.nombre}
                style={styles.comunidadItem}
                onPress={() => handleOpenURL(item.url)}
                activeOpacity={0.7}
              >
                <View style={[styles.comunidadIcono, { backgroundColor: item.color + '22' }]}>
                  <Text style={styles.comunidadEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.comunidadInfo}>
                  <Text style={styles.comunidadNombre}>{item.nombre}</Text>
                  <Text style={styles.comunidadDescripcion}>{item.descripcion}</Text>
                </View>
                <Text style={[styles.comunidadArrow, { color: item.color }]}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Footer motivacional */}
        <View style={styles.footer}>
          <Text style={styles.footerEmoji}>🧡</Text>
          <Text style={styles.footerTexto}>
            Hecho con amor para familias que acompañan el neurodesarrollo de sus hijos.
          </Text>
        </View>

      </Animated.View>
    </ScrollView>
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
    backgroundColor: '#059669',
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
  },
  body: {
    padding: spacing.xl,
    gap: spacing.lg,
  },

  // Frase del día
  fraseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  fraseEmoji: { fontSize: 28 },
  fraseTexto: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: '#92400E',
    lineHeight: 20,
    fontStyle: 'italic',
    fontWeight: typography.weights.medium,
  },

  // Sección header
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionEmoji: { fontSize: 26 },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Estado emocional
  estadoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estadoItem: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 12,
  },
  estadoEmoji: { fontSize: 28 },
  estadoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Crisis
  crisisList: { gap: spacing.md },
  crisisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    gap: spacing.md,
  },
  crisisEmoji: { fontSize: 24 },
  crisisInfo: { flex: 1, gap: 2 },
  crisisNombre: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  crisisDescripcion: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  crisisNumero: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  crisisArrow: {
    fontSize: typography.sizes.lg,
    color: colors.textLight,
  },

  // Recursos
  recursosList: { gap: spacing.md },
  recursoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recursoIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recursoEmoji: { fontSize: 22 },
  recursoInfo: { flex: 1, gap: 2 },
  recursoTitulo: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  recursoDescripcion: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  recursoTiempo: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    marginTop: 2,
  },
  recursoArrow: {
    fontSize: typography.sizes.xxl,
    color: colors.textLight,
  },

  // Comunidad
  comunidadList: { gap: spacing.md },
  comunidadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  comunidadIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comunidadEmoji: { fontSize: 22 },
  comunidadInfo: { flex: 1, gap: 2 },
  comunidadNombre: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  comunidadDescripcion: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  comunidadArrow: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  footerEmoji: { fontSize: 32 },
  footerTexto: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
});