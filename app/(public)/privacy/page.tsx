import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import LegalPage from "@/app/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  const { legal, name } = siteConfig;

  return (
    <LegalPage title="Privacy Policy" effectiveDate={legal.privacyEffectiveDate}>
      <p>
        {legal.companyName} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates {name}. This
        Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you use our Service.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>Information you provide directly</h3>
      <ul>
        <li>
          <strong>Account information</strong> — email address when you register.
        </li>
        <li>
          <strong>Profile information</strong> — display name, bio, and avatar
          image that you choose to provide.
        </li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Usage data</strong> — pages visited, features used, and
          timestamps of interactions.
        </li>
        <li>
          <strong>Device information</strong> — browser type, operating system,
          and IP address.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, operate, and maintain the Service.</li>
        <li>Authenticate your identity and secure your account.</li>
        <li>Personalize your experience (theme preference, display name).</li>
        <li>Send transactional emails (password reset, account notifications).</li>
        <li>Improve and develop new features.</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>3. Data Storage and Security</h2>
      <p>
        Your data is stored on AWS infrastructure (Amazon Cognito, DynamoDB, and
        S3) in the United States. We implement industry-standard security measures
        including encryption at rest and in transit, and owner-based access
        controls so only you can read or modify your own data.
      </p>

      <h2>4. Data Sharing</h2>
      <p>
        We do not sell your personal information. We may share data with:
      </p>
      <ul>
        <li>
          <strong>Service providers</strong> — AWS for infrastructure. These
          providers are contractually obligated to protect your data.
        </li>
        <li>
          <strong>Legal requirements</strong> — when required by law or to protect
          our rights.
        </li>
      </ul>

      <h2>5. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your data.</li>
        <li>Object to or restrict processing of your data.</li>
        <li>Data portability.</li>
      </ul>
      <p>
        To exercise these rights, contact us at{" "}
        <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use cookies and similar tracking technologies. See our{" "}
        <a href="/cookies">Cookie Policy</a> for details.
      </p>

      <h2>7. Children&apos;s Privacy</h2>
      <p>
        The Service is not directed to children under 13. We do not knowingly
        collect personal information from children under 13. If you believe we
        have inadvertently collected such information, please contact us
        immediately.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of significant changes by updating the effective date and, where
        appropriate, by email.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For privacy-related questions, contact us at{" "}
        <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.
      </p>
      <p>{legal.companyAddress}</p>
    </LegalPage>
  );
}
