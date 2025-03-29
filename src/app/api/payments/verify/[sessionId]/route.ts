import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }
    
    const stripeSession = await stripe.checkout.sessions.retrieve(
      params.sessionId
    );
    
    if (stripeSession.payment_status === "paid") {
      // Double-check user is marked as Pro
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      
      if (!user?.isPro && stripeSession.metadata?.userId === session.user.id) {
        // Update user to Pro if not already
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            isPro: true,
            proSince: new Date(),
            stripeCustomerId: stripeSession.customer as string,
            stripeSessionId: stripeSession.id,
          },
        });
      }
      
      return NextResponse.json({ success: true, isPro: true });
    }
    
    return NextResponse.json({ 
      success: false, 
      isPro: false,
      status: stripeSession.payment_status 
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}