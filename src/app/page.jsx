import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Home, // For flats/housing
  Calendar, // For events
  UtensilsCrossed, // For restaurants/food
  ShoppingBag, // General marketplace icon
  GraduationCap, // Represents student focus
  ArrowRight,
  BookMarked, // Alternate for books/stationary
  Search, // Icon for Find step
  Users, // Icon for Connect step
  CheckCircle, // Icon for Engage/Transact step
} from "lucide-react";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getApprovedListings,
  getApprovedEvents,
  getApprovedRestaurants,
} from "@/actions/listing.actions";
import ItemCard from "@/components/ItemCard";
import SSRLoader from "@/components/SSRLoader";

// --- Data Display Component ---
async function ApprovedItemsDisplay() {
  const [latestListings, upcomingEvents, featuredRestaurants] =
    await Promise.all([
      getApprovedListings(4),
      getApprovedEvents(4),
      getApprovedRestaurants(4),
    ]);

  // Use standard Card for sections
  const SectionCard = ({ title, children }) => (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  if (
    latestListings.length === 0 &&
    upcomingEvents.length === 0 &&
    featuredRestaurants.length === 0
  ) {
    return (
      <div className="text-center py-16 rounded-lg border border-dashed border-border bg-muted/50">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          No items available right now.
        </p>
        <p className="text-sm text-muted-foreground/80">
          Check back later for new listings, events, and restaurants!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {latestListings.length > 0 && (
        <SectionCard title="Featured Items">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {latestListings.map((item) => (
              <ItemCard key={`listing-${item.id}`} item={item} />
            ))}
          </div>
        </SectionCard>
      )}

      {upcomingEvents.length > 0 && (
        <SectionCard title="Upcoming Events">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {upcomingEvents.map((item) => (
              <ItemCard key={`event-${item.id}`} item={item} />
            ))}
          </div>
        </SectionCard>
      )}

      {featuredRestaurants.length > 0 && (
        <SectionCard title="Featured Restaurants">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredRestaurants.map((item) => (
              <ItemCard key={`restaurant-${item.id}`} item={item} />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// --- Feature Card Component ---
const FeatureCard = ({ icon: Icon, title, description }) => (
  // Use standard card bg and border
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

// --- How It Works Step Component ---
const HowItWorksStep = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center gap-2">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// --- Main Landing Page Component ---
export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    if (session) {
      return redirect("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section - Simpler background, adaptable text/buttons */}
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
                  {/* Use standard button variants */}
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

      {/* Features Section - Use muted background */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-muted/50 border-b border-border">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 text-foreground">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* FeatureCards remain largely the same, relying on theme variables */}
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

      {/* How It Works Section - NEW */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-background border-b border-border">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <HowItWorksStep
              icon={Search}
              title="1. Find What You Need"
              description="Browse listings for housing, essentials, events, or local restaurants using our easy search and filters."
            />
            <HowItWorksStep
              icon={Users}
              title="2. Connect Easily"
              description="Contact sellers or event organizers directly through the platform to ask questions or express interest."
            />
            <HowItWorksStep
              icon={CheckCircle}
              title="3. Engage & Transact"
              description="Attend events, meet sellers, or visit restaurants. Securely manage your campus life essentials."
            />
          </div>
        </div>
      </section>

      {/* Approved Items Section - Use background */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 text-foreground">
            Latest Arrivals
          </h2>
          <Suspense
            fallback={
              <div className="flex justify-center items-center min-h-[200px]">
                <SSRLoader />
              </div>
            }
          >
            {/* ApprovedItemsDisplay uses standard Card now */}
            <ApprovedItemsDisplay />
          </Suspense>
        </div>
      </section>

      {/* Call to Action Section - NEW */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-background border-t border-border">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-foreground mb-4">
            Ready to Join Your Campus Community?
          </h2>
          <p className="max-w-[600px] mx-auto text-muted-foreground md:text-lg mb-8">
            Sign up today to start exploring listings, events, and connect with
            fellow students.
          </p>
          {!session && (
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/search">Browse Listings</Link>
              </Button>
            </div>
          )}
          {session && session.user.role !== "admin" && (
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Your Dashboard</Link>
            </Button>
          )}
          {session && session.user.role === "admin" && (
            <Button size="lg" asChild>
              <Link href="/admin">Go to Admin Dashboard</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer - Use standard border and text color */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} EduStation. All rights reserved.
      </footer>
    </main>
  );
}
