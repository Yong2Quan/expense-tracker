import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Title } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

import { getExpenses } from "../db/local";
import type { Expense } from "../types";

export default function HomeScreen(): React.JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useFocusEffect(
    useCallback(() => {
      setExpenses(getExpenses());
    }, []),
  );

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.heading}>This Month</Title>
      <Card style={styles.totalCard}>
        <Card.Content>
          <Text variant="labelLarge">Total Spent</Text>
          <Text variant="displaySmall" style={styles.totalAmount}>
            ${total.toFixed(2)}
          </Text>
        </Card.Content>
      </Card>

      <Title style={styles.heading}>Recent Expenses</Title>
      {monthlyExpenses.slice(0, 5).map((expense) => (
        <Card key={expense.id} style={styles.expenseCard}>
          <Card.Content style={styles.expenseRow}>
            <View>
              <Text variant="bodyLarge">{expense.category.name}</Text>
              {expense.note ? (
                <Text variant="bodySmall" style={styles.note}>
                  {expense.note}
                </Text>
              ) : null}
            </View>
            <Text variant="titleMedium">${expense.amount.toFixed(2)}</Text>
          </Card.Content>
        </Card>
      ))}

      {monthlyExpenses.length === 0 && (
        <Text style={styles.empty}>No expenses this month yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  heading: { marginTop: 8 },
  totalCard: { marginBottom: 8 },
  totalAmount: { color: "#6366F1", fontWeight: "bold" },
  expenseCard: { marginBottom: 4 },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  note: { color: "#888" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 32 },
});
