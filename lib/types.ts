export type LineStatus = "active" | "inactive" | "suspended";

export type CustomerLine = {
  id: string;
  msisdn: string;
  status: LineStatus;
  planName: string;
};

export type RecentMovement = {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
};

export type CustomerSummary = {
  customerName: string;
  planName: string;
  planPrice: number;
  balance: number;
  dataUsedGb: number;
  dataLimitGb: number;
  lines: CustomerLine[];
  recentMovements: RecentMovement[];
};
