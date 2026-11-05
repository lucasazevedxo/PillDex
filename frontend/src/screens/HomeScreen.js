import React from "react";
import { View, Text } from "react-native";
import {
  Page,
  Heading,
  Button,
  Loading,
  Failure,
  Empty,
  MedicineCard,
} from "../components/UI";
import { useMedicines } from "../services/useMedicines";
import { s } from "../styles/theme";
export default function HomeScreen({ navigation }) {
  const state = useMedicines();
  return (
    <Page>
      <View style={[s.card, { padding: 28, gap: 20 }]}>
        <Heading
          tag="SUA ENCICLOPÉDIA FARMACÊUTICA"
          title="Entender é o primeiro passo para cuidar."
          description="Consulte informações organizadas sobre medicamentos, com uma leitura simples e acesso às fontes."
        />
        <Button
          title="Pesquisar um medicamento"
          onPress={() => navigation.navigate("Pesquisa")}
        />
      </View>
      <View style={s.row}>
        <Button
          title="Explorar catálogo"
          onPress={() => navigation.navigate("Resultados", { busca: "" })}
        />
        <Button
          title="Gerenciar catálogo"
          onPress={() => navigation.navigate("Administração")}
        />
      </View>
      <Text style={s.section}>Conheça o catálogo</Text>
      <Text style={s.small}>
        Informações organizadas para uma consulta mais acessível.
      </Text>
      {state.loading ? (
        <Loading />
      ) : state.error ? (
        <Failure message={state.error} retry={state.retry} />
      ) : !state.data.length ? (
        <Empty />
      ) : (
        state.data
          .slice(0, 4)
          .map((item) => (
            <MedicineCard key={item.id} item={item} navigation={navigation} />
          ))
      )}
    </Page>
  );
}
