import React, { useState } from "react";
import { View, Text } from "react-native";
import {
  Page,
  Heading,
  Button,
  Loading,
  Failure,
  Empty,
} from "../components/UI";
import { useMedicines } from "../services/useMedicines";
import { useAuth } from "../context/AuthContext";
import { s } from "../styles/theme";
export default function AdminListScreen({ navigation }) {
  const state = useMedicines();
  const { authenticated } = useAuth();
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      await authenticated("/medicamentos/" + pending.id, { method: "DELETE" });
      setPending(null);
      state.retry();
      setMessage("Medicamento excluído com sucesso.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <Heading title="Painel administrativo" />
      <Button
        title="Cadastrar medicamento"
        onPress={() => navigation.navigate("Formulário de medicamento")}
      />
      {!!message && (
        <Text accessibilityRole="alert" style={s.text}>
          {message}
        </Text>
      )}
      {pending && (
        <View style={s.notice}>
          <Text style={s.text}>Excluir “{pending.nome}” permanentemente?</Text>
          <Button title="Confirmar exclusão" disabled={busy} onPress={remove} />
          <Button
            title="Cancelar"
            disabled={busy}
            onPress={() => setPending(null)}
          />
        </View>
      )}
      {state.loading ? (
        <Loading />
      ) : state.error ? (
        <Failure message={state.error} retry={state.retry} />
      ) : !state.data.length ? (
        <Empty />
      ) : (
        state.data.map((item) => (
          <View style={s.card} key={item.id}>
            <Text style={s.name}>{item.nome}</Text>
            <Text style={s.small}>{item.principio_ativo}</Text>
            <Button
              title={"Editar " + item.nome}
              disabled={busy}
              onPress={() =>
                navigation.navigate("Formulário de medicamento", {
                  id: item.id,
                })
              }
            />
            <Button
              title={"Excluir " + item.nome}
              disabled={busy}
              onPress={() => {
                setPending(item);
                setMessage("");
              }}
            />
          </View>
        ))
      )}
    </Page>
  );
}
