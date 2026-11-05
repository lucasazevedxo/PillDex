import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { s, colors } from "../styles/theme";
export function Button({ title, onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}
export function Page({ children }) {
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.brand}>+ PillDex</Text>
      {children}
      <View style={s.notice}>
        <Text style={s.small}>
          Informação para cuidar melhor. O PillDex não substitui a orientação de
          um profissional de saúde e não recomenda tratamentos.
        </Text>
      </View>
    </ScrollView>
  );
}
export function Heading({ tag, title, description }) {
  return (
    <View style={{ gap: 10 }}>
      {tag && <Text style={s.eyebrow}>{tag}</Text>}
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      {description && <Text style={s.subtitle}>{description}</Text>}
    </View>
  );
}
export function Field({ label, error, ...props }) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          s.input,
          props.multiline && { minHeight: 100, textAlignVertical: "top" },
        ]}
        {...props}
      />
      {error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
export function Loading() {
  return (
    <View style={s.card}>
      <ActivityIndicator size="large" color={colors.blue} />
      <Text style={s.small}>Carregando informações…</Text>
    </View>
  );
}
export function Failure({ message, retry }) {
  return (
    <View style={s.card}>
      <Text accessibilityRole="alert" style={s.error}>
        {message}
      </Text>
      <Button title="Tentar novamente" onPress={retry} />
    </View>
  );
}
export function Empty() {
  return (
    <View style={s.card}>
      <Text style={s.name}>Nenhum medicamento encontrado</Text>
      <Text style={s.small}>
        Confira o nome ou tente pesquisar pelo princípio ativo.
      </Text>
    </View>
  );
}
export function MedicineCard({ item, navigation }) {
  return (
    <View style={s.card}>
      <Text style={s.eyebrow}>MEDICAMENTO</Text>
      <Text style={s.name}>{item.nome}</Text>
      <Text style={s.small}>
        {item.principio_ativo || "Princípio ativo não informado"}
      </Text>
      <Text style={s.text} numberOfLines={3}>
        {item.descricao || "Descrição ainda não cadastrada."}
      </Text>
      <Button
        title="Consultar informações →"
        onPress={() => navigation.navigate("Detalhes", { id: item.id })}
      />
    </View>
  );
}
