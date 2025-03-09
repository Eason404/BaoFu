import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/components/HomeScreen';
import HoldingsScreen from './src/components/HoldingsScreen';
import PortfolioScreen from './src/components/PortfolioScreen';
import TradeEntryScreen from './src/components/TradeEntryScreen';
import { PortfolioProvider } from './src/context/PortfolioContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HoldingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Holdings" 
      component={HoldingsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TradeEntry"
      component={TradeEntryScreen}
      options={{
        title: 'New Trade',
        headerShown: true,
        presentation: 'modal'
      }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <PortfolioProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'HoldingsTab') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'Portfolio') {
                iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              headerShown: false,
              title: 'BaoFu Home'
            }}
          />
          <Tab.Screen 
            name="HoldingsTab" 
            component={HoldingsStack}
            options={{ 
              headerShown: false,
              title: 'Holdings'
            }}
          />
          <Tab.Screen
            name="Portfolio"
            component={PortfolioScreen}
            options={{
              title: 'Portfolio Details',
              headerShown: true
            }}
          />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </PortfolioProvider>
  );
}
