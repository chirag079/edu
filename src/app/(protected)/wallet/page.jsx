"use client"; // Need client interactivity for form

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  getUserWalletBalance,
  addFundsToWallet,
} from "@/actions/wallet.actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, IndianRupee } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isAddingFunds, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "advertiser"
    ) {
      // Redirect non-advertisers away from wallet page
      toast.error("Access denied. Wallet is for advertisers.");
      router.push("/dashboard");
    } else if (status === "authenticated") {
      setIsLoadingBalance(true);
      getUserWalletBalance(session.user.id)
        .then((fetchedBalance) => {
          setBalance(fetchedBalance);
          setIsLoadingBalance(false);
        })
        .catch((err) => {
          console.error("Failed to fetch balance:", err);
          toast.error("Could not load wallet balance.");
          setIsLoadingBalance(false);
          setBalance(0); // Default to 0 on error
        });
    }
  }, [session, status, router]);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setError("");
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addFundsToWallet(session.user.id, amount);
        if (result.success) {
          toast.success(`₹${amount.toFixed(2)} added successfully!`);
          setBalance(result.newBalance);
          setAmountToAdd(""); // Clear input field
        } else {
          throw new Error(result.message || "Failed to add funds.");
        }
      } catch (err) {
        console.error("Add funds error:", err);
        setError(err.message || "An unexpected error occurred.");
        toast.error(err.message || "Failed to add funds.");
      }
    });
  };

  if (status === "loading" || isLoadingBalance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 text-center">
          Your Wallet
        </h1>

        {/* Balance Card */}
        <Card className="bg-white dark:bg-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-800 dark:text-gray-100">
              <IndianRupee className="h-6 w-6 mr-2 text-green-600" /> Current
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-50">
              ₹{balance !== null ? balance.toFixed(2) : "..."}
            </p>
          </CardContent>
        </Card>

        {/* Add Funds Card */}
        <Card className="bg-white dark:bg-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>
              Enter the amount you wish to add (1 Token = ₹1).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  placeholder="e.g., 500"
                  min="1" // Minimum add amount
                  step="any" // Allow decimals if needed
                  required
                  className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isAddingFunds}>
                {isAddingFunds ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Add Funds to Wallet"
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Note: This is a simulated process. No real payment is required.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* TODO: Transaction History Card */}
        {/* 
        <Card className="bg-white dark:bg-zinc-800 shadow-sm">
           <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
           <CardContent>
               <p className="text-center text-gray-500 dark:text-gray-400">Transaction history coming soon.</p>
                Add table to display transactions from user.wallet.transactions 
           </CardContent>
        </Card>
         */}
      </div>
    </div>
  );
}
