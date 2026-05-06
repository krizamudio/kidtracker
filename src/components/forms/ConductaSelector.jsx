import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const ConductaItem = ({ conducta, selected, onToggle, categoryColor }) => (
  <TouchableOpacity
    style={[
      styles.conductaItem,
      selected && { borderColor: categoryColor, backgroundColor: categoryColor + '15' },
    ]}
    onPress={() => onToggle(conducta.id)}
    activeOpacity={0.7}
  >
    <View style={[
      styles.checkbox,
      selected && { backgroundColor: categoryColor, borderColor: categoryColor },
    ]}>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={[
      styles.conductaText,
      selected && { color: categoryColor, fontWeight: typography.weights.semibold },
    ]}>
      {conducta.label}
    </Text>
  </TouchableOpacity>
);

const SubcategoriaSection = ({ subcategoria, selectedIds, onToggle, categoryColor }) => {
  const [expanded, setExpanded] = useState(true);
  const selectedCount = subcategoria.conductas.filter(c => selectedIds.includes(c.id)).length;

  return (
    <View style={styles.subcategoriaContainer}>
      <TouchableOpacity
        style={styles.subcategoriaHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.subcategoriaLeft}>
          <Text style={styles.subcategoriaTitle}>{subcategoria.label}</Text>
          {selectedCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.countText}>{selectedCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.expandArrow, { color: categoryColor }]}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.conductasList}>
          {subcategoria.conductas.map(conducta => (
            <ConductaItem
              key={conducta.id}
              conducta={conducta}
              selected={selectedIds.includes(conducta.id)}
              onToggle={onToggle}
              categoryColor={categoryColor}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const ConductaSelector = ({
  categoria,
  selectedIds = [],
  onToggle,
}) => {
  const totalSelected = selectedIds.filter(id =>
    categoria.subcategorias.some(sub =>
      sub.conductas.some(c => c.id === id)
    )
  ).length;

  return (
    <View style={styles.container}>
      {/* Header de categoría */}
      <View style={[styles.categoryHeader, { borderLeftColor: categoria.color }]}>
        <Text style={styles.categoryEmoji}>{categoria.emoji}</Text>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{categoria.label}</Text>
          <Text style={styles.categorySubtitle}>
            {totalSelected > 0
              ? `${totalSelected} conducta${totalSelected > 1 ? 's' : ''} seleccionada${totalSelected > 1 ? 's' : ''}`
              : 'Toca las conductas observadas hoy'}
          </Text>
        </View>
      </View>

      {/* Subcategorías */}
      {categoria.subcategorias.map(sub => (
        <SubcategoriaSection
          key={sub.id}
          subcategoria={sub}
          selectedIds={selectedIds}
          onToggle={onToggle}
          categoryColor={categoria.color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  categoryEmoji: { fontSize: 28 },
  categoryInfo: { flex: 1 },
  categoryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  categorySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subcategoriaContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  subcategoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  subcategoriaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  subcategoriaTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  expandArrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  conductasList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  conductaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderLeftWidth: 0,
    borderColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    flexShrink: 0,
  },
  checkmark: {
    fontSize: 13,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  conductaText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
});