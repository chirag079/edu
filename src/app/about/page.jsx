import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-3xl mx-auto dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
            About EduStation
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-4">
          <p>
            Welcome to EduStation, the premier marketplace connecting students
            within the college community!
          </p>
          <p>
            Our mission is to provide a seamless and trustworthy platform where
            students can easily advertise and discover essential items and
            services right on campus or nearby. Whether you&apos;re looking for
            textbooks, stationary, accommodation like flats or PGs, great
            restaurant deals, or exciting local events, EduStation is your
            one-stop shop.
          </p>
          <h3 className="text-xl font-semibold">For Advertisers:</h3>
          <p>
            Reach your target audience directly! List your books, stationary,
            flats, PGs, restaurant offers, or events quickly and easily. Our
            platform uses a fair wallet-based system for advertising costs,
            ensuring transparency and affordability.
          </p>
          <h3 className="text-xl font-semibold">For Explorers:</h3>
          <p>
            Find exactly what you need within your college network. Browse
            listings specific to your college, read reviews (coming soon!), and
            connect directly with advertisers through our integrated chat
            feature (coming soon!).
          </p>
          <p>
            EduStation aims to foster a stronger, more connected campus
            community by facilitating easy exchange and discovery. Join us
            today!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
