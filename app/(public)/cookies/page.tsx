import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import LegalPage from "@/app/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Cookie Policy for ${siteConfig.name}.`,
};

export default function CookiesPage() {
  const { legal, name } = siteConfig;

  return (
    <LegalPage title="Cookie Policy" effectiveDate={legal.cookiesEffectiveDate}>
      <p>
        This Cookie Policy explains how {legal.companyName} uses cookies and
        similar technologies when you visit {name}.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device by a website. They are
        widely used to make websites work efficiently and to provide information
        to website owners.
      </p>

      <h2>2. Cookies We Use</h2>

      <h3>Strictly necessary cookies</h3>
      <p>
        These cookies are essential for the Service to function. They include
        session tokens issued by Amazon Cognito to maintain your authenticated
        session. You cannot opt out of these cookies while using the Service.
      </p>

      <h3>Preference cookies</h3>
      <p>
        We store your theme preference (light or dark) and notification settings
        in browser local storage so your preferences persist between sessions.
      </p>

      <h3>Analytics cookies</h3>
      <p>
        We may use analytics tools to understand how users interact with the
        Service. These cookies collect aggregated, anonymized data. You can opt
        out via your browser settings.
      </p>

      <h2>3. Managing Cookies</h2>
      <p>
        Most browsers allow you to control cookies through their settings. You
        can typically:
      </p>
      <ul>
        <li>View cookies stored on your device.</li>
        <li>Delete all or specific cookies.</li>
        <li>Block cookies from specific or all websites.</li>
      </ul>
      <p>
        Note that blocking strictly necessary cookies will prevent you from
        signing in to the Service.
      </p>

      <h2>4. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Changes will be
        reflected by updating the effective date above.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        Questions about our use of cookies? Contact us at{" "}
        <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
