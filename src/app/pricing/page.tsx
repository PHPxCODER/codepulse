import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PricingView from "./pricing-view";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  
  // Check if user already has Pro access
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, proSince: true },
  });
  
  return <PricingView isPro={!!user?.isPro} proSince={user?.proSince} />;
}