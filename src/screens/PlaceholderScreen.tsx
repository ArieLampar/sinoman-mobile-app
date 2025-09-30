import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PlaceholderScreenProps {
  title: string;
  description?: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, description }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          {title}
        </Text>
        {description && (
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurface }]}>
            {description}
          </Text>
        )}
        <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
            Coming Soon
          </Text>
        </View>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  surface: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
    minWidth: 280,
  },
  description: {
    marginTop: 12,
    textAlign: 'center',
  },
  badge: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});