import React, { useState } from "react";
import { View } from "react-native";
import { Page, Heading, Field, Button } from "../components/UI";
import { s } from "../styles/theme";
export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const submit = () =>
    navigation.navigate("Resultados", { busca: query.trim() });
  return (
    <Page>
      <Heading
        tag="CONSULTA SIMPLIFICADA"
        title="O que você procura?"
        description="Pesquise pelo nome do medicamento ou pelo princípio ativo."
      />
      <View style={s.card}>
        <Field
          label="Nome ou princípio ativo"
          placeholder="Digite sua pesquisa"
          value={query}
          onChangeText={setQuery}
          maxLength={150}
          returnKeyType="search"
          onSubmitEditing={submit}
        />
        <Button title="Pesquisar" onPress={submit} />
        <Button
          title="Ver todos os medicamentos"
          onPress={() => navigation.navigate("Resultados", { busca: "" })}
        />
      </View>
    </Page>
  );
}
