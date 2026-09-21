import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Button, SegmentedButtons, Text, TextInput } from "react-native-paper";

import { createExpense, getCategories } from "../db/local";
import type { Category } from "../types";

export default function AddExpenseScreen(): React.JSX.Element {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const cats = getCategories();
    setCategories(cats);
    if (cats.length > 0) setCategoryId(cats[0].id);
  }, []);

  const handleSubmit = (): void => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Enter a positive number.");
      return;
    }
    if (!categoryId) {
      Alert.alert("No category", "Please select a category.");
      return;
    }

    createExpense({ amount: parsed, note: note.trim() || undefined, date, category_id: categoryId });
    setAmount("");
    setNote("");
    Alert.alert("Saved", "Expense added.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        Amount ($)
      </Text>
      <TextInput
        mode="outlined"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        style={styles.input}
      />

      <Text variant="titleMedium" style={styles.label}>
        Date
      </Text>
      <TextInput
        mode="outlined"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        style={styles.input}
      />

      <Text variant="titleMedium" style={styles.label}>
        Note (optional)
      </Text>
      <TextInput
        mode="outlined"
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Lunch with team"
        style={styles.input}
      />

      <Text variant="titleMedium" style={styles.label}>
        Category
      </Text>
      {categories.length > 0 ? (
        <SegmentedButtons
          value={String(categoryId)}
          onValueChange={(v) => setCategoryId(Number(v))}
          buttons={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          style={styles.segmented}
        />
      ) : (
        <Text style={styles.noCategory}>
          No categories yet. Add one in Settings.
        </Text>
      )}

      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Add Expense
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },
  label: { marginTop: 12 },
  input: { marginBottom: 4 },
  segmented: { marginBottom: 8 },
  noCategory: { color: "#888", marginBottom: 8 },
  button: { marginTop: 24 },
});
