"use client";

import { topupApi } from "@/lib/api";
import { PaymentMethod, RecentMovement } from "@/lib/types";
import { SyntheticEvent, useMemo, useState } from "react";

type SubmitStatus = "idle" | "loading" | "success" | "error";

const PAYMENT_METHODS: PaymentMethod[] = ["PSE", "Tarjeta", "Nequi"];
const QUICK_AMOUNTS = [10000, 20000, 30000, 50000];

function formatCurrencyCop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RecargaPage() {
  const [amountInput, setAmountInput] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("PSE");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");
  const [receipts, setReceipts] = useState<RecentMovement[]>([]);

  const amountNumber = useMemo(() => Number(amountInput), [amountInput]);

  function validateAmount(value: number) {
    if (!Number.isFinite(value) || Number.isNaN(value)) {
      return "Ingresa un monto valido.";
    }
    if (value < 1000) {
      return "El monto minimo de recarga es $1.000.";
    }
    if (value > 200000) {
      return "El monto maximo por recarga es $200.000.";
    }
    return "";
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    const validationError = validateAmount(amountNumber);
    if (validationError) {
      setStatus("error");
      setMessage(validationError);
      return;
    }

    setStatus("loading");
    setMessage("Procesando pago...");

    try {
      const response = await topupApi({
        amount: amountNumber,
        method,
      });

      setReceipts((prev) => [response.receipt, ...prev]);
      setStatus("success");
      setMessage(`Recarga exitosa. Nuevo saldo: ${formatCurrencyCop(response.balance)}.`);
      setAmountInput("");
    } catch (submitError) {
      setStatus("error");
      setMessage(submitError instanceof Error ? submitError.message : "Error procesando recarga.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Recarga</h1>
        <p className="mt-1 text-gray-600">
          Realiza una recarga a tu linea con metodos de pago simulados.
        </p>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium">
              Monto
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min={1000}
              max={200000}
              step={1000}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="Ej: 20000"
              className="w-full rounded-lg border px-3 py-2 outline-none ring-slate-300 focus:ring"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="rounded-full border px-3 py-1 text-sm hover:bg-slate-50"
                  onClick={() => setAmountInput(String(amount))}
                >
                  {formatCurrencyCop(amount)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="method" className="block text-sm font-medium">
              Metodo de pago
            </label>
            <select
              id="method"
              name="method"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              className="w-full rounded-lg border px-3 py-2 outline-none ring-slate-300 focus:ring"
            >
              {PAYMENT_METHODS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Procesando..." : "Pagar recarga"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              status === "error"
                ? "bg-red-50 text-red-700"
                : status === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {message}
          </p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Recargas recientes (sesion actual)</h2>
        {receipts.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">
            Aun no has realizado recargas en esta sesion.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {receipts.map((receipt) => (
              <li
                key={receipt.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{formatCurrencyCop(receipt.amount)}</p>
                  <p className="text-gray-500">{formatDate(receipt.createdAt)}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs">
                  {receipt.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
