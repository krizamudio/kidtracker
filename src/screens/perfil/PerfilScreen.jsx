import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIAS_DIAGNOSTICO, MOTIVOS_USO } from '../../data/diagnosticos';

const MenuItem = ({ emoji, title, subtitle, onPress, rightComponent, danger }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcono, danger && styles.menuIconoDanger]}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
    </View>
    <View style={styles.menuInfo}>
      <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {rightComponent || <Text style={styles.menuArrow}>›</Text>}
  </TouchableOpacity>
);

export default function PerfilScreen({ onClose }) {
  const { caregiver, child, caseConfig, registros, resetApp } = useApp();
  const { logout } = useAuth();
  const [notificaciones, setNotificaciones] = useState(true);
  const [recordatorios, setRecordatorios] = useState(true);

  const motivoLabel = MOTIVOS_USO.find(m => m.id === caseConfig?.motivo)?.label || 'No configurado';

  const categoriasLabels = caseConfig?.categorias
    ?.map(id => CATEGORIAS_DIAGNOSTICO.find(c => c.id === id)?.emoji)
    .join(' ') || '';

  const handleResetApp = () => {
    Alert.alert(
      '⚠️ Eliminar todos los datos',
      'Esto eliminará todos los registros, el perfil del niño y la configuración. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: async () => {
            await resetApp();
            router.replace('/(onboarding)/welcome');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil y Configuración</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Avatar cuidador */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>
              {caregiver?.relacion === 'mama' ? '👩' :
               caregiver?.relacion === 'papa' ? '👨' : '🧑'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{caregiver?.nombre || 'Cuidador'}</Text>
            <Text style={styles.profileRole}>
              {MOTIVOS_USO.find(m => m.id === caseConfig?.motivo)?.label || 'Cuidador principal'}
            </Text>
          </View>
          <View style={styles.profileStats}>
            <Text style={styles.profileStatNumber}>{registros.length}</Text>
            <Text style={styles.profileStatLabel}>registros</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>

        {/* Info del niño */}
        <Card>
          <Text style={styles.sectionTitle}>👦 Perfil del Niño/a</Text>
          <View style={styles.childInfo}>
            <View style={styles.childAvatar}>
              <Text style={styles.childAvatarEmoji}>
                {child?.sexo === 'nina' ? '👧' : '👦'}
              </Text>
            </View>
            <View style={styles.childDetails}>
              <Text style={styles.childName}>{child?.nombre || 'Sin configurar'}</Text>
              <Text style={styles.childAge}>{child?.edad} años</Text>
              {child?.escuela && (
                <Text style={styles.childSchool}>🏫 {child.escuela}</Text>
              )}
            </View>
          </View>
          <MenuItem
            emoji="✏️"
            title="Editar perfil del niño"
            subtitle="Nombre, edad, escuela"
            onPress={() => {
              onClose();
              router.push('/(onboarding)/child-profile');
            }}
          />
        </Card>

        {/* Configuración del caso */}
        <Card>
          <Text style={styles.sectionTitle}>⚙️ Configuración del Caso</Text>
          <View style={styles.casoInfo}>
            <View style={styles.casoRow}>
              <Text style={styles.casoLabel}>Motivo de uso</Text>
              <Text style={styles.casoValue}>{motivoLabel}</Text>
            </View>
            {categoriasLabels && (
              <View style={styles.casoRow}>
                <Text style={styles.casoLabel}>Categorías</Text>
                <Text style={styles.casoValue}>{categoriasLabels}</Text>
              </View>
            )}
          </View>
          <MenuItem
            emoji="🔧"
            title="Editar configuración"
            subtitle="Motivo y categorías diagnósticas"
            onPress={() => {
              onClose();
              router.push('/(onboarding)/case-config');
            }}
          />
        </Card>

        {/* Notificaciones */}
        <Card>
          <Text style={styles.sectionTitle}>🔔 Notificaciones</Text>
          <MenuItem
            emoji="⏰"
            title="Recordatorio diario"
            subtitle="Recibir recordatorio para registrar"
            onPress={() => {}}
            rightComponent={
              <Switch
                value={recordatorios}
                onValueChange={setRecordatorios}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={recordatorios ? colors.primary : colors.textLight}
              />
            }
          />
          <MenuItem
            emoji="📱"
            title="Notificaciones push"
            subtitle="Tips y recordatorios motivacionales"
            onPress={() => {}}
            rightComponent={
              <Switch
                value={notificaciones}
                onValueChange={setNotificaciones}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificaciones ? colors.primary : colors.textLight}
              />
            }
          />
        </Card>

        {/* Datos */}
        <Card>
          <Text style={styles.sectionTitle}>💾 Datos</Text>
          <MenuItem
            emoji="📤"
            title="Exportar registros"
            subtitle="Próximamente disponible"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
          <MenuItem
            emoji="🗑️"
            title="Eliminar todos los datos"
            subtitle="Reiniciar la app completamente"
            onPress={handleResetApp}
            danger
          />
        </Card>

        <Card>
          <MenuItem
            emoji="🚪"
            title="Cerrar sesión"
            subtitle="Salir de la cuenta"
            onPress={() => Alert.alert(
              'Cerrar sesión',
              '¿Deseas cerrar sesión?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Cerrar sesión',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await logout();
                      router.replace('/auth/login');
                    } catch (e) {
                      Alert.alert('Error', 'No se pudo cerrar sesión.');
                    }
                  },
                },
              ]
            )}
            danger
          />
        </Card>

        {/* Acerca de */}
        <Card>
          <Text style={styles.sectionTitle}>ℹ️ Acerca de</Text>
          <MenuItem
            emoji="📋"
            title="Versión de la app"
            subtitle="KidTracker v1.0.0"
            onPress={() => {}}
          />
          <MenuItem
            emoji="🔒"
            title="Privacidad"
            subtitle="Tus datos son privados y locales"
            onPress={() => Alert.alert(
              'Privacidad 🔒',
              'Todos tus datos se guardan únicamente en este dispositivo. No se comparten con ningún servidor.'
            )}
          />
        </Card>

      </View>
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
    backgroundColor: '#1C1917',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarEmoji: { fontSize: 30 },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  profileRole: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  profileStats: { alignItems: 'center' },
  profileStatNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  profileStatLabel: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  body: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarEmoji: { fontSize: 26 },
  childDetails: { flex: 1 },
  childName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  childAge: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  childSchool: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  casoInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  casoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  casoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  casoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  menuIcono: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconoDanger: {
    backgroundColor: '#FEE2E2',
  },
  menuEmoji: { fontSize: 18 },
  menuInfo: { flex: 1 },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  menuTitleDanger: { color: colors.error },
  menuSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  menuArrow: {
    fontSize: typography.sizes.xl,
    color: colors.textLight,
  },
});