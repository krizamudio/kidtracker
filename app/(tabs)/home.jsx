import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/common/Card';
import { useApp } from '../../src/context/AppContext';
import { useAuth } from '../../src/context/AuthContext';
import PerfilScreen from '../../src/screens/perfil/PerfilScreen';
import ListaRegistros from '../../src/screens/registro/ListaRegistros';

const { width } = Dimensions.get('window');


const DIAS_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // índice = getDay() de JS

const estadoConfig = {
  bueno:   { color: colors.good,      emoji: '😊', label: 'Buen día' },
  regular: { color: '#FCD34D',         emoji: '😐', label: 'Regular' },
  dificil: { color: colors.difficult,  emoji: '😔', label: 'Difícil' },
  vacio:   { color: colors.border,     emoji: '',   label: '' },
};

const DayDot = ({ estado, dia, isToday }) => {
  const config = estadoConfig[estado] || estadoConfig.vacio;
  return (
    <View style={styles.dayDotContainer}>
      <View style={[styles.dayDot, { backgroundColor: config.color }, isToday && styles.dayDotToday]}>
        {estado !== 'vacio' && <Text style={styles.dayDotEmoji}>{config.emoji}</Text>}
      </View>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{dia}</Text>
    </View>
  );
};

const ActionButton = ({ emoji, title, subtitle, onPress, color }) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={styles.actionTitle}>{title}</Text>
    {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { caregiver, child, registros, syncPendingRegistros } = useApp();
  const { perfil } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showLista, setShowLista] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const ultimaSemana = (() => {
    const hoy = new Date();
    const registrosPorFecha = {};
    registros.forEach(r => {
      if (r.fecha) registrosPorFecha[r.fecha] = r;
    });
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - (6 - i));
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      return {
        dia: DIAS_LABELS[fecha.getDay()],
        estado: registrosPorFecha[key]?.estado || 'vacio',
        isToday: i === 6,
      };
    });
  })();

  const calcularRacha = () => {
    let racha = 0;
    for (const r of registros) {
      if (r.estado === 'bueno' || r.estado === 'regular') racha++;
      else break;
    }
    return racha;
  };

  const racha = calcularRacha();
  const ultimoRegistro = registros[0];

  const saludoEmoji = () => {
    const hora = new Date().getHours();
    if (hora < 12) return '☀️';
    if (hora < 18) return '🌤️';
    return '🌙';
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCircleTop} />
          <Animated.View style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            {/* Fila superior: solo iconos */}
            <View style={styles.headerTop}>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Text style={styles.iconEmoji}>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowPerfil(true)}
                >
                  <Text style={styles.iconEmoji}>⚙️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Saludo debajo */}
            <Text style={styles.greeting}>
              ¡Hola de Nuevo, {caregiver?.nombre}! {saludoEmoji()}
            </Text>
            <Text style={styles.greetingSubtitle}>
              ¿Cómo estuvo {child?.nombre} hoy?
            </Text>

            {/* Card del niño */}
            <View style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarEmoji}>
                  {child?.sexo === 'nina' ? '👧' : '👦'}
                </Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>
                  {child?.nombre}, {child?.edad} años
                </Text>
                <Text style={styles.childLastRecord}>
                  {ultimoRegistro ? `Último registro: Hace 15 mins.` : 'Sin registros aún'}
                </Text>
              </View>
              <View style={[
                styles.childStatusBadge,
                { backgroundColor: estadoConfig[ultimoRegistro?.estado]?.color || colors.border }
              ]}>
                <Text style={styles.childStatusEmoji}>
                  {estadoConfig[ultimoRegistro?.estado]?.emoji || '📝'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[
          styles.body,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>

          {/* Acciones de Hoy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones de Hoy</Text>
            <View style={styles.actionsRow}>
              <ActionButton
                emoji="⚡"
                title="Registro Rápido"
                subtitle="En el momento"
                color={colors.primary}
                onPress={() => router.push({ pathname: '/(tabs)/registro', params: { tipo: 'inmediato' } })}
              />
              <ActionButton
                emoji="📋"
                title="Registro Diario"
                subtitle="Fin del día"
                color={colors.primaryDark}
                onPress={() => router.push({ pathname: '/(tabs)/registro', params: { tipo: 'diario' } })}
              />
            </View>
          </View>

          {/* Status semanal */}
          <Card style={styles.section}>
            <View style={styles.statusHeader}>
              <Text style={styles.sectionTitle}>Status de {child?.nombre}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/calendario')}>
                <Text style={styles.linkText}>Frecuencia 📈</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.statusSubtitle}>Última semana calendario</Text>
            <View style={styles.weekRow}>
              {ultimaSemana.map((item, i) => (
                <DayDot key={i} estado={item.estado} dia={item.dia} isToday={item.isToday} />
              ))}
            </View>
            <View style={styles.legend}>
              {Object.entries(estadoConfig).filter(([k]) => k !== 'vacio').map(([key, val]) => (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: val.color }]} />
                  <Text style={styles.legendText}>{val.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Progreso y Motivación */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Progreso y Motivación</Text>
            <View style={styles.motivationCard}>
              <Text style={styles.motivationEmoji}>🔥</Text>
              <View style={styles.motivationText}>
                <Text style={styles.motivationTitle}>
                  ¡Racha de Registro: {racha} días!
                </Text>
                <Text style={styles.motivationSubtitle}>
                  Sigue así, cada registro cuenta para entender mejor a {child?.nombre} 💪
                </Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{registros.length}</Text>
                <Text style={styles.statLabel}>Registros</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {registros.filter(r => r.estado === 'bueno').length}
                </Text>
                <Text style={styles.statLabel}>Buenos días</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{racha}</Text>
                <Text style={styles.statLabel}>Racha actual</Text>
              </View>
            </View>
          </Card>

          {/* Ver todos los registros */}
          <TouchableOpacity
            style={styles.verTodosButton}
            onPress={() => setShowLista(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.verTodosText}>📋 Ver todos mis registros</Text>
          </TouchableOpacity>

          {/* Sincronizar con nube */}
          <TouchableOpacity
            style={[styles.syncButton, syncing && { opacity: 0.6 }]}
            onPress={async () => {
              if (!perfil?.uid) return;
              setSyncing(true);
              await syncPendingRegistros(perfil.uid, child?.nombre || '', true);
              setSyncing(false);
            }}
            activeOpacity={0.8}
            disabled={syncing}
          >
            <Text style={styles.syncText}>
              {syncing ? '⏳ Sincronizando...' : '☁️ Sincronizar registros'}
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      {/* Modal de Perfil */}
      <Modal
        visible={showPerfil}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPerfil(false)}
      >
        <PerfilScreen onClose={() => setShowPerfil(false)} />
      </Modal>
      <Modal
        visible={showLista}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLista(false)}
      >
        <ListaRegistros onClose={() => setShowLista(false)} />
      </Modal>
    </>
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
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerCircleTop: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -width * 0.2,
    right: -width * 0.15,
  },
  headerContent: { gap: spacing.lg },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  greetingSubtitle: {
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 18 },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
  },
  childAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarEmoji: { fontSize: 28 },
  childInfo: { flex: 1 },
  childName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  childLastRecord: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  childStatusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childStatusEmoji: { fontSize: 20 },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionEmoji: { fontSize: 28 },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  linkButton: { alignItems: 'center' },
  linkText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  dayDotContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotEmoji: { fontSize: 16 },
  dayDotToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  motivationEmoji: { fontSize: 32 },
  motivationText: { flex: 1, gap: 2 },
  motivationTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  motivationSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  statItem: { alignItems: 'center', gap: 2 },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  verTodosButton: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  verTodosText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  syncButton: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  syncText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});