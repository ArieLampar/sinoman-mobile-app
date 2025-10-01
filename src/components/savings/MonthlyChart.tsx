import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { MonthlyChartData } from '@types';

interface MonthlyChartProps {
  data: MonthlyChartData;
  title: string;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data, title }) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  if (!data?.labels?.length || data.labels.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Belum ada data untuk ditampilkan
        </Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.colors.surfaceVariant,
      strokeWidth: 1,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>

      <LineChart
        data={data}
        width={screenWidth - 64}
        height={220}
        chartConfig={chartConfig}
        bezier
        withInnerLines
        withHorizontalLines
        withVerticalLabels
        withHorizontalLabels
        withDots
        withShadow={false}
        formatYLabel={(value) => {
          const num = parseFloat(value);
          if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
          } else if (num >= 1000) {
            return `${(num / 1000).toFixed(0)}K`;
          }
          return value;
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});
