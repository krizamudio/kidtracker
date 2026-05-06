import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/common/Card';
import { LineChart } from '../../src/components/charts/LineChart';
import { BarChart } from '../../src/components/charts/BarChart';
import { useApp } from '../../src/context/AppContext';


const { width } = Dimensions.get('window');

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const estadoConfig = {
  bueno:   { color: colors.good,      label: 'Buen día',  emoji: '😊' },
  regular: { color: '#FCD34D',         label: 'Regular',   emoji: '😐' },
  dificil: { color: colors.difficult,  label: 'Difícil',   emoji: '😔' },
};

export default function CalendarioScreen() {
  const { registros, child } = useApp();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Mapa de registros por fecha
  const registrosPorFecha = registros.reduce((acc, r) => {
    acc[r.fecha] = r;
    return acc;
  }, {});

  // Generar días del mes
  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Ajustar para que lunes sea el primer día
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    return { daysInMonth, startOffset };
  };

  const { daysInMonth, startOffset } = getDaysInMonth(currentYear, currentMonth);

  const formatFecha = (day) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
  };

  // Estadísticas del mes
  const registrosMes = Object.entries(registrosPorFecha).filter(([fecha]) =>
    fecha.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)
  );

  const stats = {
    bueno: registrosMes.filter(([, r]) => r.estado === 'bueno').length,
    regular: registrosMes.filter(([, r]) => r.estado === 'regular').length,
    dificil: registrosMes.filter(([, r]) => r.estado === 'dificil').length,
    total: registrosMes.length,
  };

  const selectedRegistro = selectedDay
    ? registrosPorFecha[formatFecha(selectedDay)]
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.headerTitle}>Calendario de Conductas</Text>
          <Text style={styles.headerSubtitle}>
            Seguimiento de {child?.nombre}
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>

        {/* Navegación del mes */}
        <Card>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
              <Text style={styles.navArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MESES[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <Text style={styles.navArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Días de la semana */}
          <View style={styles.weekHeader}>
            {DIAS_SEMANA.map(d => (
              <Text key={d} style={styles.weekDay}>{d}</Text>
            ))}
          </View>

          {/* Grid del calendario */}
          <View style={styles.calendarGrid}>
            {/* Espacios vacíos al inicio */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const fecha = formatFecha(day);
              const registro = registrosPorFecha[fecha];
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const isSelected = selectedDay === day;
              const config = registro ? estadoConfig[registro.estado] : null;

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday && styles.dayCellToday,
                    isSelected && styles.dayCellSelected,
                    config && { backgroundColor: config.color + '33' },
                  ]}
                  onPress={() => setSelectedDay(isSelected ? null : day)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayNumber,
                    isToday && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}>
                    {day}
                  </Text>
                  {config && (
                    <View style={[styles.dayDot, { backgroundColor: config.color }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Leyenda */}
          <View style={styles.legend}>
            {Object.entries(estadoConfig).map(([key, val]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: val.color }]} />
                <Text style={styles.legendText}>{val.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Detalle del día seleccionado */}
        {selectedDay && (
          <Card>
            <Text style={styles.detailTitle}>
              {selectedDay} de {MESES[currentMonth]}
            </Text>
            {selectedRegistro ? (
              <View style={styles.detailContent}>
                <View style={[
                  styles.detailEstado,
                  { backgroundColor: estadoConfig[selectedRegistro.estado]?.color + '22' }
                ]}>
                  <Text style={styles.detailEmoji}>
                    {estadoConfig[selectedRegistro.estado]?.emoji}
                  </Text>
                  <Text style={[
                    styles.detailEstadoText,
                    { color: estadoConfig[selectedRegistro.estado]?.color }
                  ]}>
                    {estadoConfig[selectedRegistro.estado]?.label}
                  </Text>
                </View>

                {selectedRegistro.intensidad && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📊 Intensidad</Text>
                    <Text style={styles.detailValue}>{selectedRegistro.intensidad}</Text>
                  </View>
                )}
                {selectedRegistro.frecuencia && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🔄 Frecuencia</Text>
                    <Text style={styles.detailValue}>{selectedRegistro.frecuencia}</Text>
                  </View>
                )}
                {selectedRegistro.observaciones ? (
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>📝 Observaciones</Text>
                    <Text style={styles.detailBlockText}>{selectedRegistro.observaciones}</Text>
                  </View>
                ) : null}
                {selectedRegistro.detonante ? (
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>⚡ Detonante</Text>
                    <Text style={styles.detailBlockText}>{selectedRegistro.detonante}</Text>
                  </View>
                ) : null}
                {selectedRegistro.manejoUtilizado ? (
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>🛠️ Manejo utilizado</Text>
                    <Text style={styles.detailBlockText}>{selectedRegistro.manejoUtilizado}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.noRegistro}>
                <Text style={styles.noRegistroEmoji}>📭</Text>
                <Text style={styles.noRegistroText}>Sin registro este día</Text>
              </View>
            )}
          </Card>
        )}

        {/* Estadísticas del mes */}
        <Card>
          <Text style={styles.sectionTitle}>
            Resumen de {MESES[currentMonth]}
          </Text>
          {stats.total === 0 ? (
            <View style={styles.noData}>
              <Text style={styles.noDataEmoji}>📊</Text>
              <Text style={styles.noDataText}>Sin registros este mes</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statItem, styles.statBueno]}>
                  <Text style={styles.statNumber}>{stats.bueno}</Text>
                  <Text style={styles.statLabel}>😊 Buenos</Text>
                </View>
                <View style={[styles.statItem, styles.statRegular]}>
                  <Text style={styles.statNumber}>{stats.regular}</Text>
                  <Text style={styles.statLabel}>😐 Regulares</Text>
                </View>
                <View style={[styles.statItem, styles.statDificil]}>
                  <Text style={styles.statNumber}>{stats.dificil}</Text>
                  <Text style={styles.statLabel}>😔 Difíciles</Text>
                </View>
              </View>

              {/* Barra de progreso visual */}
              {stats.total > 0 && (
                <View style={styles.progressBar}>
                  {stats.bueno > 0 && (
                    <View style={[
                      styles.progressSegment,
                      { flex: stats.bueno, backgroundColor: colors.good }
                    ]} />
                  )}
                  {stats.regular > 0 && (
                    <View style={[
                      styles.progressSegment,
                      { flex: stats.regular, backgroundColor: '#FCD34D' }
                    ]} />
                  )}
                  {stats.dificil > 0 && (
                    <View style={[
                      styles.progressSegment,
                      { flex: stats.dificil, backgroundColor: colors.difficult }
                    ]} />
                  )}
                </View>
              )}
              <Text style={styles.progressLabel}>
                {Math.round((stats.bueno / stats.total) * 100)}% días positivos este mes 🌟
              </Text>
            </>
          )}
        </Card>
      {/* Gráfica de tendencia */}
<Card>
  <Text style={styles.sectionTitle}>📈 Tendencia de la última semana</Text>
  <LineChart registros={registros} height={130} days={7} />
  <View style={styles.trendLegend}>
    <Text style={styles.trendLabel}>
      {registros.length >= 2
        ? registros[0]?.estado === 'bueno' && registros[1]?.estado !== 'bueno'
          ? '📈 Mejorando respecto al día anterior'
          : registros[0]?.estado === 'dificil'
          ? '⚠️ Día difícil hoy — sigue registrando'
          : '✅ Tendencia estable'
        : '📊 Agrega más registros para ver tendencias'}
    </Text>
  </View>
</Card>

{/* Gráfica de distribución */}
<Card>
  <Text style={styles.sectionTitle}>📊 Distribución del mes</Text>
  <BarChart
    height={130}
    data={[
      { label: 'Buenos', value: stats.bueno,   color: colors.good },
      { label: 'Regulares', value: stats.regular, color: '#FCD34D' },
      { label: 'Difíciles', value: stats.dificil, color: colors.difficult },
    ]}
  />
</Card>

{/* Top conductas del mes */}
{(() => {
  const todasConductas = registros
    .filter(r => {
      const fecha = r.fecha || '';
      return fecha.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
    })
    .flatMap(r => r.conductasSeleccionadas || []);

  const frecuencia = todasConductas.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const top = Object.entries(frecuencia)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (top.length === 0) return null;

  // Buscar label de la conducta
  const getConductaLabel = (id) => {
    const { CONDUCTAS_POR_CATEGORIA } = require('../../src/data/conductas');
    for (const cat of Object.values(CONDUCTAS_POR_CATEGORIA)) {
      for (const sub of cat.subcategorias) {
        const found = sub.conductas.find(c => c.id === id);
        if (found) return { label: found.label, color: cat.color };
      }
    }
    return { label: id, color: colors.primary };
  };

  return (
    <Card>
      <Text style={styles.sectionTitle}>🔍 Conductas más frecuentes</Text>
      <Text style={styles.sectionSubtitle}>Este mes</Text>
      <View style={styles.topConductas}>
        {top.map(([id, count], i) => {
          const { label, color } = getConductaLabel(id);
          return (
            <View key={id} style={styles.topConductaItem}>
              <View style={[styles.topRank, { backgroundColor: color + '22' }]}>
                <Text style={[styles.topRankText, { color }]}>#{i + 1}</Text>
              </View>
              <Text style={styles.topConductaLabel} numberOfLines={2}>{label}</Text>
              <View style={[styles.topCount, { backgroundColor: color }]}>
                <Text style={styles.topCountText}>{count}x</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
})()}
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  monthTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 2,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayCellSelected: {
    backgroundColor: colors.primaryLight,
  },
  dayNumber: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  dayNumberToday: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  dayNumberSelected: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  detailTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  detailContent: { gap: spacing.md },
  detailEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
  },
  detailEmoji: { fontSize: 24 },
  detailEstadoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  detailBlock: { gap: spacing.xs },
  detailBlockText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: 20,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 10,
  },
  noRegistro: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  noRegistroEmoji: { fontSize: 36 },
  noRegistroText: {
    fontSize: typography.sizes.md,
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statBueno: {},
  statRegular: {},
  statDificil: {},
  statNumber: {
    fontSize: typography.sizes.xxl,
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
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressSegment: { height: '100%' },
  progressLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  noData: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  noDataEmoji: { fontSize: 36 },
  noDataText: {
    fontSize: typography.sizes.md,
    color: colors.textLight,
  },

  trendLegend: {
  marginTop: spacing.sm,
  alignItems: 'center',
},
trendLabel: {
  fontSize: typography.sizes.sm,
  color: colors.textSecondary,
  textAlign: 'center',
},
sectionSubtitle: {
  fontSize: typography.sizes.sm,
  color: colors.textSecondary,
  marginTop: -spacing.sm,
  marginBottom: spacing.sm,
},
topConductas: {
  gap: spacing.sm,
},
topConductaItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.md,
  paddingVertical: spacing.xs,
},
topRank: {
  width: 32,
  height: 32,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
},
topRankText: {
  fontSize: typography.sizes.xs,
  fontWeight: typography.weights.bold,
},
topConductaLabel: {
  flex: 1,
  fontSize: typography.sizes.sm,
  color: colors.textPrimary,
  lineHeight: 18,
},
topCount: {
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 10,
},
topCountText: {
  fontSize: typography.sizes.xs,
  color: colors.white,
  fontWeight: typography.weights.bold,
},
});