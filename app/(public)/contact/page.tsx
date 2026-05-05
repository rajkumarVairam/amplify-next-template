import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team.`,
};

export default function ContactPage() {
  const { legal, name } = siteConfig;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Get in touch</h1>
        <p className={styles.subtitle}>
          We&apos;d love to hear from you. Send us a message and we&apos;ll respond as
          soon as possible.
        </p>

        <div className={styles.grid}>
          {/* Contact details */}
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <h2 className={styles.detailHeading}>General enquiries</h2>
              <a href={`mailto:${legal.supportEmail}`} className={styles.detailLink}>
                {legal.supportEmail}
              </a>
            </div>
            <div className={styles.detailItem}>
              <h2 className={styles.detailHeading}>Legal &amp; privacy</h2>
              <a href={`mailto:${legal.contactEmail}`} className={styles.detailLink}>
                {legal.contactEmail}
              </a>
            </div>
            <div className={styles.detailItem}>
              <h2 className={styles.detailHeading}>Address</h2>
              <address className={styles.address}>
                {legal.companyName}
                <br />
                {legal.companyAddress}
              </address>
            </div>
          </div>

          {/* Contact form — static HTML, wire up to your preferred form backend */}
          <form className={styles.form} action="#" method="POST">
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className={styles.input}
                placeholder="Your name"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={styles.input}
                placeholder="you@example.com"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="subject" className={styles.label}>Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className={styles.input}
                placeholder="How can we help?"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="message" className={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className={styles.textarea}
                placeholder={`Tell us more about your question or feedback about ${name}…`}
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              Send message
            </button>
            <p className={styles.formNote}>
              We typically respond within one business day.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
