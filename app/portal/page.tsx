"use client";

import { getCustomerSummaryApi } from "@/lib/api";
import { CustomerSummary } from "@/lib/types";
import { useEffect, useState } from "react";

function formatCurrencyCop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

export default function PortalPage() {
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const data = await getCustomerSummaryApi();
        if (mounted) {
          setSummary(data);
          setError("");
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar");
        }
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="rounded-lg bg-red-50 p-3 text-red-700">
          Error cargando el resumen: {error}
        </p>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="rounded-lg bg-slate-100 p-3 text-slate-700">
          Cargando resumen del cliente...
        </p>
      </main>
    );
  }

  const dataRemaining = Math.max(summary.dataLimitGb - summary.dataUsedGb, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Portal del cliente</h1>
        <p className="mt-1 text-gray-600">
          Hola {summary.customerName}, este es el resumen de tu cuenta.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Saldo disponible</p>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrencyCop(summary.balance)}
          </p>
        </article>

        <article className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Plan actual</p>
          <p className="mt-2 text-xl font-semibold">{summary.planName}</p>
          <p className="text-sm text-gray-600">
            {formatCurrencyCop(summary.planPrice)}/mes
          </p>
        </article>

        <article className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Consumo de datos</p>
          <p className="mt-2 text-xl font-semibold">
            {summary.dataUsedGb} GB / {summary.dataLimitGb} GB
          </p>
          <p className="text-sm text-gray-600">Te quedan {dataRemaining} GB</p>
        </article>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Lineas asociadas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">MSISDN</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Plan</th>
              </tr>
            </thead>
            <tbody>
              {summary.lines.map((line) => (
                <tr key={line.id} className="border-b last:border-b-0">
                  <td className="py-2">{line.msisdn}</td>
                  <td className="py-2 capitalize">{line.status}</td>
                  <td className="py-2">{line.planName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Ultimos movimientos</h2>
        <ul className="space-y-2">
          {summary.recentMovements.map((movement) => (
            <li
              key={movement.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div>
                <p className="font-medium">{movement.title}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(movement.createdAt)}
                </p>
              </div>
              <p className="font-semibold">
                - {formatCurrencyCop(movement.amount)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
