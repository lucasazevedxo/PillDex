import React, { useEffect, useState } from "react";
import { View, Text, Linking } from "react-native";
import { Page, Heading, Loading, Failure, Button } from "../components/UI";
import { api } from "../services/api";
import { s } from "../styles/theme";
import { useAuth } from "../context/AuthContext";
export default function DetailsScreen({ route }) {
  const { authenticated } = useAuth();
  const [state, setState] = useState({ key: null });
  const [version, setVersion] = useState(0);
  const [linkError, setLinkError] = useState("");
  const id = route.params.id;
  const requestKey = id + ":" + version;
  useEffect(() => {
    let active = true;
    (route.params.pessoalId
      ? authenticated("/meus-medicamentos/" + route.params.pessoalId).then(
          (row) => row.medicamento,
        )
      : api.find(id)
    )
      .then((data) => {
        if (active) setState({ key: requestKey, data });
      })
      .catch((error) => {
        if (active) setState({ key: requestKey, error: error.message });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, requestKey, route.params.pessoalId]);
  if (state.key !== requestKey)
    return (
      <Page>
        <Loading />
      </Page>
    );
  if (state.error)
    return (
      <Page>
        <Failure message={state.error} retry={() => setVersion((v) => v + 1)} />
      </Page>
    );
  const item = state.data;
  let valid = false;
  try {
    valid = ["http:", "https:"].includes(new URL(item.url_bula).protocol);
  } catch {}
  return (
    <Page>
      <Heading
        tag="INFORMAÇÕES DO MEDICAMENTO"
        title={item.nome}
        description={item.principio_ativo || "Princípio ativo não cadastrado"}
      />
      {[
        ["descricao", "Sobre o medicamento"],
        ["indicacoes", "Indicações"],
        ["efeitos_colaterais", "Efeitos colaterais"],
        ["contraindicacoes", "Contraindicações"],
        ["precaucoes", "Precauções"],
        ["fonte", "Fonte das informações"],
      ].map(([key, label]) => (
        <View key={key} style={s.card}>
          <Text style={s.name}>{label}</Text>
          <Text style={s.text}>
            {item[key] ||
              "Informação não cadastrada. Consulte a bula oficial e um profissional de saúde."}
          </Text>
        </View>
      ))}
      <View style={s.card}>
        <Text style={s.name}>Bula oficial completa</Text>
        {valid ? (
          <Button
            title="Abrir bula no navegador ↗"
            onPress={async () => {
              try {
                setLinkError("");
                await Linking.openURL(item.url_bula);
              } catch {
                setLinkError("Não foi possível abrir o link.");
              }
            }}
          />
        ) : (
          <Text style={s.small}>
            Link para a bula específica ainda não cadastrado.
          </Text>
        )}
        {!!linkError && <Text style={s.error}>{linkError}</Text>}
      </View>
    </Page>
  );
}
