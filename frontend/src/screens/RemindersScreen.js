import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Switch, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Page, Heading, Field, Button, Loading } from "../components/UI";
import Confirm from "../components/Confirm";
import EditorDialog from "../components/EditorDialog";
import { useAuth } from "../context/AuthContext";
import { useReminders } from "../context/ReminderContext";
import { localDate, occurrences } from "../services/occurrences";
import { s, colors } from "../styles/theme";
const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const initial = () => ({
  usuario_medicamento_id: null,
  horario: "",
  dias_semana: [0, 1, 2, 3, 4, 5, 6],
  data_inicio: localDate(),
  data_fim: "",
  ativo: true,
});
export default function RemindersScreen({ navigation }) {
  const { user, authenticated } = useAuth();
  const { status, refresh, enable } = useReminders();
  const [rows, setRows] = useState([]),
    [library, setLibrary] = useState([]),
    [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [pending, setPending] = useState(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  async function load() {
    const [reminders, medicines] = await Promise.all([
      authenticated("/lembretes"),
      authenticated("/meus-medicamentos"),
    ]);
    setRows(reminders);
    setLibrary(medicines);
  }
  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (user) {
        setLoading(true);
        Promise.all([
          authenticated("/lembretes"),
          authenticated("/meus-medicamentos"),
        ])
          .then(([r, l]) => {
            if (active) {
              setRows(r);
              setLibrary(l);
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
  async function mutate(method, data) {
    setBusy(true);
    setMessage("");
    try {
      await authenticated("/lembretes" + (data.id ? "/" + data.id : ""), {
        method,
        ...(method !== "DELETE"
          ? { body: JSON.stringify({ ...data, ativo: !!data.ativo }) }
          : {}),
      });
      setForm(null);
      setPending(null);
      await refresh();
      await load();
      setMessage("Lembretes atualizados.");
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
          title="Lembretes"
          description="Entre para configurar seus lembretes pessoais."
        />
        <Button title="Entrar" onPress={() => navigation.navigate("Login")} />
      </Page>
    );
  const next = occurrences(rows, now).slice(0, 5);
  return (
    <Page>
      <Heading
        title="Lembretes de Medicamentos"
        description="Informe os horários conforme orientação profissional ou prescrição. O PillDex não define horários de uso."
      />
      <View style={s.notice}>
        <Text style={s.small}>
          Lembretes são auxiliares e podem falhar por permissões, bateria ou
          restrições do dispositivo. Na Web, consulte os horários aqui.
          Alterações em outro dispositivo dependem de abrir o aplicativo com
          conexão para sincronizar.
        </Text>
        <Text accessibilityRole="alert" style={s.small}>
          {status}
        </Text>
      </View>
      <Button title="Ativar notificações neste dispositivo" onPress={enable} />
      <Button
        title="Sincronizar lembretes"
        disabled={busy}
        onPress={async () => {
          await refresh();
          try {
            await load();
          } catch (e) {
            setMessage(e.message);
          }
        }}
      />
      <Button
        title="Criar lembrete"
        disabled={busy}
        onPress={() => setForm(initial())}
      />
      <Button
        title="Meus Medicamentos"
        onPress={() => navigation.navigate("Meus Medicamentos")}
      />
      {!!message && (
        <Text accessibilityRole="alert" style={s.text}>
          {message}
        </Text>
      )}
      {form && (
        <EditorDialog onClose={() => !busy && setForm(null)}>
          <View style={s.card}>
            <Text style={s.name}>
              {form.id ? "Editar lembrete" : "Novo lembrete"}
            </Text>
            {!!message && (
              <Text accessibilityRole="alert" style={s.error}>
                {message}
              </Text>
            )}
            <Text style={s.label}>Selecione um medicamento da biblioteca</Text>
            {!library.length && (
              <Text style={s.small}>
                Adicione primeiro um medicamento à sua biblioteca.
              </Text>
            )}
            {library.map((item) => (
              <Button
                key={item.id}
                title={
                  (form.usuario_medicamento_id === item.id ? "✓ " : "") +
                  item.nome
                }
                disabled={busy}
                onPress={() =>
                  setForm({ ...form, usuario_medicamento_id: item.id })
                }
              />
            ))}
            <Field
              label="Horário (HH:MM)"
              value={form.horario}
              maxLength={5}
              onChangeText={(horario) => setForm({ ...form, horario })}
            />
            <Text style={s.small}>
              Para vários horários, crie um lembrete para cada horário.
            </Text>
            <View style={s.row}>
              {days.map((label, index) => (
                <Pressable
                  key={index}
                  accessibilityRole="checkbox"
                  accessibilityLabel={label}
                  accessibilityState={{
                    checked: form.dias_semana.includes(index),
                  }}
                  onPress={() =>
                    setForm({
                      ...form,
                      dias_semana: form.dias_semana.includes(index)
                        ? form.dias_semana.filter((d) => d !== index)
                        : [...form.dias_semana, index],
                    })
                  }
                  style={{
                    padding: 12,
                    borderRadius: 20,
                    backgroundColor: form.dias_semana.includes(index)
                      ? colors.blue
                      : "#E6F0FF",
                  }}
                >
                  <Text
                    style={{
                      color: form.dias_semana.includes(index)
                        ? "white"
                        : colors.blue,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Field
              label="Data de início (AAAA-MM-DD)"
              value={form.data_inicio}
              onChangeText={(data_inicio) => setForm({ ...form, data_inicio })}
            />
            <Field
              label="Data de término opcional (AAAA-MM-DD)"
              value={form.data_fim || ""}
              onChangeText={(data_fim) => setForm({ ...form, data_fim })}
            />
            <Text style={s.label}>Lembrete ativo</Text>
            <Switch
              accessibilityLabel="Lembrete ativo"
              value={!!form.ativo}
              onValueChange={(ativo) => setForm({ ...form, ativo })}
            />
            <Button
              title="Salvar lembrete"
              disabled={busy}
              onPress={() => mutate(form.id ? "PUT" : "POST", form)}
            />
            <Button
              title="Cancelar edição"
              disabled={busy}
              onPress={() => setForm(null)}
            />
          </View>
        </EditorDialog>
      )}
      <Text style={s.section}>
        Próximos lembretes · horário local do dispositivo
      </Text>
      {!next.length && (
        <Text style={s.small}>Nenhuma ocorrência nos próximos 30 dias.</Text>
      )}
      {next.map(({ reminder, at }) => (
        <Text key={reminder.id + ":" + at.getTime()} style={s.text}>
          {at.toLocaleString("pt-BR")} · {reminder.nome}
        </Text>
      ))}
      {loading ? (
        <Loading />
      ) : !rows.length ? (
        <Text style={s.small}>Nenhum lembrete cadastrado.</Text>
      ) : (
        rows.map((row) => (
          <View style={s.card} key={row.id}>
            <Text style={s.name}>
              {row.nome} · {row.horario}
            </Text>
            <Text style={s.small}>
              {row.dias_semana.map((d) => days[d]).join(", ")} ·{" "}
              {row.data_inicio} até {row.data_fim || "sem término"}
            </Text>
            <Text style={s.small}>
              {row.ativo ? "Ativo" : "Desativado"}
              {!row.medicamento_ativo ? " · Medicamento pessoal inativo" : ""}
            </Text>
            <Button
              title={"Editar lembrete " + row.horario}
              disabled={busy}
              onPress={() => setForm({ ...row, ativo: !!row.ativo })}
            />
            <Button
              title={row.ativo ? "Desativar lembrete" : "Ativar lembrete"}
              disabled={busy}
              onPress={() => mutate("PUT", { ...row, ativo: !row.ativo })}
            />
            <Button
              title={"Excluir lembrete " + row.horario}
              disabled={busy}
              onPress={() => setPending(row)}
            />
          </View>
        ))
      )}
      <Confirm
        visible={!!pending}
        title={"Excluir lembrete das " + pending?.horario + "?"}
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => mutate("DELETE", pending)}
      />
    </Page>
  );
}
