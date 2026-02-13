import {
  BuyPackageRequest,
  CustomerSummary,
  TopupRequest,
  TopupResponse,
} from "./types";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Fall back to HTTP status when there is no JSON body.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function getCustomerSummaryApi(): Promise<CustomerSummary> {
  const response = await fetch("/api/customer/summary", {
    method: "GET",
    cache: "no-store",
  });
  return parseJson<CustomerSummary>(response);
}

export async function topupApi(payload: TopupRequest): Promise<TopupResponse> {
  const response = await fetch("/api/topup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<TopupResponse>(response);
}

export async function buyPackageApi(payload: BuyPackageRequest) {
  const response = await fetch("/api/buy-package", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<{ ok: true; balance: number }>(response);
}
