// src/app/execute/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import ExecuteCodeView from "@/components/execute-code/ExecuteCodeView";

export default async function ExecutePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <ExecuteCodeView />;
}