import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const avatarScale = useRef(new Animated.Value(0)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(30)).current;
  const badge1Scale = useRef(new Animated.Value(0)).current;
  const badge2Scale = useRef(new Animated.Value(0)).current;
  const badge3Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Avatar entra
      Animated.parallel([
        Animated.spring(avatarScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(avatarOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Badges aparecen escalonados
      Animated.stagger(150, [
        Animated.spring(badge1Scale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.spring(badge2Scale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.spring(badge3Scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      // Texto aparece
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // Botones al final
      Animated.parallel([
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonsTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View style={styles.content}>

        {/* Avatar animado */}
        <Animated.View style={[
          styles.illustrationContainer,
          { opacity: avatarOpacity, transform: [{ scale: avatarScale }] }
        ]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👦</Text>
          </View>
          <Animated.View style={[styles.floatingBadge, styles.badgeTopRight, { transform: [{ scale: badge1Scale }] }]}>
            <Text style={styles.floatingEmoji}>⭐</Text>
          </Animated.View>
          <Animated.View style={[styles.floatingBadge, styles.badgeBottomLeft, { transform: [{ scale: badge2Scale }] }]}>
            <Text style={styles.floatingEmoji}>💚</Text>
          </Animated.View>
          <Animated.View style={[styles.floatingBadge, styles.badgeTopLeft, { transform: [{ scale: badge3Scale }] }]}>
            <Text style={styles.floatingEmoji}>📝</Text>
          </Animated.View>
        </Animated.View>

        {/* Texto animado */}
        <Animated.View style={[
          styles.textContainer,
          { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }
        ]}>
          <Text style={styles.title}>¡Bienvenido a</Text>
          <Text style={styles.titleAccent}>Tu App de Monitoreo!</Text>
          <Text style={styles.subtitle}>
            Registra y comprende el comportamiento de tu hijo de manera simple y efectiva.
          </Text>
        </Animated.View>

        {/* Dots */}
        <Animated.View style={[styles.dotsContainer, { opacity: textOpacity }]}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Animated.View>

      </View>

      {/* Botones animados */}
      <Animated.View style={[styles.buttonsContainer, { opacity: buttonsOpacity, transform: [{ translateY: buttonsTranslateY }] }]}>
        <Button
          title="Comenzar"
          onPress={() => router.push('/auth/register')}
          size="lg"
          style={styles.mainButton}
        />
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>¿Ya tienes cuenta? <Text style={styles.loginLinkAccent}>Iniciar sesión</Text></Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxxxl,
  },
  circleTop: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.primaryLight,
    opacity: 0.4,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circleBottom: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: colors.primaryLight,
    opacity: 0.3,
    bottom: -width * 0.1,
    left: -width * 0.15,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  illustrationContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarEmoji: { fontSize: 72 },
  floatingBadge: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeTopRight: { top: 5, right: 0 },
  badgeBottomLeft: { bottom: 5, left: 0 },
  badgeTopLeft: { top: 5, left: 0 },
  floatingEmoji: { fontSize: 18 },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
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
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  mainButton: { width: '100%' },
  loginLink: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loginLinkAccent: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});