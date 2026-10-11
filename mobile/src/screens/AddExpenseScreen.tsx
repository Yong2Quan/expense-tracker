import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { createExpense } from "../api/expenses";
import { getCategories } from "../api/categories";
import { useTabContentPadding } from "../hooks/useBottomSpace";
import { iconForCategory } from "../categoryIcons";
import { EmptyState, ErrorNotice, Loading } from "../components/Status";
import { palette, radius, spacing } from "../theme";
import { todayISO } from "../utils/format";
import type { Category } from "../types";

export default function AddExpenseScreen(): React.JSX.Element {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const bottomPadding = useTabContentPadding();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const cats = await getCategories();
      setCategories(cats);
      setCategoryId((current) =>
        current && cats.some((c) => c.id === current) ? current : (cats[0]?.id ?? null),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories]),
  );

  const handleSubmit = (): void => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Enter a positive number.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert("Invalid date", "Use the format YYYY-MM-DD.");
      return;
    }
    if (!categoryId) {
      Alert.alert("No category", "Please select a category.");
      return;
    }

    void (async () => {
      setSaving(true);
      try {
        await createExpense({
          amount: parsed,
          note: note.trim() || undefined,
          date,
          category_id: categoryId,
        });
        setAmount("");
        setNote("");
        Alert.alert("Saved", "Expense added.");
      } catch (err) {
        Alert.alert("Could not save", err instanceof Error ? err.message : "Unknown error");
      } finally {
        setSaving(false);
      }
    })();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={() => void loadCategories()} />;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Amount, as the focal input ────────────────────────────── */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>$</Text>
          <RNTextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={palette.textMuted}
            style={styles.amountInput}
          />
        </View>
      </View>

      {/* ── Category picker ───────────────────────────────────────── */}
      <Text style={styles.sectionHeading}>Category</Text>
      {categories.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="shape-outline"
            title="No categories yet"
            hint="Create one in the Categories tab first."
          />
        </View>
      ) : (
        <View style={styles.grid}>
          {categories.map((cat) => {
            const selected = cat.id === categoryId;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[
                  styles.tile,
                  selected && { borderColor: cat.colour, backgroundColor: `${cat.colour}14` },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={cat.name}
              >
                <View style={[styles.tileIcon, { backgroundColor: cat.colour }]}>
                  <MaterialCommunityIcons
                    name={iconForCategory(cat.name)}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
                <Text
                  style={[styles.tileLabel, selected && styles.tileLabelSelected]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Details ───────────────────────────────────────────────── */}
      <Text style={styles.sectionHeading}>Details</Text>
      <TextInput
        mode="outlined"
        label="Date"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        left={<TextInput.Icon icon="calendar" />}
        style={styles.input}
        outlineColor={palette.outline}
      />
      <TextInput
        mode="outlined"
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Lunch with team"
        left={<TextInput.Icon icon="text" />}
        style={styles.input}
        outlineColor={palette.outline}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={saving}
        disabled={saving || categories.length === 0}
        icon="check"
        contentStyle={styles.submitContent}
        style={styles.submit}
      >
        Add Expense
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },

  amountCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  amountLabel: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  amountRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  currency: { color: palette.textMuted, fontSize: 32, fontWeight: "600" },
  amountInput: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: 40,
    fontWeight: "700",
    padding: 0,
  },

  sectionHeading: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xs,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tile: {
    width: "31%",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: { color: palette.textSecondary, fontSize: 12, fontWeight: "500" },
  tileLabelSelected: { color: palette.textPrimary, fontWeight: "700" },

  input: { backgroundColor: palette.surface },

  submit: { marginTop: spacing.lg, borderRadius: radius.md },
  submitContent: { paddingVertical: spacing.sm },

  emptyWrap: { height: 220 },
});
