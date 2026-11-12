import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ReminderProvider } from "./src/context/ReminderContext";
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <ReminderProvider>
          <AppNavigator />
        </ReminderProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
