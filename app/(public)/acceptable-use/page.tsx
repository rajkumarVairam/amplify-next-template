import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import LegalPage from "@/app/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: `Acceptable Use Policy for ${siteConfig.name}.`,
};

export default function AcceptableUsePage() {
  const { legal, name } = siteConfig;

  return (
    <LegalPage
      title="Acceptable Use Policy"
      effectiveDate={legal.acceptableUseEffectiveDate}
    >
      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) governs your use of {name} and
        supplements our <a href="/terms">Terms of Service</a>. By using the
        Service, you agree to comply with this AUP.
      </p>

      <h2>1. Prohibited Activities</h2>
      <p>You may not use the Service to:</p>
      <ul>
        <li>
          Violate any applicable local, national, or international law or
          regulation.
        </li>
        <li>
          Transmit any material that is defamatory, offensive, or otherwise
          objectionable.
        </li>
        <li>
          Upload or distribute viruses, malware, or any other malicious code.
        </li>
        <li>
          Attempt to gain unauthorized access to any part of the Service or its
          related systems.
        </li>
        <li>
          Engage in any conduct that restricts or inhibits anyone&apos;s use or
          enjoyment of the Service.
        </li>
        <li>
          Use the Service to send unsolicited communications (spam).
        </li>
        <li>
          Scrape, crawl, or otherwise extract data from the Service in an
          automated manner without our prior written consent.
        </li>
        <li>
          Impersonate any person or entity or misrepresent your affiliation with
          any person or entity.
        </li>
        <li>
          Use the Service for any commercial purpose not expressly permitted by
          our Terms of Service.
        </li>
      </ul>

      <h2>2. Content Standards</h2>
      <p>
        Any content you upload or share through the Service must not:
      </p>
      <ul>
        <li>Contain sexually explicit material.</li>
        <li>Promote violence or discrimination.</li>
        <li>Infringe any intellectual property rights.</li>
        <li>Violate the privacy of any individual.</li>
      </ul>

      <h2>3. Security</h2>
      <p>You must not:</p>
      <ul>
        <li>
          Probe, scan, or test the vulnerability of the Service or any related
          network or system.
        </li>
        <li>
          Breach or circumvent any security or authentication measures.
        </li>
        <li>
          Interfere with the proper working of the Service.
        </li>
      </ul>

      <h2>4. Enforcement</h2>
      <p>
        We reserve the right to investigate violations of this AUP and to take
        appropriate action, including suspending or terminating your account,
        reporting to law enforcement, and pursuing legal remedies.
      </p>

      <h2>5. Reporting Violations</h2>
      <p>
        If you become aware of any violation of this AUP, please report it to{" "}
        <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this AUP from time to time. Continued use of the Service
        after changes constitutes acceptance of the updated policy.
      </p>
    </LegalPage>
  );
}
