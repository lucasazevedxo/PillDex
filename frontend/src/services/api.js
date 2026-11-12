const base = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
export async function request(path, options = {}) {
  if (!base)
    throw Error(
      "Configure EXPO_PUBLIC_API_URL no arquivo .env e reinicie o Expo.",
    );
  try {
    const url = new URL(base);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw Error();
  } catch {
    throw Error(
      "EXPO_PUBLIC_API_URL deve ser uma URL HTTP ou HTTPS válida, sem credenciais.",
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    let response;
    try {
      response = await fetch(base + path, {
        ...options,
        headers: {
          ...(options.body != null
            ? { "Content-Type": "application/json" }
            : {}),
          ...options.headers,
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === "AbortError")
        throw Error("A conexão com a API demorou demais. Tente novamente.");
      throw Error(
        "Não foi possível conectar à API em " +
          base +
          ". Verifique se o backend está iniciado e acessível.",
      );
    }
    let body;
    try {
      body = await response.json();
    } catch {
      throw Error(
        "A API retornou uma resposta inválida (HTTP " +
          response.status +
          "). Confira a URL configurada.",
      );
    }
    if (!response.ok || body?.success !== true) {
      const error = Error(
        body?.error?.message ||
          "A API não concluiu a solicitação (HTTP " + response.status + ").",
      );
      error.status = response.status;
      error.fields = body?.error?.fields;
      throw error;
    }
    return body.data;
  } finally {
    clearTimeout(timer);
  }
}
export const api = {
  list: (search = "", categories = "") =>
    request(
      "/medicamentos?busca=" +
        encodeURIComponent(search) +
        (categories ? "&categorias=" + encodeURIComponent(categories) : ""),
    ),
  find: (id) => request("/medicamentos/" + id),
  create: (data, token) =>
    request("/medicamentos", {
      method: "POST",
      body: JSON.stringify(data),
      ...(token ? { headers: { Authorization: "Bearer " + token } } : {}),
    }),
};
