import React, { useState } from "react";
import { Text, View } from "react-native";
import { Page, Heading, Field, Button } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { s } from "../styles/theme";
export default function AuthScreen({ route, navigation }) {
  const signup = route.name === "Cadastro";
  const auth = useAuth();
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  async function submit() {
    setErrors({});
    if (signup && form.senha !== form.confirmacao) {
      setErrors({ confirmacao: "As senhas devem ser iguais." });
      return;
    }
    setBusy(true);
    try {
      await auth.enter(signup ? "cadastro" : "login", form);
    } catch (error) {
      setErrors({ ...error.fields, general: error.message });
    } finally {
      setBusy(false);
    }
  }
  const fields = [
    ...(signup ? [["nome", "Nome"]] : []),
    ["email", "Email"],
    ["senha", "Senha"],
    ...(signup ? [["confirmacao", "Confirmar senha"]] : []),
  ];
  return (
    <Page>
      <Heading
        title={signup ? "Criar conta" : "Entrar"}
        description="A consulta ao catálogo continua disponível sem login."
      />
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
            secureTextEntry={key === "senha" || key === "confirmacao"}
            autoCapitalize={key === "nome" ? "words" : "none"}
            keyboardType={key === "email" ? "email-address" : "default"}
            maxLength={key === "email" ? 254 : 150}
          />
        ))}
        <Text style={s.small}>
          Senha: pelo menos 8 caracteres, até 72 bytes.
        </Text>
        {!!(errors.general || auth.message) && (
          <Text accessibilityRole="alert" style={s.error}>
            {errors.general || auth.message}
          </Text>
        )}
        <Button
          title={busy ? "Aguarde…" : signup ? "Cadastrar" : "Entrar"}
          disabled={busy}
          onPress={submit}
        />
        <Button
          title={signup ? "Já tenho conta" : "Criar conta"}
          disabled={busy}
          onPress={() => navigation.replace(signup ? "Login" : "Cadastro")}
        />
      </View>
    </Page>
  );
}
