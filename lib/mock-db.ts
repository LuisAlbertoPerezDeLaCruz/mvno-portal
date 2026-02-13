import { customerSummaryMock } from "./mock";
import {
  BuyPackageRequest,
  CustomerSummary,
  PaymentMethod,
  RecentMovement,
} from "./types";

const PACKAGE_CATALOG: Record<string, { title: string; price: number }> = {
  data_5gb: { title: "Compra paquete 5GB", price: 12000 },
  voz_100min: { title: "Compra paquete voz 100 min", price: 9000 },
  combo_full: { title: "Compra paquete combo full", price: 18000 },
};

const summaryState: CustomerSummary = structuredClone(customerSummaryMock);

export function getCustomerSummary(): CustomerSummary {
  return structuredClone(summaryState);
}

export function applyTopup(amount: number, method: PaymentMethod): {
  receipt: RecentMovement;
  balance: number;
} {
  const receipt: RecentMovement = {
    id: `mov-${Date.now()}`,
    title: `Recarga ${method}`,
    amount,
    createdAt: new Date().toISOString(),
  };

  summaryState.balance += amount;
  summaryState.recentMovements = [receipt, ...summaryState.recentMovements].slice(0, 12);

  return {
    receipt,
    balance: summaryState.balance,
  };
}

export function applyBuyPackage(payload: BuyPackageRequest): {
  receipt: RecentMovement;
  balance: number;
} {
  const selected = PACKAGE_CATALOG[payload.packageCode];
  if (!selected) {
    throw new Error("PACKAGE_NOT_FOUND");
  }
  if (summaryState.balance < selected.price) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  const receipt: RecentMovement = {
    id: `mov-${Date.now()}`,
    title: selected.title,
    amount: selected.price,
    createdAt: new Date().toISOString(),
  };

  summaryState.balance -= selected.price;
  summaryState.recentMovements = [receipt, ...summaryState.recentMovements].slice(0, 12);

  return {
    receipt,
    balance: summaryState.balance,
  };
}
