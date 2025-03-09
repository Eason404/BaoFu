import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { usePortfolio } from '../context/PortfolioContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const TradeEntryScreen = ({ navigation }) => {
  const { brokerageData, addTrade } = usePortfolio();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form state
  const [selectedBrokerage, setSelectedBrokerage] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [symbol, setSymbol] = useState('');
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [tradeDate, setTradeDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Available accounts based on selected brokerage
  const [availableAccounts, setAvailableAccounts] = useState([]);

  // Update available accounts when brokerage selection changes
  useEffect(() => {
    if (selectedBrokerage && brokerageData[selectedBrokerage]) {
      const accounts = Object.keys(brokerageData[selectedBrokerage].accounts || {});
      setAvailableAccounts(accounts);
      setSelectedAccount(accounts[0] || '');
    } else {
      setAvailableAccounts([]);
      setSelectedAccount('');
    }
  }, [selectedBrokerage, brokerageData]);

  const validateForm = () => {
    const errors = {};

    if (!selectedBrokerage) errors.brokerage = 'Please select a brokerage';
    if (!selectedAccount) errors.account = 'Please select an account';
    if (!symbol.trim()) errors.symbol = 'Please enter a symbol';
    if (!quantity.trim()) {
      errors.quantity = 'Please enter quantity';
    } else if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      errors.quantity = 'Please enter a valid quantity';
    }
    if (!price.trim()) {
      errors.price = 'Please enter price';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      errors.price = 'Please enter a valid price';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const tradeData = {
        brokerageName: selectedBrokerage,
        accountName: selectedAccount,
        symbol: symbol.toUpperCase(),
        type: 'stock', // For now, only handling stocks
        quantity: tradeType === 'buy' ? parseFloat(quantity) : -parseFloat(quantity),
        price: parseFloat(price),
        date: tradeDate.toISOString(),
      };

      await addTrade(tradeData);
      Alert.alert(
        'Success',
        'Trade has been successfully recorded',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to record trade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>New Trade Entry</Text>
          </View>

          <View style={styles.form}>
            {/* Brokerage Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Brokerage</Text>
              <View style={[styles.pickerContainer, formErrors.brokerage && styles.errorBorder]}>
                <Picker
                  selectedValue={selectedBrokerage}
                  onValueChange={setSelectedBrokerage}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Brokerage" value="" />
                  {Object.keys(brokerageData || {}).map((brokerage) => (
                    <Picker.Item key={brokerage} label={brokerage} value={brokerage} />
                  ))}
                </Picker>
              </View>
              {formErrors.brokerage && (
                <Text style={styles.errorText}>{formErrors.brokerage}</Text>
              )}
            </View>

            {/* Account Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Account</Text>
              <View style={[styles.pickerContainer, formErrors.account && styles.errorBorder]}>
                <Picker
                  selectedValue={selectedAccount}
                  onValueChange={setSelectedAccount}
                  style={styles.picker}
                  enabled={availableAccounts.length > 0}
                >
                  <Picker.Item label="Select Account" value="" />
                  {availableAccounts.map((account) => (
                    <Picker.Item key={account} label={account} value={account} />
                  ))}
                </Picker>
              </View>
              {formErrors.account && (
                <Text style={styles.errorText}>{formErrors.account}</Text>
              )}
            </View>

            {/* Symbol Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Symbol</Text>
              <TextInput
                style={[styles.input, formErrors.symbol && styles.errorBorder]}
                value={symbol}
                onChangeText={text => setSymbol(text.toUpperCase())}
                placeholder="Enter stock symbol"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {formErrors.symbol && (
                <Text style={styles.errorText}>{formErrors.symbol}</Text>
              )}
            </View>

            {/* Trade Type Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Trade Type</Text>
              <View style={styles.tradeTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.tradeTypeButton,
                    tradeType === 'buy' && styles.tradeTypeButtonActive,
                  ]}
                  onPress={() => setTradeType('buy')}
                >
                  <Text style={[
                    styles.tradeTypeText,
                    tradeType === 'buy' && styles.tradeTypeTextActive,
                  ]}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tradeTypeButton,
                    tradeType === 'sell' && styles.tradeTypeButtonActive,
                  ]}
                  onPress={() => setTradeType('sell')}
                >
                  <Text style={[
                    styles.tradeTypeText,
                    tradeType === 'sell' && styles.tradeTypeTextActive,
                  ]}>Sell</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quantity Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={[styles.input, formErrors.quantity && styles.errorBorder]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                keyboardType="decimal-pad"
              />
              {formErrors.quantity && (
                <Text style={styles.errorText}>{formErrors.quantity}</Text>
              )}
            </View>

            {/* Price Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price per Share</Text>
              <TextInput
                style={[styles.input, formErrors.price && styles.errorBorder]}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price"
                keyboardType="decimal-pad"
              />
              {formErrors.price && (
                <Text style={styles.errorText}>{formErrors.price}</Text>
              )}
            </View>

            {/* Date Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Trade Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {tradeDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color="#666666" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={tradeDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setTradeDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Trade</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#ffffff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 48,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tradeTypeButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  tradeTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  tradeTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  tradeTypeTextActive: {
    color: '#ffffff',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  submitButton: {
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  errorBorder: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});

export default TradeEntryScreen; 