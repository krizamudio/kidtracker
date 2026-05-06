import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useApp } from '../../context/AppContext';
import { CONDUCTAS_POR_CATEGORIA } from '../../data/conductas';

const estadoConfig = {
  bueno:   { color: colors.good,      emoji: '😊', label: 'Buen día' },
  regular: { color: '#FCD34D',         emoji: '😐', label: 'Regular' },
  dificil: { color: colors.difficult,  emoji: '😔', label: 'Difícil' },
};

const FILTROS = [
  { id: 'todos',   label: 'Todos',    emoji: '📋' },
  { id: 'bueno',   label: 'Buenos',   emoji: '😊' },
  { id: 'regular', label: 'Regulares', emoji: '😐' },
  { id: 'dificil', label: 'Difíciles', emoji: '😔' },
];

const getConductaLabel = (id) => {
  for (const cat of Object.values(CONDUCTAS_POR_CATEGORIA)) {
    for (const sub of cat.subcategorias) {
      const found = sub.conductas.find(c => c.id === id);
      if (found) return found.label;
    }
  }
  return id;
};

const RegistroCard = ({ registro, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const config = estadoConfig[registro.estado] || estadoConfig.regular;
  const date = new Date(registro.fecha + 'T12:00:00');
  const dateLabel = date.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const hasConductas = registro.conductasSeleccionadas?.length > 0;
  const hasDetails = registro.observaciones || registro.detonante || registro.manejoUtilizado;

  return (
    <View style={[styles.registroCard, { borderLeftColor: config.color }]}>
      {/* Header del card */}
      <TouchableOpacity
        style={styles.registroHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.estadoBadge, { backgroundColor: config.color + '22' }]}>
          <Text style={styles.estadoEmoji}>{config.emoji}</Text>
        </View>
        <View style={styles.registroInfo}>
          <Text style={styles.registroFecha}>{dateLabel}</Text>
          <View style={styles.registroMeta}>
            {registro.hora && (
              <Text style={styles.registroHora}>🕐 {registro.hora}</Text>
            )}
            {registro.intensidad && (
              <Text style={styles.registroTag}>• {registro.intensidad}</Text>
            )}
            {registro.frecuencia && (
              <Text style={styles.registroTag}>• {registro.frecuencia}</Text>
            )}
          </View>
          {hasConductas && (
            <Text style={styles.conductasCount}>
              🔍 {registro.conductasSeleccionadas.length} conducta{registro.conductasSeleccionadas.length > 1 ? 's' : ''} registrada{registro.conductasSeleccionadas.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.registroActions}>
          <Text style={[styles.expandArrow, { color: config.color }]}>
            {expanded ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Detalle expandido */}
      {expanded && (
        <View style={styles.registroDetalle}>

          {hasConductas && (
            <View style={styles.detalleSection}>
              <Text style={styles.detalleSectionTitle}>🔍 Conductas observadas</Text>
              <View style={styles.conductasList}>
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

          {registro.observaciones ? (
            <View style={styles.detalleSection}>
              <Text style={styles.detalleSectionTitle}>📝 Observaciones</Text>
              <Text style={styles.detalleText}>{registro.observaciones}</Text>
            </View>
          ) : null}

          {registro.detonante ? (
            <View style={styles.detalleSection}>
              <Text style={styles.detalleSectionTitle}>⚡ Detonante</Text>
              <Text style={styles.detalleText}>{registro.detonante}</Text>
            </View>
          ) : null}

          {registro.manejoUtilizado ? (
            <View style={styles.detalleSection}>
              <Text style={styles.detalleSectionTitle}>🛠️ Manejo utilizado</Text>
              <Text style={styles.detalleText}>{registro.manejoUtilizado}</Text>
            </View>
          ) : null}

          {!hasConductas && !hasDetails && (
            <Text style={styles.sinDetalles}>Sin detalles adicionales</Text>
          )}

          {/* Botón eliminar */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(registro.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteText}>🗑️ Eliminar registro</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function ListaRegistros({ onClose }) {
  const { registros, deleteRegistro, child } = useApp();
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const registrosFiltrados = useMemo(() => {
    let result = [...registros];

    if (filtro !== 'todos') {
      result = result.filter(r => r.estado === filtro);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = result.filter(r =>
        r.observaciones?.toLowerCase().includes(q) ||
        r.detonante?.toLowerCase().includes(q) ||
        r.manejoUtilizado?.toLowerCase().includes(q) ||
        r.conductasSeleccionadas?.some(id =>
          getConductaLabel(id).toLowerCase().includes(q)
        )
      );
    }

    return result;
  }, [registros, filtro, busqueda]);

  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar registro',
      '¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteRegistro(id),
        },
      ]
    );
  };

  // Agrupar por mes
  const registrosAgrupados = useMemo(() => {
    const grupos = {};
    registrosFiltrados.forEach(r => {
      const date = new Date(r.fecha + 'T12:00:00');
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
      if (!grupos[key]) grupos[key] = { label, items: [] };
      grupos[key].items.push(r);
    });
    return Object.values(grupos);
  }, [registrosFiltrados]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Registros</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          {registros.length} registro{registros.length !== 1 ? 's' : ''} de {child?.nombre}
        </Text>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="🔍 Buscar en registros..."
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtrosRow}>
            {FILTROS.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filtroChip, filtro === f.id && styles.filtroChipActive]}
                onPress={() => setFiltro(f.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.filtroEmoji}>{f.emoji}</Text>
                <Text style={[
                  styles.filtroLabel,
                  filtro === f.id && styles.filtroLabelActive
                ]}>
                  {f.label}
                </Text>
                {filtro === f.id && (
                  <View style={styles.filtroCount}>
                    <Text style={styles.filtroCountText}>
                      {registrosFiltrados.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Lista */}
      <ScrollView
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
        showsVerticalScrollIndicator={false}
      >
        {registrosAgrupados.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptySubtitle}>
              {busqueda ? 'No hay resultados para tu búsqueda' : 'No hay registros con este filtro'}
            </Text>
          </View>
        ) : (
          registrosAgrupados.map((grupo, gi) => (
            <View key={gi} style={styles.grupo}>
              <Text style={styles.grupoLabel}>
                📅 {grupo.label.charAt(0).toUpperCase() + grupo.label.slice(1)}
              </Text>
              {grupo.items.map(registro => (
                <RegistroCard
                  key={registro.id}
                  registro={registro}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: typography.sizes.md,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filtrosContainer: {
    paddingVertical: spacing.md,
  },
  filtrosRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  filtroChip: {
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
  filtroChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filtroEmoji: { fontSize: 14 },
  filtroLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  filtroLabelActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  filtroCount: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filtroCountText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  lista: { flex: 1 },
  listaContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.lg,
  },
  grupo: { gap: spacing.sm },
  grupoLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textTransform: 'capitalize',
  },
  registroCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  registroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  estadoBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoEmoji: { fontSize: 22 },
  registroInfo: { flex: 1, gap: 2 },
  registroFecha: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  registroMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  registroHora: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  registroTag: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  conductasCount: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  registroActions: {
    padding: spacing.xs,
  },
  expandArrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  registroDetalle: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  detalleSection: { gap: spacing.xs },
  detalleSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  detalleText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  conductasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  conductaTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  conductaTagText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  sinDetalles: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  deleteText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxxl,
    gap: spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});