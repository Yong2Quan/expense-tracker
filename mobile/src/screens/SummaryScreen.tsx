import React from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useExpenses } from "../hooks/useExpenses";
import { useTabContentPadding } from "../hooks/useBottomSpace";
import { monthlySummary, monthlyTotal } from "../api/summary";
import DonutChart, { capSlices } from "../components/DonutChart";
import CategoryAvatar from "../components/CategoryAvatar";
import { EmptyState, ErrorNotice, Loading } from "../components/Status";
import { gradients, palette, radius, shadow, spacing } from "../theme";
import { currentMonthISO, formatMoney, formatMonthLabel } from "../utils/format";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SummaryScreen(): React.JSX.Element {
  const { expenses, loading, error, refresh } = useExpenses();
  const navigation = useNavigation<Nav>();
  const bottomPadding = useTabContentPadding();

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={() => void refresh()} />;

  const month = currentMonthISO();
  const summary = monthlySummary(expenses, month);
  const total = monthlyTotal(expenses, month);
  const slices = capSlices(summary);
  // Scaled against the largest category, not the total, so small ones stay readable.
  const largest = summary[0]?.total ?? 0;

  const openMonth = () => navigation.navigate("MonthDetail", { month });

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void refresh()} />}
    >
      <Pressable
        onPress={openMonth}
        accessibilityRole="button"
        accessibilityLabel={`${formatMonthLabel(month)} detail`}
        style={({ pressed }) => [styles.heroWrap, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroLabel}>{formatMonthLabel(month)}</Text>
          <Text style={styles.heroValue}>{formatMoney(total)}</Text>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>See every expense</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={palette.onBrand} />
          </View>
        </LinearGradient>
      </Pressable>

      {summary.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="chart-donut"
            title="Nothing to summarise"
            hint="Add expenses this month and the breakdown appears here."
          />
        </View>
      ) : (
        <>
          <View style={[styles.card, styles.donutCard]}>
            <DonutChart slices={slices} total={total} />
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

          <Text style={styles.sectionHeading}>Where it went</Text>

          <View style={styles.card}>
            {summary.map((item, index) => (
              <View key={item.name} style={[styles.row, index > 0 && styles.rowDivider]}>
                <View style={styles.rowTop}>
                  <CategoryAvatar name={item.name} colour={item.colour} size={32} />
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.values}>
                    <Text style={styles.amount}>{formatMoney(item.total)}</Text>
                    <Text style={styles.percent}>{item.percentage.toFixed(0)}%</Text>
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
        </>
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
    alignItems: "center",
    gap: spacing.xs,
  },
  heroLabel: {
    color: palette.onBrandMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroValue: { color: palette.onBrand, fontSize: 48, fontWeight: "800", lineHeight: 56 },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  heroChipText: { color: palette.onBrand, fontSize: 12, fontWeight: "700" },

  sectionHeading: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: -spacing.sm,
  },

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

  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: palette.outline },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  name: { flex: 1, color: palette.textPrimary, fontSize: 15, fontWeight: "600" },
  values: { alignItems: "flex-end" },
  amount: { color: palette.textPrimary, fontSize: 15, fontWeight: "700" },
  percent: { color: palette.textMuted, fontSize: 12 },

  track: { height: 8, backgroundColor: palette.track, borderRadius: radius.sm, overflow: "hidden" },
  fill: { height: 8, borderTopRightRadius: 4, borderBottomRightRadius: 4 },

  emptyWrap: { height: 260 },
});
