import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { especialistaService } from '../../src/services/especialistaService';
import { getAuth } from 'firebase/auth';

export default function BuscarPaciente() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!termino.trim()) return;
    setLoading(true);
    try {
      const res = await especialistaService.buscarPaciente(termino.trim());
      setResultados(res);
    } catch (e) {
      Alert.alert('Error', 'No se pudo buscar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const verPaciente = (paciente) => {
    router.push({ pathname: '/(especialista)/paciente', params: { id: paciente.uid } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Paciente</Text>
      <View style={styles.searchRow}>
        <TextInput
          value={termino}
          onChangeText={setTermino}
          placeholder="Nombre, UID o nombre del niño"
          style={styles.input}
          onSubmitEditing={buscar}
        />
        <TouchableOpacity onPress={buscar} style={styles.button}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={resultados}
        keyExtractor={(i) => i.uid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => verPaciente(item)}>
            <View>
              <Text style={styles.name}>{item.nombre || 'Sin nombre'}</Text>
              <Text style={styles.sub}>{item.childNombre || ''}</Text>
            </View>
            <Text style={styles.go}>Ver ›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Buscando...' : 'No hay resultados'}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  input: { flex: 1, backgroundColor: colors.white, padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  button: { padding: spacing.md, backgroundColor: colors.primary, borderRadius: 10, justifyContent: 'center' },
  buttonText: { color: colors.white },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.white, borderRadius: 10, marginBottom: spacing.sm },
  name: { fontWeight: typography.weights.bold },
  sub: { color: colors.textSecondary },
  go: { color: colors.primary },
  empty: { textAlign: 'center', marginTop: spacing.lg, color: colors.textSecondary },
});
