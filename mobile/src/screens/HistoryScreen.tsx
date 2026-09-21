import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet } from "react-native";
import { IconButton, List, Text } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

import { deleteExpense, getExpenses } from "../db/local";
import type { Expense } from "../types";

export default function HistoryScreen(): React.JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const refresh = useCallback(() => {
    setExpenses(getExpenses());
  }, []);

  useFocusEffect(refresh);

  const handleDelete = (id: number): void => {
    Alert.alert("Delete expense?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteExpense(id);
          refresh();
        },
      },
    ]);
  };

  if (expenses.length === 0) {
    return <Text style={styles.empty}>No expenses recorded yet.</Text>;
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <List.Item
          title={`$${item.amount.toFixed(2)} — ${item.category.name}`}
          description={`${item.date}${item.note ? `  ·  ${item.note}` : ""}`}
          right={() => (
            <IconButton icon="trash-can-outline" onPress={() => handleDelete(item.id)} />
          )}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 64 },
});
