"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import type { SessionUser } from "@/types/api";

const previewUser: SessionUser = {
  id: "user-demo",
  email: "demo@example.com",
  displayName: "Demo User",
  teamIds: ["team-product"],
};

export function AppShell(): JSX.Element {
  return <DashboardPage user={previewUser} />;
}
