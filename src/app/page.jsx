// src/app/page.jsx

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Calendar, UtensilsCrossed, GraduationCap, ArrowRight, BookMarked, Search, Users, CheckCircle } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// --- Feature Card Component ---
const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="bg-card border-border hover:border-primary transition-colors duration-200 shadow-sm">
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      <div className="bg-primary/10 p-2 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <CardTitle className="text-lg font-semibold text-card-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// --- Main Landing Page Component ---
export default async function LandingPage() {
  const session = await auth();

  // Redirect logic for signed-in users
  if (session?.user?.role !== "admin") {
    if (session) {
      return redirect("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/50 border-b border-border">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
              <GraduationCap className="inline-block w-4 h-4 mr-1" />
              For Students, By Students
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-foreground">
              Your Campus Connection Hub
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Find student housing, buy/sell stationary, discover local events,
              and grab deals at nearby restaurants – all in one place.
            </p>
            <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center pt-4">
              {!session && (
                <>
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                </>
              )}
              {session?.user?.role === "admin" && (
                <Button size="lg" asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-muted/50 border-b border-border">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 text-foreground">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Home}
              title="Student Housing"
              description="Find flats, PGs, and shared accommodations near campus."
            />
            <FeatureCard
              icon={BookMarked}
              title="Stationary & More"
              description="Buy and sell textbooks, notes, lab coats, and other essentials."
            />
            <FeatureCard
              icon={Calendar}
              title="Campus Events"
              description="Discover workshops, club activities, fests, and local happenings."
            />
            <FeatureCard
              icon={UtensilsCrossed}
              title="Local Deals"
              description="Explore nearby restaurants and cafes offering student discounts."
            />
          </div>
        </div>
      </section>

      {/* Placeholders for future sections */}
      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-background border-b border-border">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 text-foreground">
            How It Works
          </h2>
          {/* Content for this section will be added in a later commit */}
        </div>
      </section>

      {/* Approved Items Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 text-foreground">
            Latest Arrivals
          </h2>
          {/* Content for this section will be added in a later commit */}
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-background border-t border-border">
        <div className="container px-4 md:px-6">
           {/* Content for this section will be added in a later commit */}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} EduStation. All rights reserved.
      </footer>
    </main>
  );
}