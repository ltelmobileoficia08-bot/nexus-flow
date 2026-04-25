"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardStats, type DashboardStats } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    getDashboardStats(token)
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading dashboard...</div>;
  }

  const statCards = [
    {
      title: "Inventory Value",
      value: `$${stats.inventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.productCount} products tracked`,
      icon: Package,
    },
    {
      title: "Pending Orders",
      value: String(stats.pendingOrders),
      subtitle: `${stats.totalOrders} total orders`,
      icon: Truck,
    },
    {
      title: "Active Suppliers",
      value: String(stats.activeSuppliers),
      subtitle: "Partner network",
      icon: Users,
    },
    {
      title: "Order Value",
      value: `$${stats.totalOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: "All-time purchase volume",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supply Chain Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your supply chain health at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs mt-1 text-muted-foreground">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>
              Real-time stock level notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alerts.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  All inventory levels are healthy.
                </p>
              )}
              {stats.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {alert.type === "critical" || alert.type === "low_stock" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  ) : alert.type === "overstock" ? (
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Stock: {alert.currentStock} · Reorder: {alert.reorderPoint} · Safety: {alert.safetyStock}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.type === "critical"
                        ? "destructive"
                        : alert.type === "low_stock"
                          ? "destructive"
                          : alert.type === "overstock"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {alert.type === "critical"
                      ? "Critical"
                      : alert.type === "low_stock"
                        ? "Low Stock"
                        : alert.type === "overstock"
                          ? "Overstock"
                          : "Optimal"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common supply chain operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Create Purchase Order", desc: "Draft a new PO for suppliers", href: "/dashboard/orders" },
                { title: "View Inventory", desc: "Manage product stock levels", href: "/dashboard/inventory" },
                { title: "Manage Suppliers", desc: "View and edit supplier info", href: "/dashboard/suppliers" },
                { title: "View All Orders", desc: "Track order statuses", href: "/dashboard/orders" },
              ].map((action) => (
                <button
                  key={action.title}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-start rounded-lg border p-4 text-left hover:bg-accent transition-colors"
                >
                  <span className="font-medium text-sm">{action.title}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {action.desc}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
