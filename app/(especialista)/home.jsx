import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Alert, ActivityIndicator, BackHandler,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { useAuth } from '../../src/context/AuthContext';
import { especialistaService } from '../../src/services/especialistaService';

const PacienteCard = ({ paciente, onPress }) => (
  <TouchableOpacity
    style={styles.pacienteCard}
    onPress={() => onPress(paciente)}
    activeOpacity={0.7}
  >
    <View style={styles.pacienteAvatar}>
      <Text style={styles.pacienteAvatarEmoji}>👨‍👩‍👧</Text>
    </View>
    <View style={styles.pacienteInfo}>
      <Text style={styles.pacienteNombre}>{paciente.nombre}</Text>
      <Text style={styles.pacienteEmail}>{paciente.email}</Text>
      <Text style={styles.pacienteId}>ID: {paciente.uid.slice(0, 8)}...</Text>
    </View>
    <Text style={styles.pacienteArrow}>→</Text>
  </TouchableOpacity>
);

export default function EspecialistaHomeScreen() {
  const { perfil, logout, user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [misPacientes, setMisPacientes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cargarMisPacientes();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);


  const cargarMisPacientes = async () => {
    try {
      const pacientes = await especialistaService.getMisPacientes(perfil.uid);
      setMisPacientes(pacientes);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = async () => {
    if (!busqueda.trim()) return;
    setBuscando(true);
    try {
      const found = await especialistaService.buscarPaciente(busqueda.trim());
      // Añadir flag indicando si ya están vinculados para mostrar estado en UI
      const withFlag = found.map(f => ({
        ...f,
        vinculado: misPacientes.some(p => p.uid === f.uid),
      }));
      setResultados(withFlag);
      if (withFlag.length === 0) {
        Alert.alert('Sin resultados', 'No se encontró ningún cuidador con ese nombre o ID.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda.');
    } finally {
      setBuscando(false);
    }
  };

  const handleVincular = async (paciente) => {
    Alert.alert(
      'Vincular paciente',
      `¿Deseas vincularte con ${paciente.nombre} para ver sus registros?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vincular',
          onPress: async () => {
            try {
              await especialistaService.vincular(perfil.uid, paciente.uid);
              setResultados([]);
              setBusqueda('');
              await cargarMisPacientes();
              Alert.alert('✅ Vinculado', `Ahora puedes ver los registros de ${paciente.nombre}.`);
            } catch (error) {
              Alert.alert('Error', 'No se pudo realizar la vinculación.');
            }
          },
        },
      ]
    );
  };

  const handleVerPaciente = (paciente) => {
    router.push({
      pathname: '/(especialista)/paciente',
      params: {
        cuidadorId: paciente.uid,
        nombre: paciente.nombre,
      },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Manejar botón físico "atrás" en Android para mostrar alerta de cerrar sesión
  useEffect(() => {
    const onBackPress = () => {
      handleLogout();
      return true; // prevenir comportamiento por defecto (cerrar la app/navegar)
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [handleLogout]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <Animated.View style={{ opacity: fadeAnim, gap: spacing.md }}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>¡Hola, {perfil?.nombre || user?.displayName || 'Especialista'}! 🧑‍⚕️</Text>
              <Text style={styles.especialidad}>{perfil?.especialidad || 'Especialista'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutEmoji}>🚪</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{misPacientes.length}</Text>
              <Text style={styles.statLabel}>Pacientes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>🔒</Text>
              <Text style={styles.statLabel}>Modo lectura</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>

        {/* Buscador */}
        <Card>
          <Text style={styles.sectionTitle}>🔍 Buscar Paciente</Text>
          <Text style={styles.sectionSubtitle}>
            Busca por nombre del cuidador o ID de usuario
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Nombre o ID del cuidador..."
              placeholderTextColor={colors.textLight}
              onSubmitEditing={handleBuscar}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleBuscar}
              activeOpacity={0.8}
            >
              {buscando
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.searchButtonText}>Buscar</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Resultados de búsqueda */}
          {resultados.length > 0 && (
            <View style={styles.resultados}>
              <Text style={styles.resultadosTitle}>
                {resultados.length} resultado{resultados.length > 1 ? 's' : ''}
              </Text>
              {resultados.map(paciente => (
                <TouchableOpacity
                  key={paciente.uid}
                  style={styles.resultadoItem}
                  onPress={() => (paciente.vinculado ? handleVerPaciente(paciente) : handleVincular(paciente))}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultadoAvatar}>
                    <Text style={styles.resultadoEmoji}>👨‍👩‍👧</Text>
                  </View>
                  <View style={styles.resultadoInfo}>
                    <Text style={styles.resultadoNombre}>{paciente.nombre}</Text>
                    <Text style={styles.resultadoEmail}>{paciente.email}</Text>
                  </View>
                  {paciente.vinculado ? (
                    <View style={[styles.vincularBadge, styles.vinculadoBadge]}>
                      <Text style={styles.vincularText}>Vinculado</Text>
                    </View>
                  ) : (
                    <View style={styles.vincularBadge}>
                      <Text style={styles.vincularText}>+ Vincular</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Mis pacientes */}
        <Card>
          <Text style={styles.sectionTitle}>👥 Mis Pacientes</Text>
          {cargando ? (
            <ActivityIndicator color={colors.primary} style={{ padding: spacing.xl }} />
          ) : misPacientes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👤</Text>
              <Text style={styles.emptyTitle}>Sin pacientes vinculados</Text>
              <Text style={styles.emptySubtitle}>
                Busca a un cuidador por nombre o ID para vincularte y ver sus registros
              </Text>
            </View>
          ) : (
            <View style={styles.pacientesList}>
              {misPacientes.map(paciente => (
                <PacienteCard
                  key={paciente.uid}
                  paciente={paciente}
                  onPress={handleVerPaciente}
                />
              ))}
            </View>
          )}
        </Card>

        {/* Info de privacidad */}
        <View style={styles.privacidadCard}>
          <Text style={styles.privacidadEmoji}>🔒</Text>
          <Text style={styles.privacidadText}>
            Solo puedes ver registros de pacientes que te hayan dado acceso mediante vinculación. Tienes acceso en modo lectura únicamente.
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
    backgroundColor: '#7C3AED',
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    gap: spacing.lg,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  especialidad: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutEmoji: { fontSize: 18 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
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
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  resultados: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  resultadosTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  resultadoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultadoAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultadoEmoji: { fontSize: 22 },
  resultadoInfo: { flex: 1 },
  resultadoNombre: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  resultadoEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  vincularBadge: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  vinculadoBadge: {
    backgroundColor: '#0EA5A4',
  },
  vincularText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  pacientesList: { gap: spacing.sm },
  pacienteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pacienteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pacienteAvatarEmoji: { fontSize: 26 },
  pacienteInfo: { flex: 1 },
  pacienteNombre: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  pacienteEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  pacienteId: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  pacienteArrow: {
    fontSize: typography.sizes.lg,
    color: '#7C3AED',
    fontWeight: typography.weights.bold,
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
    paddingHorizontal: spacing.md,
  },
  privacidadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
  },
  privacidadEmoji: { fontSize: 24 },
  privacidadText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: '#5B21B6',
    lineHeight: 20,
  },
});