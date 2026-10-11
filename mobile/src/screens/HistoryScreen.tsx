import React from "react";
import { Alert, SectionList, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

import { deleteExpense } from "../api/expenses";
import { groupByDay } from "../api/summary";
import { useExpenses } from "../hooks/useExpenses";
import { useTabContentPadding } from "../hooks/useBottomSpace";
import CategoryAvatar from "../components/CategoryAvatar";
import { EmptyState, ErrorNotice, Loading } from "../components/Status";
import { palette, radius, spacing } from "../theme";
import { formatDayLabel, formatMoney, formatWeekday } from "../utils/format";

export default function HistoryScreen(): React.JSX.Element {
  const { expenses, loading, error, refresh } = useExpenses();
  const bottomPadding = useTabContentPadding();

  const handleDelete = (id: number, label: string): void => {
    Alert.alert("Delete expense?", `${label} will be removed. This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteExpense(id);
              await refresh();
            } catch (err) {
              Alert.alert("Delete failed", err instanceof Error ? err.message : "Unknown error");
            }
          })();
        },
      },
    ]);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={() => void refresh()} />;

  if (expenses.length === 0) {
    return (
      <View style={styles.page}>
        <EmptyState
          icon="receipt"
          title="No expenses yet"
          hint="Anything you add will show up here, grouped by day."
        />
      </View>
    );
  }

  return (
    <SectionList
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      sections={groupByDay(expenses)}
      keyExtractor={(item) => String(item.id)}
      stickySectionHeadersEnabled={false}
      refreshing={loading}
      onRefresh={() => void refresh()}
      renderSectionHeader={({ section }) => (
        <View style={styles.dayHeader}>
          <View>
            <Text style={styles.dayLabel}>{formatDayLabel(section.date)}</Text>
            <Text style={styles.dayWeekday}>{formatWeekday(section.date)}</Text>
          </View>
          <Text style={styles.dayTotal}>{formatMoney(section.total)}</Text>
        </View>
      )}
      renderSectionFooter={() => <View style={styles.sectionGap} />}
      renderItem={({ item, index, section }) => (
        <View
          style={[
            styles.row,
            index === 0 && styles.rowFirst,
            index === section.data.length - 1 && styles.rowLast,
            index > 0 && styles.rowDivider,
          ]}
        >
          <CategoryAvatar name={item.category.name} colour={item.category.colour} />

          <View style={styles.rowText}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {item.category.name}
            </Text>
            {item.note ? (
              <Text style={styles.rowSub} numberOfLines={1}>
                {item.note}
              </Text>
            ) : null}
          </View>

          <Text style={styles.rowAmount}>{formatMoney(item.amount)}</Text>

          <IconButton
            icon="trash-can-outline"
            size={20}
            iconColor={palette.textMuted}
            style={styles.delete}
            onPress={() => handleDelete(item.id, `${item.category.name} ${formatMoney(item.amount)}`)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  dayLabel: { color: palette.textPrimary, fontSize: 15, fontWeight: "700" },
  dayWeekday: { color: palette.textMuted, fontSize: 12 },
  dayTotal: { color: palette.textSecondary, fontSize: 15, fontWeight: "700" },

  sectionGap: { height: spacing.xl },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: palette.outline,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.sm,
  },
  rowFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  rowLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: palette.outline },

  rowText: { flex: 1, gap: 2 },
  rowTitle: { color: palette.textPrimary, fontSize: 15, fontWeight: "600" },
  rowSub: { color: palette.textMuted, fontSize: 13 },
  rowAmount: { color: palette.textPrimary, fontSize: 15, fontWeight: "700" },
  delete: { margin: 0 },
});
