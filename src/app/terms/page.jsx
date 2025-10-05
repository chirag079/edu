import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-3xl mx-auto dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
            Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-4">
          <p>Last Updated: [Insert Date]</p>

          <p>
            Welcome to EduStation! These &quot;Terms&quot; govern your access to
            and use of the EduStation website, services, and applications
            (collectively, the &quot;Platform&quot;). Please read these Terms
            carefully.
          </p>

          <h3 className="text-xl font-semibold">1. Acceptance of Terms</h3>
          <p>
            By accessing or using the Platform, you agree to be bound by these
            Terms and our Privacy Policy. If you do not agree, do not use the
            Platform.
          </p>

          <h3 className="text-xl font-semibold">2. Eligibility</h3>
          <p>
            You must be a student or affiliated member of one of the supported
            colleges (NSUT, DTU, IPU) and at least [Insert Minimum Age, e.g.,
            18] years old to use the Platform.
          </p>

          <h3 className="text-xl font-semibold">3. User Accounts</h3>
          <p>
            You are responsible for maintaining the confidentiality of your
            account information and for all activities that occur under your
            account. You must provide accurate and complete information during
            registration and profile completion.
          </p>

          <h3 className="text-xl font-semibold">4. User Roles</h3>
          <p>
            Users can register as &quot;Explorers&quot; or
            &quot;Advertisers.&quot; Advertisers may list items/services
            according to our guidelines and pricing. Explorers may browse and
            interact with listings. Administrators (&quot;Admins&quot;) oversee
            the platform.
          </p>

          <h3 className="text-xl font-semibold">5. Listing and Advertising</h3>
          <ul>
            <li>
              Advertisers are responsible for the accuracy and legality of their
              listings.
            </li>
            <li>
              All listings are subject to review and approval by Admins. We
              reserve the right to reject or remove listings that violate our
              policies or are deemed inappropriate.
            </li>
            <li>
              Advertising fees are charged via the wallet system based on the
              item type (Books/Stationary: 10% of MRP or ₹20, whichever is
              higher; Flat/PG/Restaurant/Event: ₹100/month). Fees are
              non-refundable once a listing is approved.
            </li>
            <li>
              Listings for certain categories (Flat/PG, Restaurant, Event) are
              time-bound (currently one month).
            </li>
          </ul>

          <h3 className="text-xl font-semibold">6. Wallet System</h3>
          <ul>
            <li>
              Advertisers must maintain a positive balance in their wallet to
              pay for listing fees.
            </li>
            <li>Wallet tokens are purchased at a rate of 1 token = ₹1.</li>
            <li>
              Wallet funds are non-transferable and typically non-refundable,
              except in specific circumstances determined by us.
            </li>
          </ul>

          <h3 className="text-xl font-semibold">7. User Conduct</h3>
          <p>
            You agree not to use the Platform for any unlawful purpose or in any
            way that could harm the Platform or other users. Prohibited
            activities include posting false information, spamming, harassment,
            and attempting to circumvent fees or security measures.
          </p>

          <h3 className="text-xl font-semibold">8. Disclaimers</h3>
          <p>
            The Platform is provided &quot;as is.&quot; We do not guarantee the
            accuracy, completeness, or reliability of any listings or user
            content. Transactions are solely between users; EduStation is not a
            party to these transactions.
          </p>

          <h3 className="text-xl font-semibold">9. Limitation of Liability</h3>
          <p>
            EduStation will not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of your use of the
            Platform.
          </p>

          <h3 className="text-xl font-semibold">10. Modifications to Terms</h3>
          <p>
            We reserve the right to modify these Terms at any time. We will
            provide notice of significant changes. Your continued use of the
            Platform after changes constitutes acceptance.
          </p>

          <h3 className="text-xl font-semibold">11. Governing Law</h3>
          <p>
            These Terms shall be governed by the laws of [Insert Jurisdiction,
            e.g., India].
          </p>

          <h3 className="text-xl font-semibold">12. Contact</h3>
          <p>
            For questions about these Terms, please contact us at [Insert
            Contact Email/Method].
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
