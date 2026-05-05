import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import LegalPage from "@/app/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name}.`,
};

export default function TermsPage() {
  const { legal, name } = siteConfig;

  return (
    <LegalPage title="Terms of Service" effectiveDate={legal.termsEffectiveDate}>
      <p>
        Please read these Terms of Service (&quot;Terms&quot;) carefully before using{" "}
        {name} (&quot;the Service&quot;) operated by {legal.companyName}{" "}
        (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Service, you agree to be bound by these Terms.
        If you disagree with any part of the Terms, you may not access the Service.
      </p>

      <h2>2. Use of the Service</h2>
      <p>
        You may use the Service only for lawful purposes and in accordance with
        these Terms. You agree not to use the Service:
      </p>
      <ul>
        <li>In any way that violates applicable laws or regulations.</li>
        <li>
          To transmit any unsolicited or unauthorized advertising or promotional
          material.
        </li>
        <li>
          To impersonate or attempt to impersonate {legal.companyName}, an
          employee, another user, or any other person or entity.
        </li>
        <li>
          In any way that could disable, overburden, damage, or impair the
          Service.
        </li>
      </ul>

      <h2>3. Accounts</h2>
      <p>
        When you create an account, you must provide accurate and complete
        information. You are responsible for maintaining the confidentiality of
        your account credentials and for all activities that occur under your
        account.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are and
        will remain the exclusive property of {legal.companyName} and its
        licensors. Our trademarks may not be used in connection with any product
        or service without the prior written consent of {legal.companyName}.
      </p>

      <h2>5. User Content</h2>
      <p>
        You retain ownership of any content you submit to the Service. By
        submitting content, you grant us a worldwide, non-exclusive, royalty-free
        license to use, reproduce, and display that content solely for the purpose
        of providing the Service.
      </p>

      <h2>6. Termination</h2>
      <p>
        We may terminate or suspend your account immediately, without prior notice
        or liability, for any reason, including if you breach these Terms. Upon
        termination, your right to use the Service will immediately cease.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, {legal.companyName} shall not be
        liable for any indirect, incidental, special, consequential, or punitive
        damages resulting from your use of or inability to use the Service.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without
        any warranties of any kind, either express or implied.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws
        of the State of California, without regard to its conflict of law
        provisions.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will provide
        notice of significant changes by updating the effective date at the top of
        this page. Your continued use of the Service after changes constitutes
        acceptance of the new Terms.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        If you have questions about these Terms, please contact us at{" "}
        <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> or at:
      </p>
      <p>{legal.companyAddress}</p>
    </LegalPage>
  );
}
