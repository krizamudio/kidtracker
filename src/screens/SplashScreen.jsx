import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const circle1Scale = useRef(new Animated.Value(0)).current;
  const circle2Scale = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Círculos de fondo
      Animated.parallel([
        Animated.spring(circle1Scale, {
          toValue: 1, friction: 6, tension: 30, useNativeDriver: true,
        }),
        Animated.spring(circle2Scale, {
          toValue: 1, friction: 5, tension: 25, useNativeDriver: true,
        }),
      ]),
      // Logo aparece
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1, friction: 5, tension: 40, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
      ]),
      // Título
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0, duration: 400, useNativeDriver: true,
        }),
      ]),
      // Subtítulo
      Animated.timing(subtitleOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
      // Dots de carga
      Animated.timing(dotsOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
    ]).start(() => {
      // Esperar un momento y terminar
      setTimeout(onFinish, 800);
    });
  }, []);

  return (
    <View style={styles.container}>

      {/* Círculos decorativos animados */}
      <Animated.View style={[
        styles.circle1,
        { transform: [{ scale: circle1Scale }] }
      ]} />
      <Animated.View style={[
        styles.circle2,
        { transform: [{ scale: circle2Scale }] }
      ]} />
      <Animated.View style={[
        styles.circle3,
        { transform: [{ scale: circle2Scale }] }
      ]} />

      {/* Contenido central */}
      <View style={styles.content}>

        {/* Logo */}
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }
        ]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoEmoji}>👦</Text>
            </View>
            {/* Badges decorativos */}
            <View style={[styles.logoBadge, styles.logoBadge1]}>
              <Text style={styles.logoBadgeEmoji}>⭐</Text>
            </View>
            <View style={[styles.logoBadge, styles.logoBadge2]}>
              <Text style={styles.logoBadgeEmoji}>💚</Text>
            </View>
            <View style={[styles.logoBadge, styles.logoBadge3]}>
              <Text style={styles.logoBadgeEmoji}>📝</Text>
            </View>
          </View>
        </Animated.View>

        {/* Título */}
        <Animated.View style={[
          styles.titleContainer,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleSlide }],
          }
        ]}>
          <Text style={styles.appName}>KidTracker</Text>
          <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
            Monitoreo con amor 💛
          </Animated.Text>
        </Animated.View>

      </View>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
        <LoadingDots />
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>

    </View>
  );
}

const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <View style={styles.dots}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: dot }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Círculos decorativos
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -width * 0.3,
    left: -width * 0.1,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -width * 0.1,
    right: -width * 0.2,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: height * 0.2,
    left: -width * 0.1,
  },

  // Contenido
  content: {
    alignItems: 'center',
    gap: spacing.xxl,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    width: 160,
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  logoEmoji: { fontSize: 70 },
  logoBadge: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logoBadge1: { top: 8,  right: 4  },
  logoBadge2: { bottom: 8, left: 4  },
  logoBadge3: { top: 8,  left: 4   },
  logoBadgeEmoji: { fontSize: 18 },

  // Título
  titleContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    fontSize: 38,
    fontWeight: typography.weights.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: typography.sizes.lg,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: typography.weights.medium,
  },

  // Dots
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },

  // Version
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.5)',
  },
});