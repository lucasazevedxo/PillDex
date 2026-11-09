import React from "react";
import { Text, View } from "react-native";
import { Page, Heading, Button } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { s } from "../styles/theme";
export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  return (
    <Page>
      <Heading title="Meu perfil" />
      <View style={s.card}>
        <Text style={s.name}>{user.nome}</Text>
        <Text style={s.text}>{user.email}</Text>
        <Text style={s.text}>Nível: {user.nivel}</Text>
        {user.nivel === "admin" && (
          <Button
            title="Gerenciar catálogo"
            onPress={() => navigation.navigate("Administração")}
          />
        )}
        <Button title="Sair" onPress={() => logout()} />
      </View>
    </Page>
  );
}
