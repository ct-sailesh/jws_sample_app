import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WelcomeScreen } from '../features/home/WelcomeScreen';
import { GarageScreen } from '../features/home/GarageScreen';
import { AccountScreen } from '../features/home/AccountScreen';
import { AccountIcon, GarageIcon, HomeIcon } from '../components/icons';
import { useTheme } from '../config/theme';
import { tabs } from '../config/content/global';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const tabLabel = (routeName: keyof TabParamList) => tabs.find((t) => t.routeName === routeName)?.label;

/** Bottom tab bar: Home / My Garage / Account — matches the prototype's persistent tab bar. */
export function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.ink500,
        tabBarStyle: { borderTopColor: theme.colors.border },
        tabBarLabelStyle: theme.type.caption,
      }}
    >
      <Tab.Screen
        name="Home"
        component={WelcomeScreen}
        options={{
          title: tabLabel('Home'),
          tabBarIcon: ({ color, focused }) => <HomeIcon color={color} active={focused} />,
        }}
      />
      <Tab.Screen
        name="Garage"
        component={GarageScreen}
        options={{
          title: tabLabel('Garage'),
          tabBarIcon: ({ color }) => <GarageIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: tabLabel('Account'),
          tabBarIcon: ({ color }) => <AccountIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
