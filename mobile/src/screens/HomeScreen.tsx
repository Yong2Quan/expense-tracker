import React from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useExpenses } from "../hooks/useExpenses";
import { useTabContentPadding } from "../hooks/useBottomSpace";
import { averagePerActiveDay, filterByMonth, monthlySummary, monthlyTotal } from "../api/summary";
import CategoryAvatar from "../components/CategoryAvatar";
import { EmptyState, ErrorNotice, Loading } from "../components/Status";
import { gradients, palette, radius, shadow, spacing } from "../theme";
import { currentMonthISO, formatDayLabel, formatMoney, formatMonthLabel } from "../utils/format";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen(): React.JSX.Element {
  const { expenses, loading, error, refresh } = useExpenses();
  const navigation = useNavigation<Nav>();
  const bottomPadding = useTabContentPadding();

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={() => void refresh()} />;

  const month = currentMonthISO();
  const monthExpenses = filterByMonth(expenses, month);
  const total = monthlyTotal(expenses, month);
  const perDay = averagePerActiveDay(expenses, month);
  const topCategory = monthlySummary(expenses, month)[0];
  const recent = monthExpenses.slice(0, 5);

  const openMonth = () => navigation.navigate("MonthDetail", { month });

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void refresh()} />}
    >
      {/* ── Hero. Tapping it opens the full month breakdown. ─────── */}
      <Pressable
        onPress={openMonth}
        accessibilityRole="button"
        accessibilityLabel={`${formatMonthLabel(month)} breakdown`}
        style={({ pressed }) => [styles.heroWrap, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>{formatMonthLabel(month)}</Text>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>Breakdown</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={palette.onBrand} />
            </View>
          </View>

          <Text style={styles.heroValue}>{formatMoney(total)}</Text>
          <Text style={styles.heroCaption}>
            {monthExpenses.length} {monthExpenses.length === 1 ? "expense" : "expenses"} this month
          </Text>
        </LinearGradient>
      </Pressable>

      {/* ── KPI row ───────────────────────────────────────────────── */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: "#EEF2FF" }]}>
            <MaterialCommunityIcons name="calendar-today" size={18} color="#4F46E5" />
          </View>
          <Text style={styles.kpiValue}>{formatMoney(perDay)}</Text>
          <Text style={styles.kpiLabel}>Avg / active day</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: "#FFF5E8" }]}>
            <MaterialCommunityIcons name="trophy-outline" size={18} color="#D97706" />
          </View>
          <Text style={styles.kpiValue} numberOfLines={1}>
            {topCategory ? topCategory.name : "—"}
          </Text>
          <Text style={styles.kpiLabel}>
            {topCategory ? `${formatMoney(topCategory.total)} spent` : "Top category"}
          </Text>
        </View>
      </View>

      {/* ── Recent ────────────────────────────────────────────────── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionHeading}>Recent</Text>
        <Pressable onPress={openMonth} hitSlop={8} accessibilityRole="button">
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      {recent.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="receipt"
            title="Nothing yet this month"
            hint="Add your first expense from the Add tab."
          />
        </View>
      ) : (
        <View style={styles.card}>
          {recent.map((expense, index) => (
            <View key={expense.id} style={[styles.row, index > 0 && styles.rowDivider]}>
              <CategoryAvatar name={expense.category.name} colour={expense.category.colour} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {expense.category.name}
                </Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {expense.note
                    ? `${formatDayLabel(expense.date)} · ${expense.note}`
                    : formatDayLabel(expense.date)}
                </Text>
              </View>
              <Text style={styles.rowAmount}>{formatMoney(expense.amount)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, gap: spacing.lg },

  heroWrap: { borderRadius: radius.xl, ...shadow },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  hero: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  heroLabel: {
    color: palette.onBrandMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  heroChipText: { color: palette.onBrand, fontSize: 12, fontWeight: "700" },
  heroValue: { color: palette.onBrand, fontSize: 48, fontWeight: "800", lineHeight: 56 },
  heroCaption: { color: palette.onBrandMuted, fontSize: 13 },

  kpiRow: { flexDirection: "row", gap: spacing.md },
  kpiCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  kpiValue: { color: palette.textPrimary, fontSize: 17, fontWeight: "700" },
  kpiLabel: { color: palette.textMuted, fontSize: 12 },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -spacing.sm,
  },
  sectionHeading: { color: palette.textPrimary, fontSize: 16, fontWeight: "700" },
  seeAll: { color: palette.brand, fontSize: 14, fontWeight: "700" },

  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.outline,
    overflow: "hidden",
    ...shadow,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: palette.outline },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { color: palette.textPrimary, fontSize: 15, fontWeight: "600" },
  rowSub: { color: palette.textMuted, fontSize: 13 },
  rowAmount: { color: palette.textPrimary, fontSize: 15, fontWeight: "700" },

  emptyWrap: { height: 260 },
});
