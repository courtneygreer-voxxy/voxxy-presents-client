import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LegalLayout from '@/components/legal/LegalLayout'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <LegalLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 italic">Last Updated: February 12, 2026</p>
        </div>

        {/* Annotation Box */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-700 leading-relaxed">
            This Privacy Policy explains what information we collect, how we use it, and how we protect it. We've included plain-language annotations in these highlighted boxes to help you understand each section. The annotations aren't part of the official policy.
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Thanks for using Voxxy Presents! This Privacy Policy describes what information we collect and how it's used and shared. Any capitalized terms not defined in this Privacy Policy have the meanings set forth in our{' '}
            <a href="/legal/terms" className="text-purple-600 hover:text-purple-700 underline">
              Terms of Service
            </a>
            . If you don't agree with the terms of this Privacy Policy, you may not access or use the Services. If you have any questions, contact us at team@voxxypresents.com.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">1. Core Principles</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              The short version: we don't sell your data, we only collect what we need, and we take protecting it seriously.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              When it comes to your personal information, we believe in transparency, not surprises. Before we get into the details, here are our core privacy principles:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>We don't sell your personal information to anyone.</strong> It's not the type of business we're in. We are an event management platform, not a data broker.
              </li>
              <li>
                <strong>We don't ask for personal information unless we need it</strong> to provide or improve the Services for you.
              </li>
              <li>
                <strong>We don't share your personal information</strong> unless you've specifically allowed it, or for the very limited purposes described below.
              </li>
              <li>
                <strong>We take data stewardship seriously.</strong> When you use our Services, you trust us with your information, and we take that responsibility to heart.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">2. Our Role: Data Processor vs. Data Controller</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              This is important: when event producers import their contact lists into Voxxy, we're processing that data on their behalf. The producer is responsible for having permission to share it with us.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>2.1 Voxxy as Data Controller.</strong> When you create a Customer account with Voxxy Presents, we act as the data controller for the information you provide directly to us (such as your account registration details, billing information, and communications with us). We determine how and why this data is processed.
            </p>
            <p>
              <strong>2.2 Voxxy as Data Processor.</strong> When a Customer imports End User contact information into the Services (such as vendor lists, artist rosters, or attendee information), Voxxy acts as a data processor on behalf of that Customer. The Customer is the data controller for this information and is responsible for ensuring they have a lawful basis (such as prior consent) to share End User data with Voxxy. We process End User data only as directed by the Customer and in accordance with this Privacy Policy and our Terms of Service.
            </p>
            <p>
              <strong>2.3 Data Processing Agreement.</strong> For Customers who require a formal Data Processing Agreement (DPA), particularly those with End Users located in the European Union or other jurisdictions requiring such agreements, please contact us at team@voxxypresents.com.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">3. Information We Collect</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              We collect only what we need to run the platform. Here's exactly what that includes.
            </p>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Information You Provide Directly</h3>

              <p>
                <strong>3.1 Customer Account Information.</strong> When you create an Account, we collect your business name, full name, email address, and phone number (optional). We use this information to set up and maintain your Account, communicate with you, and provide the Services.
              </p>
              <p>
                <strong>3.2 End User Contact Information.</strong> When Customers import their existing contact lists, we receive and store the following End User information: business name, full name, email address, phone number (if provided by the Customer), social media links, and personal or business website links. We process this information solely to provide the Services on behalf of the Customer.
              </p>
              <p>
                <strong>3.3 Payment Information.</strong> When you provide payment information, we transmit it via an encrypted connection to our payment processor, Stripe. Stripe uses and processes your payment information in accordance with Stripe's Privacy Policy. We do not store your payment card information on our servers. All payment data is tokenized and handled entirely by Stripe.
              </p>
              <p>
                <strong>3.4 Communications With Us.</strong> When you send us emails or other communications (such as support inquiries), we maintain those communications and their contents so that we can resolve your inquiries or otherwise assist you.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Information Collected Automatically</h3>

              <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  These are the technical details about our analytics tools. We want to implement a consent banner so you can opt in before any of this tracking begins.
                </p>
              </div>

              <p>
                <strong>3.5 Usage Information.</strong> We collect information about your activity on and interaction with the Services, such as your IP address, device or browser type, the webpage you visited before coming to our site, and identifiers associated with your devices. This information helps us analyze how the Services are being accessed and used, and to track performance.
              </p>
              <p>
                <strong>3.6 Analytics Tools.</strong> We use the following third-party analytics and monitoring tools:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>Mixpanel</strong> — Product analytics and user behavior tracking. Mixpanel may collect device information, IP addresses, browser type, and usage patterns to help us understand how our Services are used. Mixpanel's privacy policy governs their handling of this data.
                </li>
                <li>
                  <strong>Sentry</strong> — Error monitoring and performance tracking. Sentry captures error data which may include user session information, device details, and contextual data about user actions at the time of an error. Sentry's privacy policy governs their handling of this data.
                </li>
                <li>
                  <strong>Cloudflare</strong> — Content delivery, security, and analytics. Cloudflare processes traffic data including IP addresses, request headers, and general traffic patterns to protect and optimize our Services. Cloudflare's privacy policy governs their handling of this data.
                </li>
              </ul>
              <p>
                <strong>3.7 Cookies and Similar Technologies.</strong> We use cookies and similar technologies to remember your preferences, keep you safe, and improve the Services. For detailed information about the specific cookies we use and how to manage them, please see our{' '}
                <a href="/legal/cookies" className="text-purple-600 hover:text-purple-700 underline">
                  Cookie Policy
                </a>
                .
              </p>
              <p>
                <strong>3.8 Consent Before Tracking.</strong> We use a cookie consent banner on our website and landing pages. No analytics or tracking scripts (including Mixpanel, Sentry analytics features, or Cloudflare analytics) will be activated until you have affirmatively opted in through this consent mechanism, except for cookies that are strictly necessary for the functioning of the Services (such as authentication and security cookies).
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">4. How We Use Your Information</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              We use your information to run the platform and make it better. That's it.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>We use the information we collect for the following purposes:</p>
            <p>
              <strong>4.1 Providing the Services.</strong> To set up and maintain your Account, process your transactions, deliver automated email workflows, manage End User contacts, and otherwise provide the features and functionality of the Services.
            </p>
            <p>
              <strong>4.2 Improving the Services.</strong> To understand how the Services are used, identify issues, and develop new features and improvements.
            </p>
            <p>
              <strong>4.3 Communicating With You.</strong> To send you service-related announcements, respond to your inquiries, and provide customer support.
            </p>
            <p>
              <strong>4.4 Protecting the Services.</strong> To detect, prevent, and address fraud, abuse, security issues, and technical problems.
            </p>
            <p>
              <strong>4.5 Legal Compliance.</strong> To comply with applicable laws, regulations, legal processes, or governmental requests.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">5. How We Share Your Information</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              We share your information only in limited, specific circumstances. We never sell it.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>5.1 Service Providers.</strong> We use trusted third-party service providers to help us provide, improve, and protect the Services. These include Stripe (payment processing), Mixpanel (analytics), Sentry (error monitoring), and Cloudflare (security and performance). These providers may access or process your information only for the purposes we've authorized, and we require them to provide at least the same level of protection for your information as described in this Privacy Policy.
            </p>
            <p>
              <strong>5.2 Legal Requirements.</strong> We may disclose your information to third parties if we determine that such disclosure is reasonably necessary to: (a) comply with the law or a legal process; (b) protect our rights or property; (c) prevent fraud or abuse of the Services or our users; or (d) protect the safety of any person. When we receive law enforcement requests for information, we scrutinize them carefully and challenge vague, overbroad, or otherwise unlawful requests. When legally permitted, we will notify you that your information is being requested.
            </p>
            <p>
              <strong>5.3 Business Transfers.</strong> If Voxxy AI, Inc. is involved in a reorganization, merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change and any choices you may have regarding your information.
            </p>
            <p>
              <strong>5.4 Aggregated or Anonymized Data.</strong> We may share aggregated or anonymized information that does not directly identify you for research, marketing, analytics, or other purposes.
            </p>
            <p>
              <strong>5.5 With Your Consent.</strong> We may share your information in other circumstances with your explicit consent.
            </p>
            <p>
              <strong>5.6 We Do Not Sell Your Personal Information.</strong> We do not sell, rent, or trade your personal information to third parties for their marketing purposes. For the purposes of the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), we do not "sell" or "share" your personal information as those terms are defined under California law.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">6. End User Information</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              If you're an event producer using Voxxy, this section explains how we handle the contact data you import.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>6.1 Collection and Processing.</strong> Customers may import End User contact information into the Services, including business names, full names, email addresses, phone numbers, social media links, and website links. We process this information solely on behalf of and at the direction of the Customer, in our capacity as a data processor.
            </p>
            <p>
              <strong>6.2 Customer Responsibilities.</strong> Customers are solely responsible for: (a) ensuring that they have obtained proper consent or have another lawful basis to share End User information with Voxxy; (b) complying with all applicable privacy laws and regulations, including the CAN-SPAM Act, GDPR (if applicable), and any applicable state privacy laws; (c) posting their own privacy policy that discloses their use of Voxxy as a service provider; and (d) honoring End User requests to opt out or have their information deleted.
            </p>
            <p>
              <strong>6.3 End User Rights.</strong> If you are an End User whose information has been imported into Voxxy by an event producer, and you wish to access, correct, or delete your information, please contact the event producer directly. If you are unable to reach the event producer, you may contact us at team@voxxypresents.com and we will assist you in connecting with the appropriate Customer or, where required by law, take action on your request directly.
            </p>
            <p>
              <strong>6.4 End User Payment Information.</strong> We do not collect or store End User payment information. Any payment processing for events is handled by the event producer's own payment arrangements, separate from the Voxxy Presents platform.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">7. Data Protection</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              We take security seriously and use industry-standard measures to protect your data.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              While no service is completely secure, we are dedicated to keeping your information safe. We employ security measures including encryption of data in transit (HTTPS/TLS), access controls limiting who within our organization can access personal data, regular security monitoring through Sentry and Cloudflare, and secure payment processing through Stripe's PCI DSS-compliant infrastructure. We do not store payment card data on our servers.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">8. Data Retention</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              We keep your data as long as you use the service. When you leave, we give you time to export it before deletion.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>8.1 Customer Data.</strong> We retain your personal information for as long as we need it to provide the Services to you. Upon termination of your Account, we will retain your Customer Data for thirty (30) days to allow you to export it, after which it may be deleted. We may retain certain information as required by law, to protect our rights, resolve disputes, or enforce our agreements.
            </p>
            <p>
              <strong>8.2 End User Data.</strong> We retain End User data for as long as the Customer's Account is active and the Customer has not deleted the data. Upon termination of the Customer's Account, End User data follows the same retention and deletion schedule as Customer Data.
            </p>
            <p>
              <strong>8.3 Deletion Requests.</strong> You can request deletion of your personal information at any time by contacting us at team@voxxypresents.com. Please note that there may be a brief delay in deleting information from our servers and backup storage.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">9. Your Rights</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              You have rights over your data, including the ability to access, correct, and delete it.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <p>
              <strong>9.1 Access and Portability.</strong> You may request a copy of the personal information we maintain about you. Customers may export their Customer Data from the Services at any time during their subscription.
            </p>
            <p>
              <strong>9.2 Correction.</strong> You may update or correct your personal information by logging into the Services and updating your profile, or by contacting us.
            </p>
            <p>
              <strong>9.3 Deletion.</strong> You may request deletion of your personal information by contacting us at team@voxxypresents.com or by deleting your Account. Certain information may be retained as described in Section 8.
            </p>
            <p>
              <strong>9.4 Opt-Out of Marketing.</strong> You may opt out of receiving marketing or promotional communications by clicking the unsubscribe link in those communications or by contacting us. You will continue to receive service-related communications necessary for the operation of your Account.
            </p>
            <p>
              <strong>9.5 Do Not Sell / Do Not Share.</strong> We do not sell or share your personal information as defined under the CCPA/CPRA. Because we do not engage in these activities, there is no need to submit a "Do Not Sell" request, but you may contact us at any time if you have questions.
            </p>
            <p>
              <strong>9.6 GDPR Rights.</strong> If you are located in the European Economic Area, you may also have rights to restrict processing, object to processing, and lodge a complaint with a supervisory authority. To exercise any of these rights, contact us at team@voxxypresents.com.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">10. International Data Transfers</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Information that you submit through the Services may be transferred to and processed in countries other than where you live, including the United States, where our servers are located. By using the Services, you acknowledge and consent to such transfers. We require our third-party service providers to provide at least the same level of protection for your information as described in this Privacy Policy.
            </p>
          </div>
        </section>

        {/* Section 11 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">11. Children's Privacy</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              The Services are not directed at individuals under the age of 18. We do not knowingly collect personal information from anyone under 18. All Account holders must be at least 18 years old. If we learn that we have collected personal information from a person under 18, we will take steps to delete that information promptly. If you believe we have collected information from a person under 18, please contact us at team@voxxypresents.com.
            </p>
          </div>
        </section>

        {/* Section 12 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">12. Communications</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>12.1 Service Communications.</strong> We may send you service-related announcements and transactional emails related to your Account and your use of the Services. These communications are necessary for the operation of the Services and cannot be opted out of while your Account is active.
            </p>
            <p>
              <strong>12.2 Marketing Communications.</strong> We may send you marketing or promotional communications about the Services. You can opt out of receiving these communications at any time by clicking the unsubscribe link in those emails or by contacting us at team@voxxypresents.com.
            </p>
            <p>
              <strong>12.3 Customer-Directed Communications.</strong> The Services enable Customers to send automated email communications to their End Users. Voxxy sends these communications on behalf of and at the direction of the Customer. The Customer is responsible for the content and frequency of these communications and for compliance with applicable email marketing laws, including CAN-SPAM.
            </p>
          </div>
        </section>

        {/* Section 13 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">13. California Privacy Rights</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              If you're a California resident, you have additional rights under the CCPA/CPRA.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA) provide you with additional rights regarding your personal information. These include the right to know what personal information we collect, the right to request deletion, the right to opt out of the sale or sharing of personal information (which we do not engage in), and the right to non-discrimination for exercising your privacy rights.
            </p>
            <p>
              To exercise any of these rights, contact us at team@voxxypresents.com. We will verify your identity before processing your request. You may also designate an authorized agent to submit a request on your behalf.
            </p>
          </div>
        </section>

        {/* Section 14 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">14. Modifications</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              We may modify this Privacy Policy from time to time and will always post the most current version on our site. If a modification meaningfully reduces your rights, we'll notify you by email or by displaying a prominent notice within the Services at least thirty (30) days before the changes take effect. By continuing to use the Services after modifications come into effect, you agree to be bound by the modified Privacy Policy.
            </p>
          </div>
        </section>

        {/* Section 15 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">15. Contact Us</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="pl-4">
              <p className="font-semibold">Voxxy AI, Inc.</p>
              <p>Email: <a href="mailto:team@voxxypresents.com" className="text-purple-600 hover:text-purple-700 underline">team@voxxypresents.com</a></p>
              <p>Brooklyn, New York</p>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
