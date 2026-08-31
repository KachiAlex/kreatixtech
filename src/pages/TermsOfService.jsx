import React from 'react';
import SEO from '../components/SEO';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-paper pt-32 pb-20 px-6 lg:px-14">
      <SEO title="Terms of Service" noindex />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-ink mb-8">Terms of Service</h1>
        <p className="text-sm text-ink/50 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none text-ink/80 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Kreatix Technologies' website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">2. Description of Services</h2>
            <p>Kreatix Technologies provides software development, cybersecurity (VAPT), and cloud services. Specific service offerings are described on our website and may be further detailed in individual service agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 18 years old to create an account.</li>
              <li>One person or entity may not maintain multiple accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the services</li>
              <li>Upload malicious files, malware, or viruses</li>
              <li>Scrape, copy, or distribute content without authorization</li>
              <li>Use the services to send spam or unsolicited communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">5. Intellectual Property</h2>
            <p>All content, features, and functionality of the services, including but not limited to text, graphics, logos, and software, are owned by Kreatix Technologies and are protected by intellectual property laws. Client-owned data uploaded to the platform remains the property of the client.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">6. Confidentiality</h2>
            <p>Both parties agree to maintain the confidentiality of any sensitive information shared during the course of service delivery, including assessment results, vulnerability reports, and proprietary data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">7. Service Level and Availability</h2>
            <p>We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We are not liable for downtime caused by factors beyond our control, including third-party service outages.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Kreatix Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">9. Termination</h2>
            <p>We may terminate or suspend your account at any time, with or without cause or notice. Upon termination, your right to use the services ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">10. Governing Law</h2>
            <p>These terms are governed by the laws of the jurisdiction in which Kreatix Technologies is registered, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">11. Changes to Terms</h2>
            <p>We may update these Terms of Service at any time. Continued use of the services after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">12. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@kreatixtech.com" className="text-orange hover:underline">legal@kreatixtech.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
