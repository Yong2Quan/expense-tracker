import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton, Text, TextInput } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { createCategory, deleteCategory, getCategories } from "../api/categories";
import { useTabContentPadding } from "../hooks/useBottomSpace";
import CategoryAvatar from "../components/CategoryAvatar";
import { EmptyState, ErrorNotice, Loading } from "../components/Status";
import { CATEGORY_COLOURS, palette, radius, spacing } from "../theme";
import type { Category } from "../types";

export default function SettingsScreen(): React.JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newColour, setNewColour] = useState<string>(CATEGORY_COLOURS[0]);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const bottomPadding = useTabContentPadding();

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setCategories(await getCategories());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleAdd = (): void => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Category name cannot be empty.");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("A category with that name already exists.");
      return;
    }

    void (async () => {
      setSaving(true);
      try {
        await createCategory({ name: trimmed, colour: newColour });
        setNewName("");
        setNewColour(CATEGORY_COLOURS[0]);
        setError("");
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create category.");
      } finally {
        setSaving(false);
      }
    })();
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
            void (async () => {
              try {
                await deleteCategory(cat.id);
                await refresh();
              } catch (err) {
                Alert.alert("Delete failed", err instanceof Error ? err.message : "Unknown error");
              }
            })();
          },
        },
      ],
    );
  };

  if (loading) return <Loading />;
  if (loadError) return <ErrorNotice message={loadError} onRetry={() => void refresh()} />;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── New category, with a live preview of how it will look ── */}
      <Text style={styles.sectionHeading}>New category</Text>

      <View style={styles.card}>
        <View style={styles.previewRow}>
          <CategoryAvatar name={newName || "tag"} colour={newColour} size={48} />
          <View style={styles.previewText}>
            <Text style={styles.previewName} numberOfLines={1}>
              {newName.trim() || "Preview"}
            </Text>
            <Text style={styles.previewHint}>
              The icon is picked from the name
            </Text>
          </View>
        </View>

        <TextInput
          mode="outlined"
          label="Name"
          value={newName}
          onChangeText={(v) => {
            setNewName(v);
            setError("");
          }}
          placeholder="e.g. Coffee, Rent, Pet"
          style={styles.input}
          outlineColor={palette.outline}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.fieldLabel}>Colour</Text>
        <View style={styles.swatchRow}>
          {CATEGORY_COLOURS.map((colour) => {
            const selected = newColour === colour;
            return (
              <Pressable
                key={colour}
                onPress={() => setNewColour(colour)}
                style={[styles.swatch, { backgroundColor: colour }, selected && styles.swatchSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Colour ${colour}`}
              >
                {selected ? (
                  <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleAdd}
          loading={saving}
          disabled={saving}
          icon="plus"
          contentStyle={styles.addContent}
          style={styles.add}
        >
          Add Category
        </Button>
      </View>

      {/* ── Existing ──────────────────────────────────────────────── */}
      <Text style={styles.sectionHeading}>Your categories</Text>

      {categories.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState icon="shape-outline" title="No categories yet" />
        </View>
      ) : (
        <View style={styles.card}>
          {categories.map((cat, index) => (
            <View key={cat.id} style={[styles.row, index > 0 && styles.rowDivider]}>
              <CategoryAvatar name={cat.name} colour={cat.colour} />
              <Text style={styles.rowTitle} numberOfLines={1}>
                {cat.name}
              </Text>
              <IconButton
                icon="trash-can-outline"
                size={20}
                iconColor={palette.textMuted}
                style={styles.delete}
                onPress={() => handleDelete(cat)}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },

  sectionHeading: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xs,
  },

  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: spacing.md,
    gap: spacing.md,
  },

  previewRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  previewText: { flex: 1, gap: 2 },
  previewName: { color: palette.textPrimary, fontSize: 17, fontWeight: "700" },
  previewHint: { color: palette.textMuted, fontSize: 12 },

  input: { backgroundColor: palette.surface },
  error: { color: palette.danger, fontSize: 13, marginTop: -spacing.sm },

  fieldLabel: { color: palette.textSecondary, fontSize: 13, fontWeight: "600" },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: palette.textPrimary,
  },

  add: { borderRadius: radius.md },
  addContent: { paddingVertical: spacing.xs },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: palette.outline },
  rowTitle: { flex: 1, color: palette.textPrimary, fontSize: 15, fontWeight: "600" },
  delete: { margin: 0 },

  emptyWrap: { height: 200 },
});
