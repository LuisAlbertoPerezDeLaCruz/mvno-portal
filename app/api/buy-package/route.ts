import { applyBuyPackage } from "@/lib/mock-db";
import { BuyPackageRequest } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<BuyPackageRequest>;
  if (!payload.packageCode || typeof payload.packageCode !== "string") {
    return NextResponse.json({ error: "packageCode requerido" }, { status: 400 });
  }

  try {
    const result = applyBuyPackage({ packageCode: payload.packageCode });
    return NextResponse.json({
      ok: true,
      receipt: result.receipt,
      balance: result.balance,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PACKAGE_NOT_FOUND") {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}
