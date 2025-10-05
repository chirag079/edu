import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-3xl mx-auto dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-4">
          <p>Last Updated: [Insert Date]</p>

          <p>
            EduStation (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you use our platform.
          </p>

          <h3 className="text-xl font-semibold">Information We Collect</h3>
          <p>
            We may collect personal information that you provide directly to us,
            such as:
          </p>
          <ul>
            <li>
              Account Information: Name, username, email, password, college,
              role (explorer/advertiser).
            </li>
            <li>
              Profile Information: Phone number, address, city, state, country,
              bio, profile picture (optional).
            </li>
            <li>
              Listing Information: Details about items or services you advertise
              (title, description, type, price/rent, etc.).
            </li>
            <li>
              Transaction Information: Wallet balance changes, advertising fees
              paid (we do not store full payment card details).
            </li>
            <li>
              Communications: Messages sent through our platform (feature coming
              soon).
            </li>
            <li>
              Usage Data: Information about how you interact with the platform
              (log data, device information - collected automatically).
            </li>
          </ul>

          <h3 className="text-xl font-semibold">How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain the EduStation platform.</li>
            <li>Create and manage your account and profile.</li>
            <li>Process transactions and manage your wallet.</li>
            <li>Display listings relevant to your college.</li>
            <li>
              Facilitate communication between users (feature coming soon).
            </li>
            <li>Improve and personalize the platform.</li>
            <li>Communicate with you, including for support and updates.</li>
            <li>Enforce our terms and policies and ensure security.</li>
          </ul>

          <h3 className="text-xl font-semibold">Sharing Your Information</h3>
          <p>
            We do not sell your personal information. We may share information
            in the following limited circumstances:
          </p>
          <ul>
            <li>
              With other users as necessary to facilitate transactions or
              communication (e.g., advertiser contact info might be visible on a
              listing).
            </li>
            <li>
              With service providers who perform services on our behalf (e.g.,
              hosting, image storage), under confidentiality agreements.
            </li>
            <li>If required by law or to protect rights and safety.</li>
            <li>
              In connection with a business transfer (e.g., merger or
              acquisition).
            </li>
          </ul>

          <h3 className="text-xl font-semibold">Data Security</h3>
          <p>
            We implement reasonable security measures to protect your
            information, but no system is completely secure.
          </p>

          <h3 className="text-xl font-semibold">Your Choices</h3>
          <p>
            You can review and update your profile information through your
            account settings. You may have other rights depending on your
            location.
          </p>

          <h3 className="text-xl font-semibold">Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new policy on this page.
          </p>

          <h3 className="text-xl font-semibold">Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at [Insert Contact Email/Method].
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
