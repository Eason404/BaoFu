# BaoFu - Portfolio Management App

BaoFu is a modern, React Native-based portfolio management application that helps users track their investments, monitor performance, and manage trades across multiple brokerage accounts.

## Features

### Portfolio Management
- Real-time portfolio value tracking
- Multiple brokerage account support
- Performance comparison with S&P 500
- Daily change indicators
- Holdings summary with detailed position information

### Trading
- Intuitive trade entry interface
- Support for buy and sell orders
- Real-time position updates
- Cash balance tracking
- Trade history logging

### User Interface
- Clean, minimalist design
- Performance heatmap visualization
- Responsive scrolling on all screen sizes
- Bottom tab navigation for easy access
- Modal-based trade entry
- Keyboard-aware forms

## Technical Stack

- **Framework**: React Native with Expo
- **State Management**: React Context API
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Charts**: react-native-chart-kit
- **Data Visualization**: Custom components with react-native-svg
- **Form Handling**: Custom validation with React hooks
- **Styling**: React Native StyleSheet

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Eason404/BaoFu.git
   cd BaoFu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

```
BaoFuApp/
├── src/
│   ├── components/
│   │   ├── HomeScreen.js
│   │   ├── HoldingsScreen.js
│   │   ├── PortfolioScreen.js
│   │   └── TradeEntryScreen.js
│   ├── context/
│   │   └── PortfolioContext.js
│   └── navigation/
│       └── BottomTabNavigator.js
├── assets/
├── App.js
└── app.json
```

## Key Components

### HomeScreen
- Displays total portfolio value
- Shows daily performance metrics
- Includes performance comparison chart
- Provides quick access to key statistics

### HoldingsScreen
- Lists all current positions
- Shows detailed holding information
- Includes performance heatmap
- Provides access to trade entry

### PortfolioScreen
- Manages multiple brokerage accounts
- Displays account-specific information
- Allows account switching
- Shows detailed portfolio metrics

### TradeEntryScreen
- Handles new trade entries
- Provides form validation
- Updates positions in real-time
- Manages cash balance updates

## State Management

The app uses React Context (PortfolioContext) to manage:
- Multiple brokerage accounts
- Portfolio positions
- Trade history
- Cash balances
- Performance metrics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native community
- Expo team
- All contributors to this project 