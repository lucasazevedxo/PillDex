import React, { useState } from "react";
import { View, Text } from "react-native";
import { Page, Heading, Field, Button } from "../components/UI";
import { api } from "../services/api";
import { s } from "../styles/theme";
const fields = [
  ["nome", "Nome *"],
  ["principio_ativo", "Princípio ativo"],
  ["descricao", "Descrição"],
  ["indicacoes", "Indicações"],
  ["efeitos_colaterais", "Efeitos colaterais"],
  ["contraindicacoes", "Contraindicações"],
  ["precaucoes", "Precauções"],
  ["fonte", "Fonte das informações"],
  ["url_bula", "URL da bula oficial"],
];
export default function AdminScreen({ navigation }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState(null);
  async function submit() {
    const next = {};
    if (!form.nome?.trim()) next.nome = "Informe o nome do medicamento.";
    if (
      fields.slice(2, 7).some(([key]) => form[key]?.trim()) &&
      !form.fonte?.trim()
    )
      next.fonte = "Informe a fonte do conteúdo.";
    if (form.url_bula) {
      try {
        if (!["http:", "https:"].includes(new URL(form.url_bula).protocol))
          throw Error();
      } catch {
        next.url_bula = "Informe uma URL HTTP ou HTTPS válida.";
      }
    }
    setErrors(next);
    setMessage("");
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const item = await api.create(form);
      setCreated(item);
      setForm({});
      setMessage("Medicamento cadastrado com sucesso no banco de dados.");
    } catch (error) {
      setErrors({ ...error.fields, _general: error.message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <Heading
        tag="GERENCIAMENTO • ENTREGA 2"
        title="Cadastrar medicamento"
        description="Organize o catálogo com informações verificadas e fontes identificadas."
      />
      <View style={s.notice}>
        <Text style={s.text}>Área de demonstração sem autenticação</Text>
        <Text style={s.small}>
          O cadastro ainda não tem controle de permissões. Use somente em
          ambiente local. A proteção será implementada na Entrega 3.
        </Text>
      </View>
      <View style={s.card}>
        {fields.map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={form[key] || ""}
            onChangeText={(value) =>
              setForm((old) => ({ ...old, [key]: value }))
            }
            error={errors[key]}
            editable={!busy}
            multiline={
              !["nome", "principio_ativo", "fonte", "url_bula"].includes(key)
            }
            autoCapitalize={key === "url_bula" ? "none" : "sentences"}
            maxLength={
              ["nome", "principio_ativo"].includes(key)
                ? 150
                : key === "fonte"
                  ? 255
                  : 10000
            }
          />
        ))}
        {errors._general && (
          <Text accessibilityRole="alert" style={s.error}>
            {errors._general}
          </Text>
        )}
        <Button
          title={busy ? "Salvando…" : "Cadastrar medicamento"}
          disabled={busy}
          onPress={submit}
        />
      </View>
      {!!message && (
        <View style={s.notice}>
          <Text accessibilityRole="alert" style={s.text}>
            {message}
          </Text>
          <Button
            title="Ver medicamento cadastrado"
            onPress={() => navigation.navigate("Detalhes", { id: created.id })}
          />
          <Button
            title="Ver catálogo atualizado"
            onPress={() => navigation.navigate("Resultados", { busca: "" })}
          />
        </View>
      )}
    </Page>
  );
}
