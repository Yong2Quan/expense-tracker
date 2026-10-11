import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getExpenses } from "../api/expenses";
import type { Expense } from "../types";

/** Loads expenses from the API, refetching whenever the screen regains focus. */
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setExpenses(await getExpenses());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { expenses, loading, error, refresh };
}
