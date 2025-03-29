"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!sessionId) {
      router.push("/pricing");
      return;
    }
    
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments/verify/${sessionId}`);
        const data = await response.json();
        
        setIsSuccess(data.success && data.isPro);
        
        if (data.success && data.isPro) {
          toast({
            title: "Success!",
            description: "Your account has been upgraded to Pro!",
          });
        } else {
          toast({
            title: "Payment is processing",
            description: "Your payment is being processed. We'll update your account shortly.",
          });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Verification error",
          description: "There was an error verifying your payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, [sessionId, router, toast]);
  
  return (
    <div className="container max-w-md py-16">
      <div className="bg-card border rounded-xl p-8 text-center">
        {isVerifying ? (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Verifying your payment...</h1>
            <p className="text-muted-foreground">
              Please wait while we process your payment.
            </p>
          </>
        ) : isSuccess ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thank you for your purchase!</h1>
            <p className="text-muted-foreground mb-6">
              Your account has been upgraded to Pro. You now have access to all premium features.
            </p>
            <Button onClick={() => router.push("/execute")}>
              Start Coding
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Payment is processing</h1>
            <p className="text-muted-foreground mb-6">
              Your payment is being processed. This may take a few moments.
              We&apos;ll update your account as soon as the payment is confirmed.
            </p>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}