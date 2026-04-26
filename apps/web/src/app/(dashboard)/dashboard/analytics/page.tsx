"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getKpis,
  getSupplierPerformance,
  getInventoryTurnover,
  getCashFlow,
  type KpiSummary,
  type SupplierPerformance,
  type InventoryTurnover,
  type CashFlowTrends,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  BarChart3,
  Package,
  DollarSign,
  Star,
  Truck,
  AlertTriangle,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type TabKey = "overview" | "suppliers" | "inventory" | "cashflow";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
  const [inventory, setInventory] = useState<InventoryTurnover[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowTrends | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    Promise.all([
      getKpis(token),
      getSupplierPerformance(token),
      getInventoryTurnover(token),
      getCashFlow(token),
    ])
      .then(([k, s, i, c]) => {
        setKpis(k);
        setSuppliers(s);
        setInventory(i);
        setCashFlow(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = useCallback(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    window.open(`${apiUrl}/analytics/export`, "_blank");
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "KPI Overview" },
    { key: "suppliers", label: "Supplier Performance" },
    { key: "inventory", label: "Inventory Turnover" },
    { key: "cashflow", label: "Cash Flow" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">
            KPI tracking, performance metrics, and exportable reports
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && kpis && <KpiOverview kpis={kpis} />}
      {tab === "suppliers" && <SupplierTab suppliers={suppliers} />}
      {tab === "inventory" && <InventoryTab inventory={inventory} />}
      {tab === "cashflow" && cashFlow && <CashFlowTab cashFlow={cashFlow} />}
    </div>
  );
}

function KpiOverview({ kpis }: { kpis: KpiSummary }) {
  const cards = [
    {
      title: "Total Inventory Value",
      value: `$${kpis.totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: `${kpis.totalProducts} products`,
      icon: Package,
    },
    {
      title: "Total Order Value",
      value: `$${kpis.totalOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: `${kpis.totalOrders} orders`,
      icon: DollarSign,
    },
    {
      title: "Avg Order Value",
      value: `$${kpis.avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: `${kpis.totalItemsOrdered.toLocaleString()} items ordered`,
      icon: TrendingUp,
    },
    {
      title: "Fulfillment Rate",
      value: `${kpis.fulfillmentRate}%`,
      subtitle: `${kpis.deliveredOrders} of ${kpis.totalOrders} delivered`,
      icon: Truck,
    },
    {
      title: "Avg Supplier Rating",
      value: kpis.avgSupplierRating.toFixed(1),
      subtitle: `${kpis.totalSuppliers} active suppliers`,
      icon: Star,
    },
    {
      title: "Stock Alerts",
      value: String(kpis.lowStockCount),
      subtitle: `${kpis.outOfStockCount} out of stock`,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs mt-1 text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SupplierTab({ suppliers }: { suppliers: SupplierPerformance[] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance Metrics</CardTitle>
          <CardDescription>
            Fulfillment rates, spend analysis, and delivery performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Supplier</th>
                  <th className="pb-3 font-medium text-center">Rating</th>
                  <th className="pb-3 font-medium text-center">Orders</th>
                  <th className="pb-3 font-medium text-right">Total Spend</th>
                  <th className="pb-3 font-medium text-right">Avg Order</th>
                  <th className="pb-3 font-medium text-center">Fulfillment</th>
                  <th className="pb-3 font-medium text-center">On-Time</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {s.rating?.toFixed(1) ?? "N/A"}
                      </span>
                    </td>
                    <td className="py-3 text-center">{s.totalOrders}</td>
                    <td className="py-3 text-right">
                      ${s.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right">
                      ${s.avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        variant={
                          s.fulfillmentRate >= 80
                            ? "outline"
                            : s.fulfillmentRate >= 50
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {s.fulfillmentRate}%
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        variant={
                          s.onTimeDelivery >= 80
                            ? "outline"
                            : s.onTimeDelivery >= 50
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {s.onTimeDelivery}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InventoryTab({ inventory }: { inventory: InventoryTurnover[] }) {
  const healthColors: Record<string, string> = {
    critical: "destructive",
    low: "destructive",
    optimal: "outline",
    overstock: "secondary",
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventory.reduce((s, i) => s + i.stockValue, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Turnover Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.length > 0
                ? (inventory.reduce((s, i) => s + i.turnoverRate, 0) / inventory.length).toFixed(2)
                : "0"}x
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {inventory.filter((i) => i.stockHealth === "critical" || i.stockHealth === "low").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overstock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter((i) => i.stockHealth === "overstock").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Turnover Analysis</CardTitle>
          <CardDescription>Stock health, turnover rates, and days of supply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium text-center">Stock</th>
                  <th className="pb-3 font-medium text-right">Value</th>
                  <th className="pb-3 font-medium text-center">Sold</th>
                  <th className="pb-3 font-medium text-center">Turnover</th>
                  <th className="pb-3 font-medium text-center">Days Supply</th>
                  <th className="pb-3 font-medium text-center">Health</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.sku}</div>
                    </td>
                    <td className="py-3 text-center">{item.currentStock.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      ${item.stockValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-center">{item.totalSold.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        {item.turnoverRate > 1 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                        )}
                        {item.turnoverRate}x
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {item.daysOfSupply >= 999 ? "N/A" : `${item.daysOfSupply}d`}
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        variant={
                          (healthColors[item.stockHealth] as "destructive" | "outline" | "secondary") ?? "outline"
                        }
                      >
                        {item.stockHealth}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CashFlowTab({ cashFlow }: { cashFlow: CashFlowTrends }) {
  const maxSpend = Math.max(...cashFlow.monthlyTrends.map((m) => m.totalSpend), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cashFlow.summary.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cashFlow.summary.avgMonthlySpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashFlow.summary.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Months Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashFlow.summary.monthsCovered}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Procurement Spend</CardTitle>
          <CardDescription>Purchase order spending trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cashFlow.monthlyTrends.map((m) => (
              <div key={m.month} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium shrink-0">{m.month}</div>
                <div className="flex-1">
                  <div className="h-8 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full rounded bg-primary transition-all"
                      style={{ width: `${(m.totalSpend / maxSpend) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-28 text-right text-sm font-medium shrink-0">
                  ${m.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <div className="w-16 text-right text-xs text-muted-foreground shrink-0">
                  {m.orderCount} orders
                </div>
              </div>
            ))}
            {cashFlow.monthlyTrends.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No spending data available yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
