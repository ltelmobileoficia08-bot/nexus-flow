"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Calendar, Target } from "lucide-react";

export default function ForecastingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demand Forecasting</h1>
        <p className="text-muted-foreground">AI-powered demand predictions and trend analysis</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Forecast Accuracy", value: "94.2%", icon: Target },
          { title: "Next 30 Days", value: "$142,800", icon: Calendar },
          { title: "Trend", value: "Upward", icon: TrendingUp },
          { title: "Data Points", value: "12,450", icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Forecasting engine will be available in Phase 3.</p>
            <p className="text-sm mt-1">AI/ML microservices for demand prediction coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
