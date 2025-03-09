import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { usePortfolio } from '../context/PortfolioContext';
import { Ionicons } from '@expo/vector-icons';

const HoldingDetailModal = ({ holding, isVisible, onClose }) => {
  if (!holding) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{holding.symbol}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{holding.type.toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>
                {holding.type === 'option' ? 
                  `${holding.quantity} contracts` : 
                  `${holding.quantity} shares`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Price</Text>
              <Text style={styles.detailValue}>${holding.currentPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cost Basis</Text>
              <Text style={styles.detailValue}>${holding.costBasis?.toFixed(2) || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Market Value</Text>
              <Text style={styles.detailValue}>
                ${(holding.quantity * holding.currentPrice * (holding.type === 'option' ? (holding.contractMultiplier || 100) : 1)).toFixed(2)}
              </Text>
            </View>
            {holding.type === 'option' && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Strike Price</Text>
                  <Text style={styles.detailValue}>${holding.strikePrice?.toFixed(2) || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expiration</Text>
                  <Text style={styles.detailValue}>{holding.expirationDate || 'N/A'}</Text>
                </View>
              </>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Brokerage</Text>
              <Text style={styles.detailValue}>{holding.brokerageName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account</Text>
              <Text style={styles.detailValue}>{holding.accountName}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const HoldingCard = ({ holding, onPress }) => {
  const marketValue = holding.quantity * holding.currentPrice * 
    (holding.type === 'option' ? (holding.contractMultiplier || 100) : 1);
  
  return (
    <TouchableOpacity style={styles.holdingCard} onPress={() => onPress(holding)}>
      <View style={styles.holdingMain}>
        <Text style={styles.symbolText}>{holding.symbol}</Text>
        <Text style={styles.quantityText}>
          {holding.type === 'option' ? 
            `${holding.quantity} contracts` : 
            `${holding.quantity} shares`}
        </Text>
      </View>
      <View style={styles.holdingValue}>
        <Text style={styles.valueText}>${marketValue.toFixed(2)}</Text>
        <Text style={[
          styles.changeText,
          { color: holding.dayChange >= 0 ? '#34C759' : '#FF3B30' }
        ]}>
          {holding.dayChange >= 0 ? '+' : ''}{holding.dayChange}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HoldingsScreen = ({ navigation }) => {
  const { brokerageData } = usePortfolio();
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { stocks, options } = useMemo(() => {
    const stocks = [];
    const options = [];

    try {
      Object.entries(brokerageData || {}).forEach(([brokerageName, brokerage]) => {
        Object.entries(brokerage.accounts || {}).forEach(([accountName, account]) => {
          (account.positions || []).forEach(position => {
            if (!position || !position.symbol) return;

            const enrichedPosition = {
              ...position,
              brokerageName,
              accountName,
              dayChange: position.dayChange || 0,
            };

            if (position.type === 'stock') {
              stocks.push(enrichedPosition);
            } else if (position.type === 'option') {
              options.push(enrichedPosition);
            }
          });
        });
      });
    } catch (error) {
      console.error('Error processing holdings:', error);
    }

    // Sort by market value (descending)
    const sortByValue = (a, b) => {
      const aValue = a.quantity * a.currentPrice * (a.type === 'option' ? (a.contractMultiplier || 100) : 1);
      const bValue = b.quantity * b.currentPrice * (b.type === 'option' ? (b.contractMultiplier || 100) : 1);
      return bValue - aValue;
    };

    return {
      stocks: stocks.sort(sortByValue),
      options: options.sort(sortByValue)
    };
  }, [brokerageData]);

  const handleHoldingPress = (holding) => {
    setSelectedHolding(holding);
    setModalVisible(true);
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
          <View style={styles.sectionList}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stocks</Text>
              {stocks.map((stock, index) => (
                <HoldingCard
                  key={`${stock.symbol}-${stock.brokerageName}-${stock.accountName}`}
                  holding={stock}
                  onPress={handleHoldingPress}
                />
              ))}
              {stocks.length === 0 && (
                <Text style={styles.emptyText}>No stock holdings</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Options</Text>
              {options.map((option, index) => (
                <HoldingCard
                  key={`${option.symbol}-${option.brokerageName}-${option.accountName}`}
                  holding={option}
                  onPress={handleHoldingPress}
                />
              ))}
              {options.length === 0 && (
                <Text style={styles.emptyText}>No option holdings</Text>
              )}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('TradeEntry')}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>

        <HoldingDetailModal
          holding={selectedHolding}
          isVisible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedHolding(null);
          }}
        />
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
  sectionList: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginVertical: 16,
  },
  holdingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  holdingMain: {
    flex: 1,
  },
  symbolText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 13,
    color: '#666666',
  },
  holdingValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 15,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HoldingsScreen; 