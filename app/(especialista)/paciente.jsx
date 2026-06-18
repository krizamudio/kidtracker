import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/common/Card';
import { registroService } from '../../src/services/registroService';
import { CONDUCTAS_POR_CATEGORIA } from '../../src/data/conductas';

const estadoConfig = {
  bueno:   { color: colors.good,      emoji: '😊', label: 'Buen día' },
  regular: { color: '#FCD34D',         emoji: '😐', label: 'Regular' },
  dificil: { color: colors.difficult,  emoji: '😔', label: 'Difícil' },
};

const cuidadorConfig = {
  tranquilo:  { emoji: '😌', label: 'Tranquilo' },
  cansado:    { emoji: '😓', label: 'Cansado' },
  frustrado:  { emoji: '😤', label: 'Frustrado' },
  ansioso:    { emoji: '😰', label: 'Ansioso' },
};

const getConductaLabel = (id) => {
  for (const cat of Object.values(CONDUCTAS_POR_CATEGORIA)) {
    for (const sub of cat.subcategorias) {
      const found = sub.conductas.find(c => c.id === id);
      if (found) return found.label;
    }
  }
  return id;
};

export default function PacienteScreen() {
  const { cuidadorId, nombre } = useLocalSearchParams();
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refrescando, setRefrescando] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cargarRegistros();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleRefrescar = async () => {
    setRefrescando(true);
    await cargarRegistros();
    setRefrescando(false);
  };

  const cargarRegistros = async () => {
    try {
      const data = await registroService.getRegistrosPaciente(cuidadorId);
      setRegistros(data);
    } catch (error) {
      console.error('Error cargando registros:', error.message || error);
      Alert.alert('Error', 'No se pudieron cargar los registros: ' + (error.message || 'Error desconocido'));
    } finally {
      setCargando(false);
    }
  };

  // Estadísticas
  const stats = {
    total: registros.length,
    bueno: registros.filter(r => r.estado === 'bueno').length,
    regular: registros.filter(r => r.estado === 'regular').length,
    dificil: registros.filter(r => r.estado === 'dificil').length,
  };

  // Top conductas
  const todasConductas = registros.flatMap(r => r.conductasSeleccionadas || []);
  const frecuenciaConductas = todasConductas.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  const topConductas = Object.entries(frecuenciaConductas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRefrescar}
            style={[styles.backButton, refrescando && { opacity: 0.5 }]}
            disabled={refrescando}
          >
            <Text style={styles.backArrow}>{refrescando ? '⏳' : '🔄'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>👨‍👩‍👧</Text>
          </View>
          <Text style={styles.headerNombre}>{nombre}</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} registro{stats.total !== 1 ? 's' : ''} totales
          </Text>
        </View>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>

        {cargando ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={{ padding: spacing.xxxxl }}
          />
        ) : registros.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Sin registros</Text>
              <Text style={styles.emptySubtitle}>
                Este cuidador aún no tiene registros subidos a la nube.
              </Text>
            </View>
          </Card>
        ) : (
          <>
            {/* Resumen estadístico */}
            <Card>
              <Text style={styles.sectionTitle}>📊 Resumen General</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statItem, { borderColor: colors.good }]}>
                  <Text style={[styles.statNumber, { color: colors.good }]}>{stats.bueno}</Text>
                  <Text style={styles.statLabel}>😊 Buenos</Text>
                </View>
                <View style={[styles.statItem, { borderColor: '#FCD34D' }]}>
                  <Text style={[styles.statNumber, { color: '#B45309' }]}>{stats.regular}</Text>
                  <Text style={styles.statLabel}>😐 Regulares</Text>
                </View>
                <View style={[styles.statItem, { borderColor: colors.difficult }]}>
                  <Text style={[styles.statNumber, { color: colors.difficult }]}>{stats.dificil}</Text>
                  <Text style={styles.statLabel}>😔 Difíciles</Text>
                </View>
              </View>

              {stats.total > 0 && (
                <>
                  <View style={styles.progressBar}>
                    {stats.bueno > 0 && (
                      <View style={[styles.progressSegment, { flex: stats.bueno, backgroundColor: colors.good }]} />
                    )}
                    {stats.regular > 0 && (
                      <View style={[styles.progressSegment, { flex: stats.regular, backgroundColor: '#FCD34D' }]} />
                    )}
                    {stats.dificil > 0 && (
                      <View style={[styles.progressSegment, { flex: stats.dificil, backgroundColor: colors.difficult }]} />
                    )}
                  </View>
                  <Text style={styles.progressLabel}>
                    {Math.round((stats.bueno / stats.total) * 100)}% días positivos
                  </Text>
                </>
              )}
            </Card>

            {/* Top conductas */}
            {topConductas.length > 0 && (
              <Card>
                <Text style={styles.sectionTitle}>🔍 Conductas más frecuentes</Text>
                <View style={styles.conductasList}>
                  {topConductas.map(([id, count], i) => (
                    <View key={id} style={styles.conductaItem}>
                      <View style={styles.conductaRank}>
                        <Text style={styles.conductaRankText}>#{i + 1}</Text>
                      </View>
                      <Text style={styles.conductaLabel} numberOfLines={2}>
                        {getConductaLabel(id)}
                      </Text>
                      <View style={styles.conductaCount}>
                        <Text style={styles.conductaCountText}>{count}x</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Lista de registros */}
            <Card>
              <Text style={styles.sectionTitle}>📋 Historial de Registros</Text>
              <View style={styles.registrosList}>
                {registros.map(registro => {
                  const config = estadoConfig[registro.estado] || estadoConfig.regular;
                  const isExpanded = expandedId === registro.id;
                  const date = new Date(registro.fecha + 'T12:00:00');
                  const dateLabel = date.toLocaleDateString('es-MX', {
                    weekday: 'long', day: 'numeric', month: 'long'
                  });

                  return (
                    <View key={registro.id} style={[
                      styles.registroCard,
                      { borderLeftColor: config.color }
                    ]}>
                      <TouchableOpacity
                        style={styles.registroHeader}
                        onPress={() => setExpandedId(isExpanded ? null : registro.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.estadoBadge, { backgroundColor: config.color + '22' }]}>
                          <Text style={styles.estadoEmoji}>{config.emoji}</Text>
                        </View>
                        <View style={styles.registroInfo}>
                          <Text style={styles.registroFecha}>{dateLabel}</Text>
                          <View style={styles.registroMeta}>
                            <View style={[
                              styles.tipoBadge,
                              registro.tipo === 'inmediato' ? styles.tipoBadgeRapido : styles.tipoBadgeDiario,
                            ]}>
                              <Text style={styles.tipoBadgeText}>
                                {registro.tipo === 'inmediato' ? '⚡ Rápido' : '📋 Diario'}
                              </Text>
                            </View>
                            {registro.hora && (
                              <Text style={styles.registroTag}>🕐 {registro.hora}</Text>
                            )}
                            {registro.intensidad && (
                              <Text style={styles.registroTag}>• {registro.intensidad}</Text>
                            )}
                          </View>
                          {registro.conductasSeleccionadas?.length > 0 && (
                            <Text style={styles.conductasCount}>
                              🔍 {registro.conductasSeleccionadas.length} conducta{registro.conductasSeleccionadas.length > 1 ? 's' : ''}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.expandArrow, { color: config.color }]}>
                          {isExpanded ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.registroDetalle}>
                          {registro.conductasSeleccionadas?.length > 0 && (
                            <View style={styles.detalleSection}>
                              <Text style={styles.detalleTitulo}>🔍 Conductas observadas</Text>
                              <View style={styles.conductasTagsList}>
                                {registro.conductasSeleccionadas.map((id, i) => (
                                  <View key={i} style={styles.conductaTag}>
                                    <Text style={styles.conductaTagText}>
                                      {getConductaLabel(id)}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                          {registro.estadoCuidador && cuidadorConfig[registro.estadoCuidador] && (
                            <View style={styles.detalleSection}>
                              <Text style={styles.detalleTitulo}>👤 Estado del cuidador</Text>
                              <Text style={styles.detalleTexto}>
                                {cuidadorConfig[registro.estadoCuidador].emoji} {cuidadorConfig[registro.estadoCuidador].label}
                              </Text>
                            </View>
                          )}

                          {registro.observaciones ? (
                            <View style={styles.detalleSection}>
                              <Text style={styles.detalleTitulo}>📝 Observaciones</Text>
                              <Text style={styles.detalleTexto}>{registro.observaciones}</Text>
                            </View>
                          ) : null}
                          {registro.detonante ? (
                            <View style={styles.detalleSection}>
                              <Text style={styles.detalleTitulo}>⚡ Detonante</Text>
                              <Text style={styles.detalleTexto}>{registro.detonante}</Text>
                            </View>
                          ) : null}
                          {registro.manejoUtilizado ? (
                            <View style={styles.detalleSection}>
                              <Text style={styles.detalleTitulo}>🛠️ Manejo utilizado</Text>
                              <Text style={styles.detalleTexto}>{registro.manejoUtilizado}</Text>
                            </View>
                          ) : null}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </Card>
          </>
        )}
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
    backgroundColor: '#7C3AED',
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    gap: spacing.md,
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: typography.sizes.xl,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  headerInfo: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerAvatarEmoji: { fontSize: 36 },
  headerNombre: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  body: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressSegment: { height: '100%' },
  progressLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  conductasList: { gap: spacing.sm },
  conductaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  conductaRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conductaRankText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#7C3AED',
  },
  conductaLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  conductaCount: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  conductaCountText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  registrosList: { gap: spacing.sm },
  registroCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  registroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  estadoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoEmoji: { fontSize: 20 },
  registroInfo: { flex: 1, gap: 2 },
  registroFecha: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  registroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tipoBadge: {
    borderRadius: 6,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  tipoBadgeRapido: {
    backgroundColor: '#FEF3C7',
  },
  tipoBadgeDiario: {
    backgroundColor: '#EDE9FE',
  },
  tipoBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  registroTag: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  conductasCount: {
    fontSize: typography.sizes.xs,
    color: '#7C3AED',
    fontWeight: typography.weights.medium,
  },
  expandArrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  registroDetalle: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  detalleSection: { gap: spacing.xs },
  detalleTitulo: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  detalleTexto: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  conductasTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  conductaTag: {
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  conductaTagText: {
    fontSize: typography.sizes.xs,
    color: '#7C3AED',
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});