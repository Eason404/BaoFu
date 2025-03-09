import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { usePortfolio } from '../context/PortfolioContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import PerformanceHeatmap from './PerformanceHeatmap';

const HomeScreen = () => {
  const { brokerageData } = usePortfolio();
  const screenWidth = Dimensions.get('window').width;

  const { portfolioSummary, holdings } = useMemo(() => {
    let totalValue = 0;
    let stockValue = 0;
    let optionValue = 0;
    let dailyChangePercentage = 0;
    let accountCount = 0;
    const allHoldings = [];

    try {
      // First pass: Calculate total value and daily change
      Object.values(brokerageData || {}).forEach(brokerage => {
        Object.values(brokerage.accounts || {}).forEach(account => {
          if (!account) return;
          
          accountCount++;
          const accountTotalValue = parseFloat(account.totalValue) || 0;
          totalValue += accountTotalValue;
          
          // Calculate daily change
          const dailyChange = account.performance?.daily || '0%';
          const parsedChange = parseFloat(dailyChange.replace('%', ''));
          if (!isNaN(parsedChange)) {
            dailyChangePercentage += parsedChange;
          }
        });
      });

      // Second pass: Calculate positions and collect holdings
      Object.entries(brokerageData || {}).forEach(([brokerageName, brokerage]) => {
        Object.entries(brokerage.accounts || {}).forEach(([accountName, account]) => {
          if (!account || !Array.isArray(account.positions)) return;
          
          account.positions.forEach(position => {
            if (!position || !position.symbol) return;
            
            try {
              const quantity = parseFloat(position.quantity) || 0;
              const currentPrice = parseFloat(position.currentPrice) || 0;
              const positionValue = quantity * currentPrice * 
                (position.type === 'option' ? (position.contractMultiplier || 100) : 1);
              
              if (position.type === 'stock') {
                stockValue += positionValue;
              } else if (position.type === 'option') {
                optionValue += positionValue;
              }

              // Add to holdings array for heatmap
              allHoldings.push({
                symbol: position.symbol,
                type: position.type,
                marketValue: positionValue,
                dayChange: position.dayChange || 0,
              });
            } catch (positionError) {
              console.error('Error calculating position value:', positionError);
            }
          });
        });
      });

      // Calculate average daily change percentage
      dailyChangePercentage = accountCount > 0 ? dailyChangePercentage / accountCount : 0;

    } catch (error) {
      console.error('Error calculating portfolio summary:', error);
    }

    // Ensure non-negative values and round to 2 decimal places
    return {
      portfolioSummary: {
        totalValue: Math.max(0, parseFloat(totalValue.toFixed(2))),
        stockValue: Math.max(0, parseFloat(stockValue.toFixed(2))),
        optionValue: Math.max(0, parseFloat(optionValue.toFixed(2))),
        dailyChangePercentage: parseFloat(dailyChangePercentage.toFixed(2))
      },
      holdings: allHoldings
    };
  }, [brokerageData]);

  // Mock data for the chart - in a real app, this would come from your API
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [100, 105, 108, 112, 115, 120],
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Bright green for portfolio
        strokeWidth: 3
      },
      {
        data: [100, 102, 104, 103, 106, 108],
        color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`, // Purple for S&P 500
        strokeWidth: 2
      }
    ]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: '#ffffff'
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600'
    },
    formatYLabel: (value) => `${value}%`
  };

  const formatCurrency = (value) => {
    try {
      return `$${Math.abs(value || 0).toLocaleString()}`;
    } catch {
      return '$0';
    }
  };

  const formatPercentage = (value) => {
    try {
      const numValue = parseFloat(value) || 0;
      return `${numValue > 0 ? '+' : ''}${numValue.toFixed(2)}%`;
    } catch {
      return '0.00%';
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
          overScrollMode="always"
        >
          <View style={styles.header}>
            <Text style={styles.totalValue}>
              {formatCurrency(portfolioSummary.totalValue)}
            </Text>
            <View style={styles.changeIndicator}>
              <Ionicons
                name={portfolioSummary.dailyChangePercentage >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={portfolioSummary.dailyChangePercentage >= 0 ? '#34C759' : '#FF3B30'}
              />
              <Text style={[
                styles.changeText,
                { color: portfolioSummary.dailyChangePercentage >= 0 ? '#34C759' : '#FF3B30' }
              ]}>
                {formatPercentage(portfolioSummary.dailyChangePercentage)}
              </Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Performance vs S&P 500</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 48}
              height={240}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              segments={5}
              fromZero={false}
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                <Text style={styles.legendText}>Portfolio</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#5856D6' }]} />
                <Text style={styles.legendText}>S&P 500</Text>
              </View>
            </View>
          </View>

          <PerformanceHeatmap holdings={holdings} />

          <View style={styles.holdingsContainer}>
            <View style={styles.holdingItem}>
              <Text style={styles.holdingLabel}>Stock Holdings</Text>
              <Text style={styles.holdingValue}>
                {formatCurrency(portfolioSummary.stockValue)}
              </Text>
            </View>
            <View style={styles.holdingDivider} />
            <View style={styles.holdingItem}>
              <Text style={styles.holdingLabel}>Option Holdings</Text>
              <Text style={styles.holdingValue}>
                {formatCurrency(portfolioSummary.optionValue)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 12,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333333',
  },
  holdingsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  holdingItem: {
    flex: 1,
    alignItems: 'center',
  },
  holdingDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  holdingLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  holdingValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
});

export default HomeScreen; 