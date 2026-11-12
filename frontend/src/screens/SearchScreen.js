import React, { useState } from "react";
import { View, Text } from "react-native";
import CategoryPicker from "../components/CategoryPicker";
import {
  Page,
  Heading,
  Field,
  Button,
  Loading,
  Failure,
  Empty,
  MedicineCard,
} from "../components/UI";
import { useMedicines } from "../services/useMedicines";
import { s } from "../styles/theme";
export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(false);
  const results = useMedicines(query.trim(), categories.join(","));
  const submit = () =>
    navigation.navigate("Resultados", {
      busca: query.trim(),
      categorias: categories.join(","),
    });
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
          title={"Filtros · " + categories.length + " ativos"}
          onPress={() => setFilters((v) => !v)}
        />
        {filters && (
          <CategoryPicker value={categories} onChange={setCategories} />
        )}
        <Button
          title="Limpar filtros"
          onPress={() => {
            setQuery("");
            setCategories([]);
          }}
        />
        <Text style={s.small}>
          {categories.length} filtro(s) de categoria ativo(s)
        </Text>
        <Button
          title="Ver todos os medicamentos"
          onPress={() =>
            navigation.navigate("Resultados", { busca: "", categorias: "" })
          }
        />
      </View>
      {filters && (
        <>
          {results.loading ? (
            <Loading />
          ) : results.error ? (
            <Failure message={results.error} retry={results.retry} />
          ) : (
            <>
              <Text style={s.small}>
                {results.data.length} medicamento(s) encontrado(s)
              </Text>
              {!results.data.length ? (
                <Empty />
              ) : (
                results.data.map((item) => (
                  <MedicineCard
                    key={item.id}
                    item={item}
                    navigation={navigation}
                  />
                ))
              )}
            </>
          )}
        </>
      )}
    </Page>
  );
}
