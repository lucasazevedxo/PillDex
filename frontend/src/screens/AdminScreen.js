import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import {
  Page,
  Heading,
  Field,
  Button,
  Loading,
  Failure,
} from "../components/UI";
import { useAuth } from "../context/AuthContext";
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
export default function AdminScreen({ navigation, route }) {
  const id = route.params?.id;
  const { authenticated } = useAuth();
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState(null);
  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .find(id)
      .then((item) => {
        if (active) setForm(item);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, revision]);
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
      const item = await authenticated("/medicamentos" + (id ? "/" + id : ""), {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setCreated(item);
      if (!id) setForm({});
      setMessage(
        id
          ? "Medicamento atualizado com sucesso no banco de dados."
          : "Medicamento cadastrado com sucesso no banco de dados.",
      );
    } catch (error) {
      setErrors({ ...error.fields, _general: error.message });
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <Page>
        <Loading />
      </Page>
    );
  if (loadError)
    return (
      <Page>
        <Failure
          message={loadError}
          retry={() => {
            setLoading(true);
            setLoadError("");
            setRevision((v) => v + 1);
          }}
        />
      </Page>
    );
  return (
    <Page>
      <Heading
        tag="GERENCIAMENTO • ENTREGA 3"
        title={id ? "Editar medicamento" : "Cadastrar medicamento"}
        description="Organize o catálogo com informações verificadas e fontes identificadas."
      />
      <View style={s.notice}>
        <Text style={s.text}>Área administrativa protegida</Text>
        <Text style={s.small}>
          Publique somente informações verificadas e identifique a fonte. A
          autorização é validada pelo servidor.
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
          title={
            busy
              ? "Salvando…"
              : id
                ? "Salvar alterações"
                : "Cadastrar medicamento"
          }
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
            title="Ver medicamento salvo"
            onPress={() => navigation.navigate("Detalhes", { id: created.id })}
          />
          <Button
            title="Voltar ao painel"
            onPress={() => navigation.goBack()}
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
