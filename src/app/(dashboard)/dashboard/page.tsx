import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Shala",
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to Shala. Your dashboard is coming soon.
      </p>
    </div>
  );
}
