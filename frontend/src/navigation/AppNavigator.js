import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import ResultsScreen from "../screens/ResultsScreen";
import DetailsScreen from "../screens/DetailsScreen";
import AdminScreen from "../screens/AdminScreen";
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: "#175CD3",
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#F5F8FC" },
        }}
      >
        <Stack.Screen name="Início" component={HomeScreen} />
        <Stack.Screen name="Pesquisa" component={SearchScreen} />
        <Stack.Screen name="Resultados" component={ResultsScreen} />
        <Stack.Screen name="Detalhes" component={DetailsScreen} />
        <Stack.Screen name="Administração" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
