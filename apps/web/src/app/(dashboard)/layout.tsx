"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  Truck,
  MessageSquare,
  RotateCcw,
  Settings,
  LogOut,
  ChevronLeft,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "VIEWER";
  organizationId: string | null;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Users },
  { name: "Forecasting", href: "/dashboard/forecasting", icon: TrendingUp },
  { name: "Logistics", href: "/dashboard/logistics", icon: Truck },
  { name: "Negotiations", href: "/dashboard/negotiations", icon: MessageSquare },
  { name: "Returns", href: "/dashboard/returns", icon: RotateCcw },
];

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  MANAGER: "secondary",
  VIEWER: "outline",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [{ user, checked }, setAuthState] = useState(() => {
    if (typeof window === "undefined") {
      return { user: null as User | null, checked: false };
    }
    const token = localStorage.getItem("nexusflow_token");
    const userData = localStorage.getItem("nexusflow_user");
    if (!token || !userData) {
      return { user: null as User | null, checked: true };
    }
    try {
      return { user: JSON.parse(userData) as User, checked: true };
    } catch {
      return { user: null as User | null, checked: true };
    }
  });

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("nexusflow_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    if (checked && !user) {
      router.push("/auth/login");
    }
  }, [checked, user, router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("nexusflow_token");
    localStorage.removeItem("nexusflow_user");
    setAuthState({ user: null, checked: true });
    router.push("/auth/login");
  }, [router]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("nexusflow_sidebar_collapsed", String(next));
      return next;
    });
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen">
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200`}
      >
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <svg
              className="h-5 w-5 text-sidebar-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold">NexusFlow</span>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-2">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>

        <Separator className="bg-sidebar-border" />

        <div className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <Badge
                  variant={roleBadgeVariant[user.role]}
                  className="text-xs mt-0.5"
                >
                  {user.role}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
