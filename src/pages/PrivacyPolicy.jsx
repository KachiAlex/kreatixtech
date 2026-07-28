import React from 'react';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-paper pt-32 pb-20 px-6 lg:px-14">
      <SEO title="Privacy Policy" noindex />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-ink mb-8">Privacy Policy</h1>
        <p className="text-sm text-ink/50 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none text-ink/80 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">1. Introduction</h2>
            <p>Kreatix Technologies ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information when you use our website and services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, organization name, and password (hashed).</li>
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and interaction data.</li>
              <li><strong>Service Data:</strong> Assessment requests, messages, file uploads, and project details.</li>
              <li><strong>Analytics Data:</strong> Page views, click events, and session identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To communicate with you about assessments, updates, and support</li>
              <li>To analyze usage patterns and improve our services</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">4. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption. Authentication tokens are JWT-based with expiration. File uploads are stored in encrypted cloud storage (Cloudflare R2). We do not store passwords in plain text — all passwords are hashed using bcrypt.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">5. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active. Upon account deletion, we remove personal data within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">6. Your Rights (GDPR / CCPA)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> You can request a copy of your personal data.</li>
              <li><strong>Rectification:</strong> You can request correction of inaccurate data.</li>
              <li><strong>Erasure:</strong> You can request deletion of your data ("right to be forgotten").</li>
              <li><strong>Portability:</strong> You can request your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> You can object to certain processing of your data.</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@kreatixtech.com" className="text-orange hover:underline">privacy@kreatixtech.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not sell your data to third parties. See our Cookie Policy for details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">8. Third-Party Services</h2>
            <p>We use the following third-party services that may process your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Resend:</strong> Email delivery service</li>
              <li><strong>Cloudflare R2:</strong> File storage</li>
              <li><strong>Fly.io:</strong> Application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">9. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:privacy@kreatixtech.com" className="text-orange hover:underline">privacy@kreatixtech.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
