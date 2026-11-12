import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { useAuth } from "./AuthContext";
import { reconcile, enableNotifications } from "../services/notifications";
const Context = createContext(null);
export function ReminderProvider({ children }) {
  const { user, authenticated, loading } = useAuth();
  const auth = useRef(authenticated);
  const identity = useRef(user?.id);
  useEffect(() => {
    auth.current = authenticated;
    identity.current = user?.id;
  }, [authenticated, user?.id]);
  const generation = useRef(0);
  const [status, setStatus] = useState("");
  async function refresh() {
    const current = identity.current;
    const revision = ++generation.current;
    if (!current) return;
    try {
      const rows = await auth.current("/lembretes");
      if (current !== identity.current || revision !== generation.current)
        return;
      const message = await reconcile(current, rows);
      if (current === identity.current) setStatus(message);
    } catch {
      if (current === identity.current)
        setStatus(
          "Não foi possível sincronizar as notificações. Confira a conexão e tente novamente. Agendamentos anteriores podem permanecer até a próxima sincronização.",
        );
    }
  }
  useEffect(() => {
    if (loading) return;
    // Cancel schedules from the previous session before loading this user's data.
    ++generation.current;
    void reconcile(null)
      .then(() => identity.current && refresh())
      .catch(() =>
        setStatus(
          "Falha ao cancelar agendamentos anteriores. Tente sincronizar novamente.",
        ),
      );
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    const timer = setInterval(() => void refresh(), 60000);
    return () => {
      listener.remove();
      clearInterval(timer);
    };
    // A fresh server fetch runs on identity changes and resume, not on every render.
  }, [user?.id, loading]);
  async function enable() {
    try {
      await enableNotifications();
      await refresh();
    } catch (error) {
      setStatus(error.message);
    }
  }
  return (
    <Context.Provider value={{ status, refresh, enable }}>
      {children}
    </Context.Provider>
  );
}
export const useReminders = () => useContext(Context);
