import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const ESTADO_VALOR = { bueno: 2, regular: 1, dificil: 0 };
const ESTADO_COLOR = {
  bueno: colors.good,
  regular: '#FCD34D',
  dificil: colors.difficult,
};
const ESTADO_EMOJI = { bueno: '😊', regular: '😐', dificil: '😔' };

export const LineChart = ({ registros = [], height = 140, days = 7 }) => {
  const data = registros.slice(0, days).reverse();

  if (data.length < 2) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyText}>
          Agrega al menos 2 registros para ver la tendencia
        </Text>
      </View>
    );
  }

  const chartHeight = height - 40; // espacio para labels abajo
  const totalPoints = data.length;

  return (
    <View style={styles.wrapper}>
      {/* Eje Y */}
      <View style={styles.yAxis}>
        <Text style={styles.yEmoji}>😊</Text>
        <Text style={styles.yEmoji}>😐</Text>
        <Text style={styles.yEmoji}>😔</Text>
      </View>

      {/* Área de la gráfica */}
      <View style={[styles.chartArea, { height }]}>

        {/* Líneas de referencia horizontales */}
        <View style={[styles.refLine, { top: 8 }]} />
        <View style={[styles.refLine, { top: chartHeight / 2 }]} />
        <View style={[styles.refLine, { top: chartHeight - 8 }]} />

        {/* Puntos y líneas */}
        <View style={styles.pointsArea}>
          {data.map((item, i) => {
            const valor = ESTADO_VALOR[item.estado] ?? 1;
            // Calcular posición Y: 0=dificil(abajo), 2=bueno(arriba)
            const yPercent = ((2 - valor) / 2) * 100;
            const xPercent = totalPoints === 1
              ? 50
              : (i / (totalPoints - 1)) * 100;

            return (
              <View
                key={i}
                style={[
                  styles.pointWrapper,
                  {
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                  },
                ]}
              >
                <View style={[
                  styles.point,
                  { backgroundColor: ESTADO_COLOR[item.estado] || colors.border }
                ]}>
                  <Text style={styles.pointEmoji}>
                    {ESTADO_EMOJI[item.estado]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Labels de días abajo */}
        <View style={styles.xAxis}>
          {data.map((item, i) => {
            const date = new Date(item.fecha + 'T12:00:00');
            const dayLabel = date.toLocaleDateString('es-MX', { weekday: 'short' });
            return (
              <View key={i} style={styles.xLabel}>
                <Text style={styles.xLabelText}>
                  {dayLabel.charAt(0).toUpperCase()}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: spacing.sm,
  },
  yAxis: {
    width: 28,
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingBottom: 28,
  },
  yEmoji: {
    fontSize: 14,
    textAlign: 'center',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  refLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  pointsArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 28,
  },
  pointWrapper: {
    position: 'absolute',
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  point: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pointEmoji: {
    fontSize: 14,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  xLabel: {
    flex: 1,
    alignItems: 'center',
  },
  xLabelText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 32 },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});