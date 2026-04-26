"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("nexusflow_user");
    if (!data) return null;
    try { return JSON.parse(data) as { name: string; email: string; role: string }; }
    catch { return null; }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue={user?.name ?? ""} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={user?.email ?? ""} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <div className="mt-1">
                <Badge>{user?.role ?? "VIEWER"}</Badge>
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Password and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Low stock alerts",
              "Order status updates",
              "Supplier messages",
              "Forecast reports",
            ].map((item) => (
              <label key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{item}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300" />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Application</CardTitle>
            </div>
            <CardDescription>General app settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Currency</label>
              <select className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm mt-1">
                <option>USD ($)</option>
                <option>EUR (&euro;)</option>
                <option>GBP (&pound;)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Timezone</label>
              <select className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm mt-1">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
