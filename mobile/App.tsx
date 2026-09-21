import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { initDB } from "./src/db/local";
import HomeScreen from "./src/screens/HomeScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import SummaryScreen from "./src/screens/SummaryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

type TabName = "Home" | "Add" | "History" | "Summary" | "Settings";
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TAB_ICONS: Record<TabName, IconName> = {
  Home: "home-outline",
  Add: "plus-circle-outline",
  History: "history",
  Summary: "chart-bar",
  Settings: "cog-outline",
};

const Tab = createBottomTabNavigator();

export default function App(): React.JSX.Element {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={TAB_ICONS[route.name as TabName] ?? "circle"}
                size={size}
                color={color}
              />
            ),
            tabBarActiveTintColor: "#6366F1",
            tabBarInactiveTintColor: "#9CA3AF",
            headerStyle: { backgroundColor: "#6366F1" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Dashboard" }}
          />
          <Tab.Screen
            name="Add"
            component={AddExpenseScreen}
            options={{ title: "Add Expense" }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: "History" }}
          />
          <Tab.Screen
            name="Summary"
            component={SummaryScreen}
            options={{ title: "Summary" }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Categories" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
