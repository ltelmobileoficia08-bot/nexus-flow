"use client";

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
  TrendingUp,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Inventory Value",
    value: "$284,520",
    change: "+4.3%",
    trend: "up" as const,
    icon: Package,
  },
  {
    title: "Pending Orders",
    value: "23",
    change: "-2",
    trend: "down" as const,
    icon: Truck,
  },
  {
    title: "Active Negotiations",
    value: "7",
    change: "+3",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "Monthly Savings",
    value: "$12,340",
    change: "+18.2%",
    trend: "up" as const,
    icon: DollarSign,
  },
];

const alerts = [
  {
    type: "stockout" as const,
    message: "SKU-4521 (Wireless Earbuds) below reorder point",
    severity: "critical",
  },
  {
    type: "overstock" as const,
    message: "SKU-1287 (Phone Cases) overstock detected",
    severity: "warning",
  },
  {
    type: "optimal" as const,
    message: "SKU-8903 (USB Cables) inventory at optimal level",
    severity: "success",
  },
  {
    type: "stockout" as const,
    message: "SKU-3344 (Screen Protectors) below safety stock",
    severity: "critical",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supply Chain Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your supply chain health at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs mt-1 ${
                  stat.trend === "up"
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                {stat.change} from last month
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
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {alert.severity === "critical" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  ) : alert.severity === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "warning"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {alert.type === "stockout"
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
                { title: "Create Purchase Order", desc: "Draft a new PO for suppliers" },
                { title: "Run Demand Forecast", desc: "Generate 30-day predictions" },
                { title: "Compare Shipping Rates", desc: "Find optimal carriers" },
                { title: "Start Negotiation", desc: "AI-powered supplier talks" },
              ].map((action) => (
                <button
                  key={action.title}
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
