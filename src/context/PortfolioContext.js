import React, { createContext, useContext, useState, useCallback } from 'react';

// Initial brokerage data
const initialBrokerageData = {
  schwab: {
    name: 'Charles Schwab',
    icon: '💼',
    accounts: {
      personal: {
        name: 'Personal Account',
        totalValue: 250000,
        cashBalance: 35000,
        performance: {
          daily: '+1.8%',
          weekly: '+2.2%',
          monthly: '+8.3%',
          yearly: '+22.2%'
        },
        allocation: {
          stocks: 70,
          options: 20,
          cash: 10
        },
        positions: [
          { symbol: 'AAPL', type: 'stock', quantity: 100, averagePrice: 150, currentPrice: 175 },
          { symbol: 'GOOGL', type: 'stock', quantity: 50, averagePrice: 2800, currentPrice: 2950 },
          { symbol: 'TSLA 800C 06/2024', type: 'option', quantity: 5, averagePrice: 20, currentPrice: 25 }
        ]
      },
      retirement: {
        name: 'IRA Account',
        totalValue: 450000,
        cashBalance: 50000,
        performance: {
          daily: '+1.2%',
          weekly: '+1.8%',
          monthly: '+5.7%',
          yearly: '+18.1%'
        },
        allocation: {
          stocks: 85,
          options: 5,
          cash: 10
        },
        positions: [
          { symbol: 'VTI', type: 'stock', quantity: 1000, averagePrice: 200, currentPrice: 220 },
          { symbol: 'VXUS', type: 'stock', quantity: 500, averagePrice: 150, currentPrice: 160 }
        ]
      }
    }
  },
  webull: {
    name: 'Webull',
    icon: '📱',
    accounts: {
      trading: {
        name: 'Trading Account',
        totalValue: 75000,
        cashBalance: 15000,
        performance: {
          daily: '-1.5%',
          weekly: '+5.2%',
          monthly: '+22.3%',
          yearly: '+68.5%'
        },
        allocation: {
          stocks: 40,
          options: 50,
          cash: 10
        },
        positions: [
          { symbol: 'SPY', type: 'stock', quantity: 50, averagePrice: 400, currentPrice: 420 },
          { symbol: 'QQQ 400C 03/2024', type: 'option', quantity: 10, averagePrice: 5, currentPrice: 8 }
        ]
      }
    }
  },
  robinhood: {
    name: 'Robinhood',
    icon: '🪶',
    accounts: {
      personal: {
        name: 'Personal Account',
        totalValue: 35000,
        cashBalance: 5000,
        performance: {
          daily: '+3.2%',
          weekly: '+8.5%',
          monthly: '+15.7%',
          yearly: '+45.3%'
        },
        allocation: {
          stocks: 60,
          options: 35,
          cash: 5
        },
        positions: [
          { symbol: 'AMD', type: 'stock', quantity: 200, averagePrice: 75, currentPrice: 85 },
          { symbol: 'NVDA 500C 04/2024', type: 'option', quantity: 3, averagePrice: 15, currentPrice: 22 }
        ]
      }
    }
  }
};

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [brokerageData, setBrokerageData] = useState(initialBrokerageData);

  // Add a new trade to a specific account
  const addTrade = async (tradeData) => {
    try {
      const { brokerageName, accountName, symbol, type, quantity, price, date } = tradeData;
      
      setBrokerageData(prevData => {
        const updatedData = { ...prevData };
        const account = updatedData[brokerageName]?.accounts?.[accountName];
        
        if (!account) {
          throw new Error('Invalid brokerage or account');
        }

        // Initialize positions array if it doesn't exist
        if (!Array.isArray(account.positions)) {
          account.positions = [];
        }

        // Find existing position for the symbol
        const existingPosition = account.positions.find(pos => 
          pos.symbol === symbol && pos.type === type
        );

        if (existingPosition) {
          // Update existing position
          const totalValue = existingPosition.quantity * existingPosition.currentPrice;
          const newQuantity = existingPosition.quantity + quantity;
          const newTotalValue = totalValue + (quantity * price);
          
          existingPosition.quantity = newQuantity;
          existingPosition.currentPrice = newTotalValue / newQuantity;
          existingPosition.lastUpdated = date;
        } else {
          // Add new position
          account.positions.push({
            symbol,
            type,
            quantity,
            currentPrice: price,
            costBasis: price,
            lastUpdated: date,
            dayChange: 0,
          });
        }

        // Update account total value
        account.totalValue = (account.positions || []).reduce((total, position) => {
          const positionValue = position.quantity * position.currentPrice * 
            (position.type === 'option' ? (position.contractMultiplier || 100) : 1);
          return total + positionValue;
        }, 0);

        return updatedData;
      });

      return true;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  };

  // Update market prices and recalculate portfolio values
  const updateMarketPrices = useCallback((marketPrices) => {
    setBrokerageData(prevData => {
      const updatedData = { ...prevData };
      
      Object.keys(updatedData).forEach(brokerageId => {
        Object.keys(updatedData[brokerageId].accounts).forEach(accountId => {
          const account = updatedData[brokerageId].accounts[accountId];
          const updatedPositions = account.positions.map(position => ({
            ...position,
            currentPrice: marketPrices[position.symbol] || position.currentPrice
          }));

          const totalValue = updatedPositions.reduce((sum, position) => {
            return sum + (position.quantity * position.currentPrice);
          }, account.cashBalance);

          const stockValue = updatedPositions.reduce((sum, position) => {
            return position.type === 'stock' ? sum + (position.quantity * position.currentPrice) : sum;
          }, 0);

          const optionValue = updatedPositions.reduce((sum, position) => {
            return position.type === 'option' ? sum + (position.quantity * position.currentPrice) : sum;
          }, 0);

          updatedData[brokerageId].accounts[accountId] = {
            ...account,
            totalValue,
            positions: updatedPositions,
            allocation: {
              stocks: Math.round((stockValue / totalValue) * 100),
              options: Math.round((optionValue / totalValue) * 100),
              cash: Math.round((account.cashBalance / totalValue) * 100)
            }
          };
        });
      });

      return updatedData;
    });
  }, []);

  const value = {
    brokerageData,
    setBrokerageData,
    addTrade,
    updateMarketPrices
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext; 