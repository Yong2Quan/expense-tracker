import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Divider, Text, Title } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

import { getMonthlySummary, getMonthlyTotal, type CategorySummary } from "../db/local";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SummaryScreen(): React.JSX.Element {
  const now = new Date();
  const [month] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [total, setTotal] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      setSummary(getMonthlySummary(month));
      setTotal(getMonthlyTotal(month));
    }, [month]),
  );

  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.heading}>{monthLabel}</Title>

      <Card style={styles.totalCard}>
        <Card.Content>
          <Text variant="labelLarge">Total Spent</Text>
          <Text variant="displaySmall" style={styles.totalAmount}>
            ${total.toFixed(2)}
          </Text>
        </Card.Content>
      </Card>

      <Title style={styles.heading}>By Category</Title>

      {summary.length === 0 ? (
        <Text style={styles.empty}>No data for this month yet.</Text>
      ) : (
        <Card>
          <Card.Content style={styles.breakdownContainer}>
            {summary.map((item, index) => (
              <View key={item.name}>
                <View style={styles.row}>
                  {/* Colour dot */}
                  <View style={[styles.dot, { backgroundColor: item.colour }]} />

                  <View style={styles.labelGroup}>
                    <Text variant="bodyLarge">{item.name}</Text>

                    {/* Progress bar */}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${item.percentage}%` as `${number}%`,
                            backgroundColor: item.colour,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.amounts}>
                    <Text variant="bodyLarge" style={styles.amountText}>
                      ${item.total.toFixed(2)}
                    </Text>
                    <Text variant="bodySmall" style={styles.pctText}>
                      {item.percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>

                {index < summary.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  heading: { marginTop: 8 },
  totalCard: { marginBottom: 8 },
  totalAmount: { color: "#6366F1", fontWeight: "bold" },
  breakdownContainer: { gap: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  labelGroup: { flex: 1, gap: 4 },
  barTrack: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  amounts: { alignItems: "flex-end" },
  amountText: { fontWeight: "600" },
  pctText: { color: "#9CA3AF" },
  divider: { marginVertical: 2 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 32 },
});
