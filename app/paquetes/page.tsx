"use client";

import { buyPackageApi, getCustomerSummaryApi } from "@/lib/api";
import { RecentMovement } from "@/lib/types";
import { useEffect, useState } from "react";

type SubmitStatus = "idle" | "loading" | "success" | "error";

type PackageOption = {
  code: string;
  title: string;
  description: string;
  price: number;
};

const PACKAGE_CATALOG: PackageOption[] = [
  {
    code: "data_5gb",
    title: "Paquete 5 GB",
    description: "Navegacion adicional para redes, apps y navegacion general.",
    price: 12000,
  },
  {
    code: "voz_100min",
    title: "Paquete Voz 100 min",
    description: "Minutos adicionales para llamadas nacionales.",
    price: 9000,
  },
  {
    code: "combo_full",
    title: "Paquete Combo Full",
    description: "Combinado de datos y voz para uso intensivo.",
    price: 18000,
  },
];

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

export default function PaquetesPage() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [receipts, setReceipts] = useState<RecentMovement[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadBalance() {
      try {
        const summary = await getCustomerSummaryApi();
        if (mounted) {
          setBalance(summary.balance);
        }
      } catch (error) {
        if (mounted) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? `No se pudo cargar el saldo inicial: ${error.message}`
              : "No se pudo cargar el saldo inicial.",
          );
        }
      }
    }

    loadBalance();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleBuy(packageCode: string) {
    setStatus("loading");
    setMessage("Procesando compra...");
    setSelectedCode(packageCode);

    try {
      const response = await buyPackageApi({ packageCode });
      setBalance(response.balance);
      setReceipts((prev) => [response.receipt, ...prev]);
      setStatus("success");
      setMessage("Compra exitosa.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo completar la compra.");
    } finally {
      setSelectedCode(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Paquetes</h1>
        <p className="mt-1 text-gray-600">Compra paquetes adicionales para tu linea.</p>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <p className="text-sm text-gray-500">Saldo disponible</p>
        <p className="mt-2 text-2xl font-bold">
          {balance === null ? "Cargando saldo..." : formatCurrencyCop(balance)}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {PACKAGE_CATALOG.map((pkg) => {
          const isLoadingThis = status === "loading" && selectedCode === pkg.code;
          return (
            <article key={pkg.code} className="rounded-xl border bg-white p-5">
              <h2 className="text-lg font-semibold">{pkg.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{pkg.description}</p>
              <p className="mt-4 text-xl font-bold">{formatCurrencyCop(pkg.price)}</p>
              <button
                type="button"
                onClick={() => handleBuy(pkg.code)}
                disabled={status === "loading"}
                className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingThis ? "Comprando..." : "Comprar"}
              </button>
            </article>
          );
        })}
      </section>

      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
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

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Compras recientes (sesion actual)</h2>
        {receipts.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Aun no has comprado paquetes en esta sesion.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {receipts.map((receipt) => (
              <li
                key={receipt.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{receipt.title}</p>
                  <p className="text-gray-500">{formatDate(receipt.createdAt)}</p>
                </div>
                <p className="font-semibold">- {formatCurrencyCop(receipt.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
