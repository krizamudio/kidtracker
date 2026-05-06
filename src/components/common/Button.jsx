import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const Button = ({
  title,
  onPress,
  variant = 'primary',  // primary | secondary | outline | ghost
  size = 'md',          // sm | md | lg
  loading = false,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Variantes
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },

  // Tamaños
  size_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  size_md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  size_lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl },

  // Texto
  text: {
    fontWeight: typography.weights.semibold,
  },
  text_primary: { color: colors.white },
  text_secondary: { color: colors.primary },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },

  textSize_sm: { fontSize: typography.sizes.sm },
  textSize_md: { fontSize: typography.sizes.md },
  textSize_lg: { fontSize: typography.sizes.lg },
});