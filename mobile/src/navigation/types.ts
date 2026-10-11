import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Tabs: undefined;
  /** month is "YYYY-MM" */
  MonthDetail: { month: string };
};

export type MonthDetailProps = NativeStackScreenProps<RootStackParamList, "MonthDetail">;
