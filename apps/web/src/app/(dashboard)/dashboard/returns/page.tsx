"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Returns Management</h1>
        <p className="text-muted-foreground">Track and manage product returns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Pending Returns", value: "3", icon: Clock },
          { title: "Processed", value: "12", icon: CheckCircle2 },
          { title: "Disputed", value: "1", icon: AlertTriangle },
          { title: "Return Rate", value: "2.3%", icon: RotateCcw },
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
          <CardTitle>Returns Processing</CardTitle>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <RotateCcw className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Returns management module will be fully activated in Phase 4.</p>
            <p className="text-sm mt-1">Automated returns processing and supplier credits coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
