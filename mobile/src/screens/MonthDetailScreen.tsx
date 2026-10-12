import React from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useExpenses } from "../hooks/useExpenses";
import { useStackContentPadding } from "../hooks/useBottomSpace";
import { filterByMonth, groupByDay, monthlySummary, monthlyTotal } from "../api/summary";
import DonutChart, { capSlices } from "../components/DonutChart";
import CategoryAvatar from "../components/CategoryAvatar";
import { iconForCategory } from "../categoryIcons";
import { gradientFrom } from "../utils/colour";
import { EmptyState, ErrorNotice, Loading } from "../components/Status";
import { gradients, palette, radius, shadow, spacing } from "../theme";
import { formatDayLabel, formatMoney, formatMonthLabel, formatWeekday } from "../utils/format";
import type { MonthDetailProps } from "../navigation/types";

export default function MonthDetailScreen({
  route,
  navigation,
}: MonthDetailProps): React.JSX.Element {
  const { month } = route.params;
  const { expenses, loading, error, refresh } = useExpenses();
  const insets = useSafeAreaInsets();
  const bottomPadding = useStackContentPadding();

  const monthExpenses = filterByMonth(expenses, month);
  const summary = monthlySummary(expenses, month);
  const total = monthlyTotal(expenses, month);
  const slices = capSlices(summary);
  const largest = summary[0]?.total ?? 0;

  // Same dynamic colour as the dashboard, so tapping through feels continuous.
  const headerColours = summary[0] ? gradientFrom(summary[0].colour) : gradients.detail;
  const headerIcon = summary[0] ? iconForCategory(summary[0].name) : undefined;

  const Header = (
    <>
      <LinearGradient
        colors={headerColours}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.navRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={palette.onBrand} />
          </Pressable>
          <Text style={styles.navTitle}>{formatMonthLabel(month)}</Text>
          <View style={styles.backButton} />
        </View>

        {headerIcon ? (
          <MaterialCommunityIcons
            name={headerIcon}
            size={120}
            color="rgba(255,255,255,0.12)"
            style={styles.watermark}
            pointerEvents="none"
          />
        ) : null}

        <Text style={styles.heroValue}>{formatMoney(total)}</Text>
        <Text style={styles.heroCaption}>
          {monthExpenses.length} {monthExpenses.length === 1 ? "expense" : "expenses"} ·{" "}
          {summary.length} {summary.length === 1 ? "category" : "categories"}
        </Text>
      </LinearGradient>

      {summary.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="chart-donut"
            title="Nothing spent this month"
            hint="Add an expense and the breakdown appears here."
          />
        </View>
      ) : (
        <View style={styles.body}>
          {/* ── Donut: share at a glance ───────────────────────────── */}
          <View style={[styles.card, styles.donutCard]}>
            <DonutChart slices={slices} total={total} />

            {/* Legend — identity never rests on colour alone. */}
            <View style={styles.legend}>
              {slices.map((slice) => (
                <View key={slice.name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: slice.colour }]} />
                  <Text style={styles.legendName} numberOfLines={1}>
                    {slice.name}
                  </Text>
                  <Text style={styles.legendPct}>{slice.percentage.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Ranked bars: the precise comparison ────────────────── */}
          <Text style={styles.sectionHeading}>By category</Text>
          <View style={styles.card}>
            {summary.map((item, index) => (
              <View key={item.name} style={[styles.barRow, index > 0 && styles.divider]}>
                <View style={styles.barTop}>
                  <CategoryAvatar name={item.name} colour={item.colour} size={32} />
                  <Text style={styles.barName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.barValues}>
                    <Text style={styles.barAmount}>{formatMoney(item.total)}</Text>
                    <Text style={styles.barPct}>{item.percentage.toFixed(0)}%</Text>
                  </View>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${largest > 0 ? Math.max((item.total / largest) * 100, 2) : 0}%`,
                        backgroundColor: item.colour,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeading}>Every expense</Text>
        </View>
      )}
    </>
  );

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={() => void refresh()} />;

  return (
    <SectionList
      style={styles.page}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      sections={groupByDay(monthExpenses)}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={Header}
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
            styles.itemRow,
            index === 0 && styles.itemFirst,
            index === section.data.length - 1 && styles.itemLast,
            index > 0 && styles.divider,
          ]}
        >
          <CategoryAvatar name={item.category.name} colour={item.category.colour} size={36} />
          <View style={styles.itemText}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.category.name}
            </Text>
            {item.note ? (
              <Text style={styles.itemSub} numberOfLines={1}>
                {item.note}
              </Text>
            ) : null}
          </View>
          <Text style={styles.itemAmount}>{formatMoney(item.amount)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },

  gradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    alignItems: "center",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginBottom: spacing.md,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { color: palette.onBrand, fontSize: 17, fontWeight: "700" },
  heroValue: { color: palette.onBrand, fontSize: 44, fontWeight: "800", lineHeight: 52 },
  heroCaption: { color: palette.onBrandMuted, fontSize: 13, marginTop: spacing.xs },
  watermark: { position: "absolute", right: -10, bottom: -18, transform: [{ rotate: "-12deg" }] },

  body: { padding: spacing.lg, gap: spacing.lg },

  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.outline,
    overflow: "hidden",
    ...shadow,
  },
  donutCard: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.lg },

  legend: { alignSelf: "stretch", paddingHorizontal: spacing.lg, gap: spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { flex: 1, color: palette.textSecondary, fontSize: 14 },
  legendPct: { color: palette.textPrimary, fontSize: 14, fontWeight: "700" },

  sectionHeading: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: -spacing.sm,
  },

  barRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  barTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  barName: { flex: 1, color: palette.textPrimary, fontSize: 15, fontWeight: "600" },
  barValues: { alignItems: "flex-end" },
  barAmount: { color: palette.textPrimary, fontSize: 15, fontWeight: "700" },
  barPct: { color: palette.textMuted, fontSize: 12 },
  track: { height: 8, backgroundColor: palette.track, borderRadius: radius.sm, overflow: "hidden" },
  fill: { height: 8, borderTopRightRadius: 4, borderBottomRightRadius: 4 },

  divider: { borderTopWidth: 1, borderTopColor: palette.outline },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingBottom: spacing.sm,
  },
  dayLabel: { color: palette.textPrimary, fontSize: 15, fontWeight: "700" },
  dayWeekday: { color: palette.textMuted, fontSize: 12 },
  dayTotal: { color: palette.textSecondary, fontSize: 15, fontWeight: "700" },
  sectionGap: { height: spacing.xl },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: palette.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: palette.outline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  itemLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  itemText: { flex: 1, gap: 2 },
  itemTitle: { color: palette.textPrimary, fontSize: 15, fontWeight: "600" },
  itemSub: { color: palette.textMuted, fontSize: 13 },
  itemAmount: { color: palette.textPrimary, fontSize: 15, fontWeight: "700" },

  emptyWrap: { height: 320 },
});
