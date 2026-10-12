import React from "react";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import SummaryScreen from "./src/screens/SummaryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import MonthDetailScreen from "./src/screens/MonthDetailScreen";
import { palette, TAB_BAR_HEIGHT, theme } from "./src/theme";
import type { IconName } from "./src/categoryIcons";
import type { RootStackParamList } from "./src/navigation/types";

type TabName = "Home" | "Add" | "History" | "Summary" | "Settings";

// Thematic rather than generic: a wallet for the dashboard and a receipt for
// history read as "money app" in a way that a grid and a bulleted list don't.
// Every name here is checked against the MaterialCommunityIcons glyph map.
const TAB_ICONS: Record<TabName, { active: IconName; inactive: IconName }> = {
  Home: { active: "wallet", inactive: "wallet-outline" },
  Add: { active: "plus-circle", inactive: "plus-circle-outline" },
  History: { active: "receipt-text", inactive: "receipt-text-outline" },
  Summary: { active: "chart-donut", inactive: "chart-donut" },
  Settings: { active: "tag-multiple", inactive: "tag-multiple-outline" },
};

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.brand,
    background: palette.background,
    card: palette.surface,
    text: palette.textPrimary,
    border: palette.outline,
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs(): React.JSX.Element {
  // The device's bottom inset (Android gesture pill / 3-button bar, iPhone home
  // indicator) must be ADDED to the bar height, or the tabs sit underneath the
  // system buttons and can't be tapped.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const pair = TAB_ICONS[route.name as TabName];
          return (
            <MaterialCommunityIcons
              name={pair ? (focused ? pair.active : pair.inactive) : "circle-outline"}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: palette.brand,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.outline,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerStyle: {
          backgroundColor: palette.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: palette.textPrimary,
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
      })}
    >
      {/* `title` drives the header; `tabBarLabel` is set separately because a
          five-tab bar gives each label ~64px, and "Add Expense" truncates. */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Dashboard", tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Add"
        component={AddExpenseScreen}
        options={{ title: "Add Expense", tabBarLabel: "Add" }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "History", tabBarLabel: "History" }}
      />
      <Tab.Screen
        name="Summary"
        component={SummaryScreen}
        options={{ title: "Summary", tabBarLabel: "Summary" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Categories", tabBarLabel: "Categories" }}
      />
    </Tab.Navigator>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="MonthDetail"
              component={MonthDetailScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
