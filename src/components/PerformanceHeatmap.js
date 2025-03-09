import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const PerformanceHeatmap = ({ holdings }) => {
  // Sort holdings by absolute market value (descending)
  const sortedHoldings = [...holdings].sort((a, b) => {
    const aValue = Math.abs(a.marketValue);
    const bValue = Math.abs(b.marketValue);
    return bValue - aValue;
  });

  // Find the maximum market value for scaling
  const maxMarketValue = Math.max(...holdings.map(h => Math.abs(h.marketValue)));
  
  // Calculate the minimum size for the smallest holding (20% of the largest)
  const minSize = 40;
  const maxSize = 100;

  const getBoxSize = (marketValue) => {
    const ratio = Math.abs(marketValue) / maxMarketValue;
    return minSize + (maxSize - minSize) * ratio;
  };

  const getColorIntensity = (performance) => {
    // Cap the intensity between -20% and +20% for better visualization
    const cappedPerformance = Math.max(-20, Math.min(20, performance));
    const intensity = Math.abs(cappedPerformance) / 20;
    
    if (performance >= 0) {
      // Green with varying intensity
      return `rgba(52, 199, 89, ${0.3 + 0.7 * intensity})`;
    } else {
      // Red with varying intensity
      return `rgba(255, 59, 48, ${0.3 + 0.7 * intensity})`;
    }
  };

  // Calculate layout for a responsive grid
  const screenWidth = Dimensions.get('window').width - 32; // Account for container padding
  const boxes = [];
  let currentRow = [];
  let currentRowWidth = 0;
  const padding = 8;

  sortedHoldings.forEach((holding, index) => {
    const size = getBoxSize(holding.marketValue);
    
    if (currentRowWidth + size + padding > screenWidth && currentRow.length > 0) {
      boxes.push(currentRow);
      currentRow = [];
      currentRowWidth = 0;
    }
    
    currentRow.push({
      ...holding,
      size,
    });
    currentRowWidth += size + padding;
  });
  
  if (currentRow.length > 0) {
    boxes.push(currentRow);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Holdings Heatmap</Text>
      <View style={styles.heatmapContainer}>
        {boxes.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((holding, colIndex) => (
              <View
                key={`${holding.symbol}-${rowIndex}-${colIndex}`}
                style={[
                  styles.box,
                  {
                    width: holding.size,
                    height: holding.size,
                    backgroundColor: getColorIntensity(holding.dayChange),
                  },
                ]}
              >
                <Text style={styles.symbol}>{holding.symbol}</Text>
                <Text style={styles.performance}>
                  {holding.dayChange >= 0 ? '+' : ''}{holding.dayChange.toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  heatmapContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  box: {
    margin: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  symbol: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  performance: {
    color: '#333333',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default PerformanceHeatmap; 