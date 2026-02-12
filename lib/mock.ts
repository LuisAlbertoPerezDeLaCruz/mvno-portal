import { CustomerSummary } from "./types";

export const customerSummaryMock: CustomerSummary = {
  customerName: "Luis Herrera",
  planName: "Prepago Plus",
  planPrice: 42000,
  balance: 50000,
  dataUsedGb: 9.4,
  dataLimitGb: 18,
  lines: [
    {
      id: "line-01",
      msisdn: "3001234567",
      status: "active",
      planName: "Prepago Plus",
    },
    {
      id: "line-02",
      msisdn: "3019876543",
      status: "suspended",
      planName: "Control 25 GB",
    },
  ],
  recentMovements: [
    {
      id: "mov-01",
      title: "Recarga PSE",
      amount: 30000,
      createdAt: "2026-02-10T10:30:00-05:00",
    },
    {
      id: "mov-02",
      title: "Compra paquete 5GB",
      amount: 12000,
      createdAt: "2026-02-08T18:15:00-05:00",
    },
    {
      id: "mov-03",
      title: "Renovacion plan Prepago Plus",
      amount: 42000,
      createdAt: "2026-02-01T08:00:00-05:00",
    },
  ],
};
