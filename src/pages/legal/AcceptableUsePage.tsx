import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LegalLayout from '@/components/legal/LegalLayout'
import { ArrowLeft } from 'lucide-react'

export default function AcceptableUsePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <LegalLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Acceptable Use Policy</h1>
          <p className="text-gray-500 italic">Last Updated: February 12, 2026</p>
        </div>

        {/* Annotation Box */}
        <div className="bg-muted border border-border rounded-lg p-6">
          <p className="text-gray-700 leading-relaxed">
            This Acceptable Use Policy sets the ground rules for using Voxxy Presents. It protects everyone on the platform — you, your vendors, your attendees, and us. The annotations in these highlighted boxes aren't part of the official policy but are here to help you understand each section.
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            This Acceptable Use Policy ("AUP") outlines prohibited conduct in connection with the Services provided by Voxxy AI, Inc. Any capitalized terms not defined in this AUP have the meanings set forth in our{' '}
            <a href="/legal/terms" className="text-purple-600 hover:text-purple-700 underline">
              Terms of Service
            </a>
            . If you have any questions about this AUP, contact us at team@voxxypresents.com.
          </p>
          <p>
            Voxxy Presents helps event producers manage their recurring community events more efficiently. We're proud to support the creative, community-building work our Customers do. At the same time, we expect our Customers to use the platform responsibly. By using the Services, you agree not to misuse them or help anyone else do so.
          </p>
        </div>

        {/* Email and Communications Abuse */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Email and Communications Abuse</h2>

          <div className="bg-muted border border-border rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              This is our "kill switch" section. Because Voxxy sends automated emails on your behalf, misusing those tools puts our entire platform at risk. Sending spam through Voxxy could get our email domain blacklisted, which would hurt every Customer on the platform.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Because the Services include automated email workflow tools that send communications on your behalf, the integrity of our email infrastructure depends on every Customer using these tools responsibly. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Send unsolicited bulk email, spam, or other communications</strong> to individuals who have not opted in to receive communications from you.
              </li>
              <li>
                <strong>Import contacts without consent.</strong> You may only import End User contact information for individuals who have previously opted in to receive communications from you. Importing purchased, rented, scraped, or otherwise obtained contact lists where individuals have not given you direct, affirmative consent is strictly prohibited.
              </li>
              <li>
                <strong>Send altered, deceptive, or false source-identifying information,</strong> including phishing, spoofing, or misleading sender names or email addresses.
              </li>
              <li>
                <strong>Use the Services to send communications that violate</strong> the CAN-SPAM Act, GDPR, or any other applicable email marketing or privacy laws.
              </li>
              <li>
                <strong>Use the Services to send communications on behalf of third parties</strong> who are not authorized under your Account.
              </li>
              <li>
                <strong>Take any action that could damage or impair</strong> the reputation or deliverability of Voxxy's email infrastructure, including actions that result in our sending domains or IP addresses being blacklisted.
              </li>
            </ul>
          </div>
        </section>

        {/* Data and Privacy Abuse */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Data and Privacy Abuse</h2>

          <div className="bg-muted border border-border rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              You're responsible for treating your contacts' data with care. Don't use Voxxy to collect data you shouldn't have or share it with people who shouldn't see it.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Collect, store, or process End User personal information</strong> through the Services for any purpose other than managing your events and communicating with your event participants.
              </li>
              <li>
                <strong>Share, sell, rent, or otherwise distribute End User contact information</strong> obtained through the Services to any third party without the explicit consent of those End Users.
              </li>
              <li>
                <strong>Fail to honor opt-out requests</strong> from End Users who no longer wish to receive communications from you.
              </li>
              <li>
                <strong>Retain End User data in the Services</strong> after you no longer have a legitimate business need or lawful basis to process it.
              </li>
              <li>
                <strong>Use the Services to collect sensitive personal information</strong> (such as government IDs, financial account numbers, health information, or biometric data) unless explicitly authorized by Voxxy in writing.
              </li>
            </ul>
          </div>
        </section>

        {/* Abusing and Disrupting the Services */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Abusing and Disrupting the Services</h2>

          <div className="bg-muted border border-border rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Don't try to break, hack, or reverse-engineer the platform.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Probe, scan, or test</strong> the vulnerability of any system or network.
              </li>
              <li>
                <strong>Breach or otherwise bypass</strong> any security or authentication measures.
              </li>
              <li>
                <strong>Access, tamper with, or use</strong> nonpublic areas of the Services.
              </li>
              <li>
                <strong>Interfere with or disrupt</strong> any user, host, or network, for example by distributing malware or overloading, flooding, or mail-bombing any part of the Services.
              </li>
              <li>
                <strong>Reverse engineer, decompile, or disassemble</strong> any part of the Services in an effort to access source code, algorithms, or proprietary processes.
              </li>
              <li>
                <strong>Access, search, or create accounts</strong> for the Services by any means other than our publicly supported interfaces (for example, scraping, spidering, or crawling).
              </li>
              <li>
                <strong>Take any action that imposes an unreasonable load</strong> on our infrastructure or our third-party providers.
              </li>
              <li>
                <strong>Share your Account credentials</strong> with any other person, or use another person's Account credentials.
              </li>
            </ul>
          </div>
        </section>

        {/* Deception, Fraud, and Impersonation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Deception, Fraud, and Impersonation</h2>

          <div className="bg-muted border border-border rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Be honest about who you are and what your events are. Don't misrepresent yourself to vendors or attendees.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Provide false, fraudulent, inaccurate, or deceiving information</strong> in your Account registration, event listings, or communications.
              </li>
              <li>
                <strong>Impersonate</strong> another person, company, or entity.
              </li>
              <li>
                <strong>Engage in misleading or unethical</strong> marketing or advertising through the Services.
              </li>
              <li>
                <strong>Misrepresent the nature, frequency, or details</strong> of Your Events to End Users.
              </li>
              <li>
                <strong>Use unauthorized payment methods</strong> or commit payment fraud in connection with the Services.
              </li>
            </ul>
          </div>
        </section>

        {/* Prohibited Content and Conduct */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Prohibited Content and Conduct</h2>

          <div className="bg-muted border border-border rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Keep it professional. The communications you send through Voxxy represent both your brand and ours.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You agree not to use the Services to create, store, send, or distribute content that:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Is threatening, harassing, abusive, excessively violent, offensive, sexually explicit, or obscene.</strong>
              </li>
              <li>
                <strong>Advocates bigotry or hatred</strong> against any person or group based on their race, ethnicity, nationality, religion, gender, gender identity, sexual orientation, age, or disability.
              </li>
              <li>
                <strong>Infringes or misappropriates</strong> anyone's copyright, trademark, or other intellectual property rights.
              </li>
              <li>
                <strong>Violates anyone's privacy or publicity rights.</strong>
              </li>
              <li>
                <strong>Promotes illegal activities,</strong> illegal substances, or events that violate applicable laws or regulations.
              </li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Intellectual Property</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Copy, reproduce, or redistribute</strong> the Services or any part thereof without our written permission.
              </li>
              <li>
                <strong>Use Voxxy's name, logo, or trademarks</strong> without our prior written consent, except as necessary to identify your use of the Services.
              </li>
              <li>
                <strong>Remove, alter, or obscure</strong> any copyright, trademark, or other proprietary notices from the Services.
              </li>
            </ul>
          </div>
        </section>

        {/* Legal Compliance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Legal Compliance</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Use the Services in violation of any applicable law,</strong> including without limitation US export controls, regulations, and sanctions.
              </li>
              <li>
                <strong>Use the Services to facilitate any activity that violates</strong> federal, state, or local laws, including laws regarding online conduct, data privacy, consumer protection, and event safety.
              </li>
            </ul>
          </div>
        </section>

        {/* Enforcement */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Enforcement</h2>

          <div className="bg-muted border border-border rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              If you break these rules, we can take action — up to and including shutting down your account immediately. For most issues, we'll try to work with you first.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>Graduated Response.</strong> For most violations, we will attempt to notify you and provide a reasonable opportunity to cure the violation before taking action against your Account. However, we reserve the right to act immediately and without notice for severe violations, including those that threaten the integrity of our email infrastructure, involve fraud, or pose a risk of harm to others.
            </p>
            <p>
              <strong>Actions We May Take.</strong> If we conclude that you're violating this AUP, or engaging in any other behavior we deem abusive or inappropriate, we may take one or more of the following actions at our sole discretion:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Issue a warning and request that you cure the violation.</li>
              <li>Temporarily suspend your Account or specific features (such as email sending capabilities).</li>
              <li>Permanently terminate your Account and access to the Services, without refund of any amounts paid.</li>
              <li>Remove any content that violates this AUP.</li>
            </ul>
            <p>
              <strong>Immediate Termination Events.</strong> The following violations may result in immediate Account termination without prior notice or opportunity to cure: (a) importing contacts without proper consent (spam); (b) phishing, spoofing, or sending deceptive communications; (c) any activity that damages or threatens our email deliverability or domain reputation; (d) fraud or use of unauthorized payment methods; or (e) any activity that poses an imminent risk of harm.
            </p>
            <p>We reserve the right to enforce, or not enforce, this AUP in our sole discretion.</p>
          </div>
        </section>

        {/* Reporting Violations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Reporting Violations</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              You can report violations of this AUP by emailing team@voxxypresents.com. We take all reports seriously and will investigate promptly.
            </p>
          </div>
        </section>

        {/* Modifications */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Modifications</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              We may modify this AUP from time to time and will post the most current version on our site. If a modification meaningfully reduces your rights, we'll notify you in accordance with the procedures set forth in our{' '}
              <a href="/legal/terms" className="text-purple-600 hover:text-purple-700 underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
