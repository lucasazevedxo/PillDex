import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "./api";
export function useMedicines(search = "", categories = "") {
  const [state, setState] = useState({ loading: true, data: [], error: null });
  const [version, setVersion] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setState({ loading: true, data: [], error: null, revision: version });
      api
        .list(search, categories)
        .then((data) => {
          if (active)
            setState({ loading: false, data, error: null, revision: version });
        })
        .catch((error) => {
          if (active)
            setState({
              loading: false,
              data: [],
              error: error.message,
              revision: version,
            });
        });
      return () => {
        active = false;
      };
    }, [search, categories, version]),
  );
  return { ...state, retry: () => setVersion((v) => v + 1) };
}
