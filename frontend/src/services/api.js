const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
export async function request(path, options = {}) {
  if (!base)
    throw Error(
      "Configure EXPO_PUBLIC_API_URL no arquivo .env e reinicie o Expo.",
    );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(base + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: controller.signal,
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      const error = Error(
        body.error?.message || "Serviço indisponível. Tente novamente.",
      );
      error.fields = body.error?.fields;
      throw error;
    }
    return body.data;
  } catch (error) {
    if (error.name === "AbortError")
      throw Error("A conexão demorou demais. Tente novamente.");
    if (error instanceof TypeError)
      throw Error(
        "Não foi possível conectar à API. Confira o endereço e a rede.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
export const api = {
  list: (search = "") =>
    request("/medicamentos?busca=" + encodeURIComponent(search)),
  find: (id) => request("/medicamentos/" + id),
  create: (data) =>
    request("/medicamentos", { method: "POST", body: JSON.stringify(data) }),
};
