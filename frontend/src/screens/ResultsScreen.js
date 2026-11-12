import React from "react";
import { Text } from "react-native";
import {
  Page,
  Heading,
  Loading,
  Failure,
  Empty,
  MedicineCard,
  Button,
} from "../components/UI";
import { useMedicines } from "../services/useMedicines";
import { s } from "../styles/theme";
export default function ResultsScreen({ navigation, route }) {
  const search = route.params?.busca || "";
  const categories = route.params?.categorias || "";
  const state = useMedicines(search, categories);
  return (
    <Page>
      <Heading
        tag="CATÁLOGO PILLDEX"
        title={search ? "Resultados da pesquisa" : "Todos os medicamentos"}
        description={
          search
            ? "Você pesquisou por “" + search + "”."
            : "Explore os medicamentos cadastrados."
        }
      />
      <Button
        title="Nova pesquisa"
        onPress={() => navigation.navigate("Pesquisa")}
      />
      {!!categories && (
        <Text style={s.small}>
          {categories.split(",").length} filtro(s) de categoria ativo(s) ·
          qualquer categoria
        </Text>
      )}
      {state.loading ? (
        <Loading />
      ) : state.error ? (
        <Failure message={state.error} retry={state.retry} />
      ) : (
        <>
          <Text style={s.small}>
            {state.data.length} medicamento(s) encontrado(s)
          </Text>
          {!state.data.length ? (
            <Empty />
          ) : (
            state.data.map((item) => (
              <MedicineCard key={item.id} item={item} navigation={navigation} />
            ))
          )}
        </>
      )}
    </Page>
  );
}
