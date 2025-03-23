// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { ThemeProvider } from "@/components/theme-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <ThemeProvider attribute={"class"}>
    <div className="h-screen flex flex-col">
      <Header user={session.user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
    </ThemeProvider>
  );
}