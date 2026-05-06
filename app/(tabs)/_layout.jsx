import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const TabIcon = ({ emoji, label, focused }) => (
  <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
    <Text style={[styles.emoji, !focused && styles.emojiInactive]}>{emoji}</Text>
    <Text
      style={[styles.label, focused ? styles.labelFocused : styles.labelInactive]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {label}
    </Text>
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📝" label="Registro" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="Calendario" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ayuda"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="❤️" label="Ayuda" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.textPrimary,
    borderTopWidth: 0,
    height: isSmallScreen ? 62 : 72,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 6 : 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: width / 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  tabItemFocused: {
    backgroundColor: colors.primary,
  },
  emoji: {
    fontSize: isSmallScreen ? 18 : 21,
  },
  emojiInactive: {
    opacity: 0.45,
  },
  label: {
    fontSize: isSmallScreen ? 9 : 10,
    fontWeight: typography.weights.medium,
  },
  labelFocused: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  labelInactive: {
    color: 'rgba(255,255,255,0.5)',
  },
});
