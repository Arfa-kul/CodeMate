import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export function useHealth() {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, data: null, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
