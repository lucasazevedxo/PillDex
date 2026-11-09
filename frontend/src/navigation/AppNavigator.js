import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import ResultsScreen from "../screens/ResultsScreen";
import DetailsScreen from "../screens/DetailsScreen";
import AdminScreen from "../screens/AdminScreen";
import AuthScreen from "../screens/AuthScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AdminListScreen from "../screens/AdminListScreen";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/UI";
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  const { user, loading, message } = useAuth();
  if (loading) return <Loading />;
  return (
    <NavigationContainer>
      <Stack.Navigator
        key={user?.id || "guest"}
        initialRouteName={!user && message ? "Login" : "Início"}
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
        {!user ? (
          <Stack.Group navigationKey="guest">
            <Stack.Screen name="Login" component={AuthScreen} />
            <Stack.Screen name="Cadastro" component={AuthScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group navigationKey="member">
            <Stack.Screen name="Perfil" component={ProfileScreen} />
            {user.nivel === "admin" && (
              <>
                <Stack.Screen
                  name="Administração"
                  component={AdminListScreen}
                />
                <Stack.Screen
                  name="Formulário de medicamento"
                  component={AdminScreen}
                />
              </>
            )}
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
