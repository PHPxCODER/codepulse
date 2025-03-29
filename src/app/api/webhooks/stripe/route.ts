import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to get raw body
async function getRawBody(req: Request): Promise<Buffer> {
  const reader = req.body?.getReader();
  const chunks: Uint8Array[] = [];
  
  if (!reader) {
    return Buffer.from([]);
  }
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

export async function POST(req: NextRequest) {
  try {
    const body = await getRawBody(req);
    const signature = headers().get("stripe-signature") as string;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }
    
    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.payment_status === "paid" && session.metadata?.userId) {
        // Upgrade user to Pro
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: {
            isPro: true,
            proSince: new Date(),
            stripeCustomerId: session.customer as string,
            stripeSessionId: session.id,
          },
        });
        
        console.log(`🔔 User ${session.metadata.userId} upgraded to Pro`);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}