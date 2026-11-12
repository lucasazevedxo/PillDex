import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { request } from "../services/api";
import { Failure } from "./UI";
import { s, colors } from "../styles/theme";
export default function CategoryPicker({
  value = [],
  onChange,
  disabled = false,
}) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    request("/categorias")
      .then((data) => {
        if (active) {
          setCategories(data);
          setError("");
        }
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [version]);
  return (
    <View style={{ gap: 12 }}>
      <Text style={s.small}>
        Categorias organizam o catálogo e não recomendam tratamento. Seleção
        múltipla: qualquer categoria.
      </Text>
      {!!error && (
        <Failure message={error} retry={() => setVersion((v) => v + 1)} />
      )}
      <View style={s.row}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="checkbox"
            accessibilityLabel={c.nome}
            accessibilityState={{ checked: value.includes(c.id), disabled }}
            disabled={disabled}
            onPress={() =>
              onChange(
                value.includes(c.id)
                  ? value.filter((id) => id !== c.id)
                  : [...value, c.id],
              )
            }
            style={{
              borderRadius: 24,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.blue,
              backgroundColor: value.includes(c.id) ? colors.blue : "#fff",
            }}
          >
            <Text
              style={{ color: value.includes(c.id) ? "#fff" : colors.blue }}
            >
              {c.nome} ·{" "}
              {c.tipo === "classe"
                ? "Classe"
                : c.tipo === "indicacao"
                  ? "Indicação"
                  : "Organização"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
