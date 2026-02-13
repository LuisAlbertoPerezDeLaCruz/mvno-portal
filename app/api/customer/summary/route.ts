import { getCustomerSummary } from "@/lib/mock-db";
import { NextResponse } from "next/server";

export async function GET() {
  const summary = getCustomerSummary();
  return NextResponse.json(summary);
}
