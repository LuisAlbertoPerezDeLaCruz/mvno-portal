import { applyTopup } from "@/lib/mock-db";
import { PaymentMethod, TopupRequest, TopupResponse } from "@/lib/types";
import { NextResponse } from "next/server";

const ALLOWED_METHODS: PaymentMethod[] = ["PSE", "Tarjeta", "Nequi"];

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<TopupRequest>;

  if (typeof payload.amount !== "number" || !Number.isFinite(payload.amount)) {
    return NextResponse.json({ error: "Monto invalido" }, { status: 400 });
  }
  if (payload.amount < 1000 || payload.amount > 200000) {
    return NextResponse.json({ error: "Monto fuera de rango" }, { status: 400 });
  }
  if (!payload.method || !ALLOWED_METHODS.includes(payload.method)) {
    return NextResponse.json({ error: "Metodo de pago invalido" }, { status: 400 });
  }

  const result = applyTopup(payload.amount, payload.method);
  const response: TopupResponse = {
    ok: true,
    receipt: result.receipt,
    balance: result.balance,
  };
  return NextResponse.json(response);
}
