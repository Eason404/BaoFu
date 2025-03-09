import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePortfolio } from '../context/PortfolioContext';

const PortfolioScreen = () => {
  const { brokerageData } = usePortfolio();
  const [selectedBrokerage, setSelectedBrokerage] = useState('schwab');
  const [selectedAccount, setSelectedAccount] = useState('personal');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const currentBrokerage = brokerageData[selectedBrokerage];
  const accountData = currentBrokerage.accounts[selectedAccount] || Object.values(currentBrokerage.accounts)[0];

  const BrokerageSelector = () => (
    <View style={styles.brokerageSelector}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsDropdownVisible(true)}
      >
        <View style={styles.selectedBrokerage}>
          <View style={styles.brokerageIconContainer}>
            <Text style={styles.brokerageIcon}>{currentBrokerage.icon}</Text>
          </View>
          <View style={styles.brokerageInfo}>
            <Text style={styles.brokerageName}>{currentBrokerage.name}</Text>
            <Text style={styles.accountName}>{accountData.name}</Text>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-down" size={20} color="#666666" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.dropdownContent}>
            {Object.entries(brokerageData).map(([brokerageKey, brokerage]) => (
              <View key={brokerageKey} style={styles.brokerageSection}>
                <View style={styles.brokerageHeader}>
                  <View style={styles.brokerageIconContainer}>
                    <Text style={styles.brokerageIcon}>{brokerage.icon}</Text>
                  </View>
                  <Text style={styles.dropdownBrokerageName}>{brokerage.name}</Text>
                </View>
                {Object.entries(brokerage.accounts).map(([accountKey, account]) => (
                  <TouchableOpacity
                    key={accountKey}
                    style={[
                      styles.dropdownItem,
                      selectedBrokerage === brokerageKey && selectedAccount === accountKey && styles.dropdownItemActive
                    ]}
                    onPress={() => {
                      setSelectedBrokerage(brokerageKey);
                      setSelectedAccount(accountKey);
                      setIsDropdownVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownAccountName,
                      selectedBrokerage === brokerageKey && selectedAccount === accountKey && styles.dropdownAccountNameActive
                    ]}>
                      {account.name}
                    </Text>
                    {selectedBrokerage === brokerageKey && selectedAccount === accountKey && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <BrokerageSelector />
      
      <View style={styles.mainContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio Overview</Text>
            <Text style={styles.totalPortfolioValue}>
              ${accountData.totalValue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.label}>Cash Balance</Text>
              <Text style={styles.value}>${accountData.cashBalance.toLocaleString()}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.label}>Invested Value</Text>
              <Text style={styles.value}>
                ${(accountData.totalValue - accountData.cashBalance).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.performanceGrid}>
            {Object.entries(accountData.performance).map(([period, value]) => (
              <View key={period} style={styles.performanceItem}>
                <Text style={styles.periodLabel}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
                <Text style={[
                  styles.performanceValue,
                  { color: value.startsWith('+') ? '#34C759' : '#FF3B30' }
                ]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Asset Allocation</Text>
          <View style={styles.allocationContainer}>
            {Object.entries(accountData.allocation).map(([asset, percentage]) => (
              <View key={asset} style={styles.allocationItem}>
                <View style={styles.allocationHeader}>
                  <View style={styles.assetLabelContainer}>
                    <View style={[styles.assetDot, { backgroundColor: asset === 'stocks' ? '#34C759' : asset === 'options' ? '#007AFF' : '#8E8E93' }]} />
                    <Text style={styles.assetLabel}>{asset.charAt(0).toUpperCase() + asset.slice(1)}</Text>
                  </View>
                  <Text style={styles.percentageValue}>{percentage}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: asset === 'stocks' ? '#34C759' : asset === 'options' ? '#007AFF' : '#8E8E93'
                    }
                  ]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    paddingTop: 8,
  },
  brokerageSelector: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  selectedBrokerage: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brokerageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brokerageIcon: {
    fontSize: 20,
  },
  brokerageInfo: {
    flex: 1,
  },
  brokerageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 13,
    color: '#666666',
  },
  chevronContainer: {
    paddingLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  dropdownContent: {
    backgroundColor: '#ffffff',
    marginTop: 60,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  brokerageSection: {
    marginBottom: 20,
  },
  brokerageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownBrokerageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#f0f8ff',
  },
  dropdownAccountName: {
    fontSize: 15,
    color: '#333333',
  },
  dropdownAccountNameActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalPortfolioValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
  },
  overviewGrid: {
    flexDirection: 'row',
    padding: 16,
  },
  overviewItem: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  performanceGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  periodLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  allocationContainer: {
    padding: 16,
  },
  allocationItem: {
    marginBottom: 16,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  assetLabel: {
    fontSize: 14,
    color: '#333333',
  },
  percentageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default PortfolioScreen; 