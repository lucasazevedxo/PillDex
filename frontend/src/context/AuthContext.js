import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { request } from "../services/api";
const Context = createContext(null);
const key = "pilldex-session";
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function logout(reason = "") {
    setSession(null);
    setMessage(reason);
    if (Platform.OS !== "web") {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        setMessage(
          "Sessão encerrada. Não foi possível limpar o armazenamento seguro; tente sair novamente.",
        );
      }
    }
  }
  async function authenticated(path, options = {}, current = session) {
    if (!current || current.expiresAt <= Date.now()) {
      await logout("Sessão expirada. Entre novamente.");
      throw Error("Sessão expirada. Entre novamente.");
    }
    try {
      return await request(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: "Bearer " + current.token,
        },
      });
    } catch (error) {
      if (error.status === 401)
        await logout("Sessão expirada. Entre novamente.");
      throw error;
    }
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (Platform.OS === "web") return;
        const raw = await SecureStore.getItemAsync(key);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (
          !saved.token ||
          !Number.isFinite(saved.expiresAt) ||
          saved.expiresAt <= Date.now()
        ) {
          await SecureStore.deleteItemAsync(key);
          return;
        }
        const usuario = await request("/auth/me", {
          headers: { Authorization: "Bearer " + saved.token },
        });
        if (active) setSession({ ...saved, usuario });
      } catch {
        if (active)
          setMessage("Não foi possível restaurar a sessão. Entre novamente.");
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          /* erro mostrado acima */
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => {
        void logout("Sessão expirada. Entre novamente.");
      },
      Math.max(0, session.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [session]);
  async function enter(mode, data) {
    const next = await request("/auth/" + mode, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (Platform.OS !== "web")
      await SecureStore.setItemAsync(key, JSON.stringify(next));
    setMessage("");
    setSession(next);
  }
  return (
    <Context.Provider
      value={{
        user: session?.usuario,
        loading,
        message,
        enter,
        logout,
        authenticated,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
