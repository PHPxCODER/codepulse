import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import SnippetsView from "./snippets-view";
import { prisma } from "@/lib/prisma";

export default async function SnippetsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  
  // Get snippets from the database
  const snippets = await prisma.snippet.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  // Check if user is Pro
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  
  return <SnippetsView snippets={snippets} isPro={!!user?.isPro} />;
}