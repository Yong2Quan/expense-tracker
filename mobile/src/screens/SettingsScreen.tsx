import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Divider, IconButton, List, Text, TextInput, Title } from "react-native-paper";

import { createCategory, deleteCategory, getCategories } from "../db/local";
import type { Category } from "../types";

const PRESET_COLOURS = [
  "#6366F1", "#F59E0B", "#3B82F6", "#EC4899",
  "#8B5CF6", "#10B981", "#EF4444", "#F97316",
  "#14B8A6", "#64748B",
];

export default function SettingsScreen(): React.JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newColour, setNewColour] = useState(PRESET_COLOURS[0]);
  const [error, setError] = useState("");

  const refresh = (): void => setCategories(getCategories());

  useEffect(() => {
    refresh();
  }, []);

  const handleAdd = (): void => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Category name cannot be empty.");
      return;
    }
    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setError("A category with that name already exists.");
      return;
    }

    createCategory({ name: trimmed, colour: newColour });
    setNewName("");
    setNewColour(PRESET_COLOURS[0]);
    setError("");
    refresh();
  };

  const handleDelete = (cat: Category): void => {
    Alert.alert(
      `Delete "${cat.name}"?`,
      "Any expenses in this category will also be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCategory(cat.id);
            refresh();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ── Add category ───────────────────────────────────────── */}
      <Title>Add Category</Title>

      <TextInput
        mode="outlined"
        label="Name"
        value={newName}
        onChangeText={(v) => { setNewName(v); setError(""); }}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text variant="labelLarge" style={styles.colourLabel}>Colour</Text>
      <View style={styles.swatchRow}>
        {PRESET_COLOURS.map((colour) => (
          <TouchableOpacity
            key={colour}
            onPress={() => setNewColour(colour)}
            style={[
              styles.swatch,
              { backgroundColor: colour },
              newColour === colour && styles.swatchSelected,
            ]}
          />
        ))}
      </View>

      <Button mode="contained" onPress={handleAdd} style={styles.addButton}>
        Add Category
      </Button>

      <Divider style={styles.divider} />

      {/* ── Existing categories ─────────────────────────────────── */}
      <Title>Your Categories</Title>

      {categories.length === 0 ? (
        <Text style={styles.empty}>No categories yet.</Text>
      ) : (
        categories.map((cat) => (
          <List.Item
            key={cat.id}
            title={cat.name}
            left={() => (
              <View style={[styles.dot, { backgroundColor: cat.colour }]} />
            )}
            right={() => (
              <IconButton
                icon="trash-can-outline"
                onPress={() => handleDelete(cat)}
              />
            )}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  input: { marginBottom: 4 },
  error: { color: "#EF4444", marginBottom: 4 },
  colourLabel: { marginTop: 8 },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 8,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "#1F2937",
  },
  addButton: { marginTop: 8 },
  divider: { marginVertical: 20 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignSelf: "center",
    marginLeft: 4,
  },
  empty: { color: "#aaa", textAlign: "center", marginTop: 16 },
});
