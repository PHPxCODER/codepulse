"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface PricingViewProps {
  isPro: boolean;
  proSince?: Date | null;
}

export default function PricingView({ isPro, proSince }: PricingViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Could not process payment request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const features = [
    "Access to all programming languages",
    "Unlimited code executions",
    "Create and share code snippets",
    "Access to premium templates",
    "Enhanced AI code assistant",
    "Early access to new features",
  ];
  
  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get access to all languages and premium features with a one-time payment
        </p>
      </div>
      
      <div className="max-w-md mx-auto bg-card border rounded-xl overflow-hidden shadow-lg">
        {isPro ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You are a Pro user!</h2>
            <p className="text-muted-foreground mb-6">
              You have lifetime access to all premium features
              {proSince && ` since ${new Date(proSince).toLocaleDateString()}`}
            </p>
            <Button onClick={() => router.push("/execute")}>
              Go to Code Editor
            </Button>
          </div>
        ) : (
          <>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
              <div className="flex justify-between items-baseline mb-4">
                <h2 className="text-2xl font-bold">Pro Lifetime Access</h2>
                <div className="text-muted-foreground text-sm">One-time payment</div>
              </div>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-bold">$39</span>
                <span className="text-muted-foreground ml-2">USD</span>
              </div>
              <Button 
                onClick={handleUpgrade} 
                disabled={isLoading} 
                className="w-full" 
                size="lg"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-8">
              <h3 className="font-medium mb-4">What&apos;s included:</h3>
              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}