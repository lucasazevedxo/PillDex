import React, { useCallback, useState } from "react";
import { View, Text, Switch } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Page, Heading, Field, Button, Loading } from "../components/UI";
import Confirm from "../components/Confirm";
import EditorDialog from "../components/EditorDialog";
import { useAuth } from "../context/AuthContext";
import { useReminders } from "../context/ReminderContext";
import { useMedicines } from "../services/useMedicines";
import { s } from "../styles/theme";
export default function LibraryScreen({ navigation }) {
  const { user, authenticated } = useAuth();
  const { refresh } = useReminders();
  const [rows, setRows] = useState([]),
    [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true),
    [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false),
    [query, setQuery] = useState("");
  const [edit, setEdit] = useState(null),
    [pending, setPending] = useState(null),
    [busy, setBusy] = useState(false);
  const catalog = useMedicines(query);
  async function load() {
    const [library, alarms] = await Promise.all([
      authenticated("/meus-medicamentos"),
      authenticated("/lembretes"),
    ]);
    setRows(library);
    setReminders(alarms);
  }
  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (user) {
        setLoading(true);
        Promise.all([
          authenticated("/meus-medicamentos"),
          authenticated("/lembretes"),
        ])
          .then(([library, alarms]) => {
            if (active) {
              setRows(library);
              setReminders(alarms);
              setMessage("");
            }
          })
          .catch((e) => active && setMessage(e.message))
          .finally(() => active && setLoading(false));
      }
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]),
  );
  async function mutate(path, method, body) {
    setBusy(true);
    setMessage("");
    try {
      await authenticated(path, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      setEdit(null);
      setPending(null);
      await refresh();
      await load();
      setMessage("Biblioteca atualizada.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!user)
    return (
      <Page>
        <Heading
          title="Meus Medicamentos"
          description="Entre para organizar sua biblioteca pessoal."
        />
        <Button title="Entrar" onPress={() => navigation.navigate("Login")} />
      </Page>
    );
  return (
    <Page>
      <Heading
        title="Meus Medicamentos"
        description="Sua biblioteca pessoal. Os horários devem seguir orientação profissional."
      />
      <Button
        title={adding ? "Fechar pesquisa" : "Adicionar medicamento"}
        onPress={() => setAdding((v) => !v)}
      />
      <Button
        title="Lembretes"
        onPress={() => navigation.navigate("Lembretes")}
      />
      {!!message && (
        <Text accessibilityRole="alert" style={s.text}>
          {message}
        </Text>
      )}
      {adding && (
        <View style={s.card}>
          <Field
            label="Pesquisar no catálogo"
            value={query}
            onChangeText={setQuery}
            maxLength={150}
          />
          {catalog.loading ? (
            <Loading />
          ) : catalog.error ? (
            <Text style={s.error}>{catalog.error}</Text>
          ) : (
            <>
              <Text style={s.small}>{catalog.data.length} resultado(s)</Text>
              {catalog.data.map((item) => (
                <View key={item.id} style={s.card}>
                  <Text style={s.name}>{item.nome}</Text>
                  <Text style={s.small}>{item.principio_ativo}</Text>
                  <Button
                    title={
                      rows.some((row) => row.medicamento_id === item.id)
                        ? "Já está na biblioteca"
                        : "Adicionar " + item.nome
                    }
                    disabled={
                      busy || rows.some((row) => row.medicamento_id === item.id)
                    }
                    onPress={() =>
                      mutate("/meus-medicamentos", "POST", {
                        medicamento_id: item.id,
                      })
                    }
                  />
                </View>
              ))}
            </>
          )}
        </View>
      )}
      {edit && (
        <EditorDialog onClose={() => !busy && setEdit(null)}>
          <View style={s.card}>
            <Text style={s.name}>Editar {edit.nome}</Text>
            {!!message && (
              <Text accessibilityRole="alert" style={s.error}>
                {message}
              </Text>
            )}
            <Field
              label="Observações pessoais"
              value={edit.observacoes || ""}
              maxLength={5000}
              multiline
              onChangeText={(observacoes) => setEdit({ ...edit, observacoes })}
            />
            <Field
              label="Data de início (AAAA-MM-DD)"
              value={edit.data_inicio || ""}
              onChangeText={(data_inicio) => setEdit({ ...edit, data_inicio })}
            />
            <Field
              label="Data de término opcional (AAAA-MM-DD)"
              value={edit.data_fim || ""}
              onChangeText={(data_fim) => setEdit({ ...edit, data_fim })}
            />
            <Text style={s.label}>Registro ativo</Text>
            <Switch
              accessibilityLabel="Registro ativo"
              value={!!edit.ativo}
              onValueChange={(ativo) => setEdit({ ...edit, ativo })}
            />
            <Button
              title="Salvar observações"
              disabled={busy}
              onPress={() =>
                mutate("/meus-medicamentos/" + edit.id, "PUT", {
                  ...edit,
                  ativo: !!edit.ativo,
                })
              }
            />
            <Button
              title="Cancelar edição"
              disabled={busy}
              onPress={() => setEdit(null)}
            />
          </View>
        </EditorDialog>
      )}
      {loading ? (
        <Loading />
      ) : !rows.length ? (
        <Text style={s.small}>
          Sua biblioteca está vazia. Adicione um medicamento do catálogo.
        </Text>
      ) : (
        rows.map((row) => (
          <View style={s.card} key={row.id}>
            <Text style={s.name}>{row.nome}</Text>
            <Text style={s.small}>{row.principio_ativo}</Text>
            <Text style={s.small}>
              {row.arquivado
                ? "Arquivado no catálogo · registro pessoal preservado"
                : "Disponível no catálogo"}{" "}
              · {row.ativo ? "Ativo" : "Inativo"}
            </Text>
            <Text style={s.text}>
              {row.observacoes || "Sem observações pessoais."}
            </Text>
            <Text style={s.small}>
              {row.data_inicio || "Sem data inicial"} —{" "}
              {row.data_fim || "Sem data final"}
            </Text>
            <Text style={s.small}>
              Horários:{" "}
              {reminders
                .filter((r) => r.usuario_medicamento_id === row.id)
                .map((r) => r.horario + (r.ativo ? "" : " (desativado)"))
                .join(", ") || "Nenhum lembrete"}
            </Text>
            <Button
              title={"Editar observações de " + row.nome}
              disabled={busy}
              onPress={() => setEdit(row)}
            />
            <Button
              title="Consultar informações"
              onPress={() =>
                navigation.navigate("Detalhes", {
                  id: row.medicamento_id,
                  pessoalId: row.id,
                })
              }
            />
            <Button
              title={"Remover da minha biblioteca: " + row.nome}
              disabled={busy}
              onPress={() => setPending(row)}
            />
          </View>
        ))
      )}
      <Confirm
        visible={!!pending}
        title={
          "Remover “" +
          pending?.nome +
          "” da sua biblioteca e seus lembretes? O catálogo será preservado."
        }
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => mutate("/meus-medicamentos/" + pending.id, "DELETE")}
      />
    </Page>
  );
}
