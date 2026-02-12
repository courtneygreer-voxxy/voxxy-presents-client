import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LegalLayout from '@/components/legal/LegalLayout'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-gray-900">Terms Of Service</h1>
          <p className="text-gray-500 italic">Last Updated: February 12, 2026</p>
        </div>

        {/* Annotation Box */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-700 leading-relaxed">
            This page explains our Terms of Service, which contains important information about your legal rights. When you use Voxxy Presents, you're agreeing to these terms. To help make them easier to understand, we've included annotations in these highlighted boxes. The annotations aren't part of the official terms, but are intended to clarify key sections.
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            These Terms of Service ("Terms") cover your use of and access to the platform, tools, features, and services (collectively, the "Services") provided by Voxxy AI, Inc., a Delaware corporation (together with its officers, directors, employees, agents, subsidiaries and affiliates, "Voxxy," "we," "us," or "our"). Our{' '}
            <a href="/legal/privacy" className="text-purple-600 hover:text-purple-700 underline">
              Privacy Policy
            </a>{' '}
            explains what personal information we collect and how it's used and shared, our{' '}
            <a href="/legal/acceptable-use" className="text-purple-600 hover:text-purple-700 underline">
              Acceptable Use Policy
            </a>{' '}
            outlines your responsibilities when using the Services, and our{' '}
            <a href="/legal/cookies" className="text-purple-600 hover:text-purple-700 underline">
              Cookie Policy
            </a>{' '}
            explains how we use cookies and similar technologies.
          </p>
          <p>
            By using or accessing the Services, you're agreeing to these Terms, our Privacy Policy, our Acceptable Use Policy, and our Cookie Policy (collectively, this "Agreement"). If you're using the Services on behalf of an organization, you're agreeing to this Agreement on behalf of that organization, and represent and warrant that you have the authority to do so. If you don't agree to all the terms in this Agreement, you may not use or access the Services.
          </p>
          <p>
            <strong>Please read this Agreement carefully.</strong> It includes important information about your legal rights, and covers areas such as fees, warranty disclaimers, limitations of liability, resolution of disputes by arbitration, and a class action waiver.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">1. Definitions</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              These definitions help clarify who's who and what's what throughout the rest of the agreement.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>1.1 "Customer"</strong> means the event producer, organizer, or business entity that subscribes to the Services to manage their recurring events. The Customer is the contracting party who pays for and administers a Voxxy Presents account.
            </p>
            <p>
              <strong>1.2 "End User"</strong> means any individual whose contact information is imported into the Services by a Customer, including without limitation artists, vendors, exhibitors, sponsors, attendees, or other event participants.
            </p>
            <p>
              <strong>1.3 "Customer Data"</strong> means all data, content, and information that the Customer uploads, imports, or otherwise provides to the Services, including without limitation End User contact lists, event details, and communications content.
            </p>
            <p>
              <strong>1.4 "Your Events"</strong> means the recurring community events, markets, pop-ups, and other gatherings that the Customer manages using the Services.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">2. Creating an Account</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Make sure your account information is accurate and keep your account safe. You're responsible for your account and any activity on it. You need to be at least 18 years old to use Voxxy Presents.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>2.1 Signing Up.</strong> To use the Services, you must first create an account ("Account"). You agree to provide us with accurate, complete, and updated information for your Account, including your business name, full name, email address, and any other information requested during registration. We may need to use this information to contact you.
            </p>
            <p>
              <strong>2.2 Staying Safe.</strong> Please safeguard your Account and make sure others don't have access to your Account or password. You must immediately notify us of any actual or suspected loss, theft, or unauthorized use of your Account or password. You're solely responsible for any activity on your Account. We're not liable for any acts or omissions by you in connection with your Account.
            </p>
            <p>
              <strong>2.3 Eighteen And Older.</strong> The Services are intended for use by individuals who are at least 18 years of age. By creating an Account, you represent and warrant that you are at least 18 years old. If you are under 18, you may not create an Account or use the Services.
            </p>
            <p>
              <strong>2.4 Business Use.</strong> The Services are designed for business use by event producers and organizers. By creating an Account, you represent that you are using the Services in connection with a legitimate event production or event management business.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">3. The Services</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Voxxy Presents is a software platform for managing recurring community events. We provide the tools — you run your events. We're not a co-organizer, venue, or event producer.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>3.1 What We Provide.</strong> Voxxy Presents is a software-as-a-service (SaaS) platform that provides event management tools, including without limitation automated email workflows, contact management, and event coordination features for recurring community events such as art markets, pop-ups, and similar gatherings.
            </p>
            <p>
              <strong>3.2 Software Only.</strong> Voxxy provides software tools only. We do not produce, host, organize, or operate Your Events. We are not a co-organizer, venue operator, or event producer. We have no control over and assume no responsibility for the quality, safety, legality, or any other aspect of Your Events. Any physical events managed using the Services are solely the responsibility of the Customer.
            </p>
            <p>
              <strong>3.3 No Guarantee of Results.</strong> While we strive to provide reliable tools, we do not guarantee that the Services will result in any particular outcome for Your Events, including without limitation attendee turnout, vendor participation, email deliverability rates, or revenue.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">4. Customer Data and End User Contacts</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              When you import your contacts into Voxxy, you're telling us that those people have given you permission to communicate with them. You still own your data. We process it on your behalf to provide the Services.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>4.1 Your Data Stays Yours.</strong> As between you and Voxxy, you retain all right, title, and interest in and to your Customer Data. These Terms do not grant us any ownership rights to Customer Data.
            </p>
            <p>
              <strong>4.2 License to Us.</strong> You grant Voxxy a non-exclusive, worldwide, royalty-free license to use, host, store, reproduce, modify, and display Customer Data solely for the purpose of providing, improving, and protecting the Services. This license terminates when you delete your Customer Data or your Account, except to the extent required for backup, archival, or legal compliance purposes.
            </p>
            <p>
              <strong>4.3 Your Representations About End User Data.</strong> By importing End User contact information into the Services, you represent and warrant that: (a) each End User whose information you import has previously opted in to receive communications from you; (b) you have the legal right to share such information with Voxxy as a third-party service provider; (c) the collection and sharing of such information complies with all applicable privacy laws and regulations, including without limitation the CAN-SPAM Act, GDPR (if applicable), and any applicable state privacy laws; and (d) you will promptly remove any End User's information from the Services upon their request to opt out.
            </p>
            <p>
              <strong>4.4 Data Processing.</strong> With respect to End User data, Voxxy acts as a data processor on your behalf. You are the data controller and are responsible for ensuring that you have a lawful basis for processing End User personal data. Our Privacy Policy provides further details on how we handle data in our role as data processor.
            </p>
            <p>
              <strong>4.5 Data Portability.</strong> You may export your Customer Data from the Services at any time during the term of your subscription. Upon termination of your Account, we will make your Customer Data available for export for a period of thirty (30) days, after which we may delete it.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">5. Your Responsibilities</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              You're responsible for your events, your contacts, your content, and following the law. We provide the tools; you handle the rest.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>5.1 Compliance With Laws.</strong> You are solely responsible for compliance with all applicable laws and regulations related to Your Events and your use of the Services, including without limitation laws governing email communications, data privacy, consumer protection, and event safety.
            </p>
            <p>
              <strong>5.2 Your Events Are Your Responsibility.</strong> You are solely responsible for all aspects of Your Events, including without limitation venue selection, safety, permits, insurance, staffing, and any interactions with End Users, vendors, attendees, or other participants. We are not liable for any claims, damages, or disputes arising from Your Events.
            </p>
            <p>
              <strong>5.3 Follow Our Rules.</strong> You're responsible for your conduct and Customer Data, and you must comply with our Acceptable Use Policy. We may review your conduct and Customer Data for compliance with these Terms and our Acceptable Use Policy, though we have no obligation to do so.
            </p>
            <p>
              <strong>5.4 Accurate Information.</strong> You represent that all information you provide to us, including without limitation Account registration information and End User contact data, is accurate, current, and complete.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">6. Paid Services and Fees</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Voxxy Presents is a paid service. We'll bill you on a recurring basis through Stripe. You can cancel anytime, but refunds are at our discretion.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>6.1 Subscription Fees.</strong> Access to the Services requires payment of subscription fees ("Fees"). We'll tell you about applicable Fees before charging you. Fees are billed in advance on a recurring basis (monthly or annually, depending on your selected plan) and are non-refundable except as expressly set forth herein or as required by law.
            </p>
            <p>
              <strong>6.2 Automatic Renewals.</strong> To ensure uninterrupted service, your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. Your renewal period will be equal to your current subscription period. We'll automatically charge the applicable Fee using the payment method on file. You may cancel auto-renewal at any time through your Account settings or by contacting us.
            </p>
            <p>
              <strong>6.3 Taxes.</strong> All Fees are exclusive of applicable taxes. You're responsible for all applicable taxes, and we'll charge taxes in addition to the Fees when required to do so.
            </p>
            <p>
              <strong>6.4 Payment Processing.</strong> We use Stripe as our third-party payment processor. All payments are processed in accordance with Stripe's Terms of Service and Privacy Policy. We do not store your payment card information on our servers. All payment data is tokenized and handled by Stripe. We are not responsible for the security or performance of Stripe's services.
            </p>
            <p>
              <strong>6.5 Fee Changes.</strong> We may change our Fees at any time. We'll give you at least thirty (30) days' advance notice of Fee changes. New Fees will not apply retroactively and will take effect at the start of your next billing period. If you don't agree with a Fee change, you may cancel your subscription before the new Fees take effect.
            </p>
            <p>
              <strong>6.6 Refunds.</strong> While you may cancel your subscription at any time, refunds are issued solely at our discretion or as required by applicable law. Cancellation takes effect at the end of the current billing period.
            </p>
            <p>
              <strong>6.7 Non-Payment.</strong> If you fail to pay Fees when due, we reserve the right to suspend or cancel your access to the Services. We will provide you with at least seven (7) days' notice before suspending access for non-payment.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">7. Third Party Services</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Voxxy integrates with other tools and services. Your use of those services is governed by their own terms — we're not responsible for them.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>7.1 Integrations.</strong> The Services may integrate with or contain links to third-party services, applications, and websites (collectively, "Third Party Services"). These Third Party Services may have their own terms and privacy policies, and your use of them will be governed by those terms and policies. We do not control and are not liable for Third Party Services.
            </p>
            <p>
              <strong>7.2 Current Third Party Services.</strong> The Services currently use or integrate with the following Third Party Services, among others: Stripe (payment processing), Mixpanel (analytics), Sentry (error monitoring), and Cloudflare (security and performance). Each of these services has its own terms and privacy policies that may apply to your use of the Services.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">8. Intellectual Property</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Voxxy owns the platform. You own your data. We can use your feedback to improve our product.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>8.1 Voxxy Owns the Platform.</strong> The Services, including without limitation all software, designs, text, graphics, and interfaces, are protected by copyright, trademark, and other intellectual property laws. These Terms don't grant you any right, title, or interest in the Services, our trademarks, logos, or other brand features. You agree not to copy, modify, reverse engineer, or create derivative works of the Services.
            </p>
            <p>
              <strong>8.2 Feedback.</strong> We welcome your feedback, ideas, and suggestions ("Feedback"). You agree that we may use your Feedback without any restriction or obligation to you, even after this Agreement is terminated.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">9. Our Rights</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              To keep the platform running safely and effectively, we need to maintain certain controls over the Services.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>9.1 Service Changes.</strong> We reserve the right to modify, suspend, or discontinue parts or all of the Services at any time. For material changes that significantly affect your use of the Services, we will provide reasonable advance notice.
            </p>
            <p>
              <strong>9.2 Account Actions.</strong> We may suspend, restrict, or terminate your Account if we reasonably believe you are violating this Agreement, our Acceptable Use Policy, or applicable law. Except in cases of egregious violations or legal requirements, we will provide you with notice and an opportunity to cure before taking such action.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">10. Privacy</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Our Privacy Policy explains how we handle data. It's part of this agreement.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Our{' '}
              <a href="/legal/privacy" className="text-purple-600 hover:text-purple-700 underline">
                Privacy Policy
              </a>{' '}
              explains how we collect, use, and share information. By using the Services, you agree to our collection, use, and sharing of information as set forth in the Privacy Policy. Because Voxxy acts as a data processor for End User data you import, the Privacy Policy also describes our obligations in that capacity.
            </p>
          </div>
        </section>

        {/* Section 11 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">11. Term and Termination</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Either of us can end this agreement. If you cancel, you'll have time to export your data.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>11.1 Term.</strong> This Agreement will remain in effect until terminated by either you or us.
            </p>
            <p>
              <strong>11.2 Termination By You.</strong> You may terminate this Agreement at any time by cancelling your subscription through your Account settings or by contacting us. Cancellation takes effect at the end of your current billing period.
            </p>
            <p>
              <strong>11.3 Termination By Us.</strong> We may terminate or suspend your access to the Services at any time for violation of this Agreement or our Acceptable Use Policy. We will provide notice where reasonably practicable.
            </p>
            <p>
              <strong>11.4 Effect of Termination.</strong> Upon termination: (a) your right to access and use the Services will cease; (b) you will have thirty (30) days to export your Customer Data, after which we may delete it; and (c) any outstanding Fees will become immediately due. Sections that by their nature should survive termination will survive, including without limitation Sections 4 (Customer Data), 8 (Intellectual Property), 12 (Warranty Disclaimers), 13 (Limitation of Liability), 14 (Indemnification), and 15 (Dispute Resolution).
            </p>
          </div>
        </section>

        {/* Section 12 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">12. Warranty Disclaimers</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              We work hard to make Voxxy great, but the Services are provided as is, without warranties.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="uppercase">
              TO THE FULLEST EXTENT PERMITTED BY LAW, VOXXY MAKES NO WARRANTIES, EITHER EXPRESS OR IMPLIED, ABOUT THE SERVICES. THE SERVICES ARE PROVIDED "AS IS." VOXXY ALSO DISCLAIMS ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM VOXXY SHALL CREATE ANY WARRANTY.
            </p>
            <p className="uppercase">
              VOXXY MAKES NO WARRANTY OR REPRESENTATION THAT THE SERVICES WILL: (A) BE TIMELY, UNINTERRUPTED, OR ERROR-FREE; (B) MEET YOUR REQUIREMENTS OR EXPECTATIONS; (C) BE FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS; OR (D) ACHIEVE ANY PARTICULAR RESULTS FOR YOUR EVENTS, INCLUDING WITHOUT LIMITATION EMAIL DELIVERY RATES OR ATTENDEE ENGAGEMENT. SOME JURISDICTIONS DON'T ALLOW THESE DISCLAIMERS, SO THEY MAY NOT APPLY TO YOU.
            </p>
          </div>
        </section>

        {/* Section 13 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">13. Limitation of Liability</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              If something goes wrong, our financial liability is capped at the fees you've paid us in the last six months.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="uppercase">
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL VOXXY BE LIABLE WITH RESPECT TO ANY CLAIMS ARISING OUT OF OR RELATED TO THE SERVICES OR THIS AGREEMENT FOR: (A) ANY INDIRECT, SPECIAL, INCIDENTAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES; (B) ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES; (C) ANY DAMAGES RELATED TO YOUR ACCESS TO, USE OF, OR INABILITY TO ACCESS OR USE THE SERVICES; (D) ANY DAMAGES RELATED TO LOSS OR CORRUPTION OF ANY CUSTOMER DATA; (E) ANY CLAIMS ARISING FROM YOUR EVENTS, INCLUDING WITHOUT LIMITATION PERSONAL INJURY, PROPERTY DAMAGE, OR ANY OTHER INCIDENT AT A PHYSICAL EVENT; OR (F) ANY THIRD PARTY SERVICES ACCESSED VIA THE SERVICES.
            </p>
            <p className="uppercase">
              THESE LIMITATIONS APPLY TO ANY THEORY OF LIABILITY, WHETHER BASED ON WARRANTY, CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, WHETHER OR NOT VOXXY HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
            </p>
            <p className="uppercase">
              TO THE FULLEST EXTENT PERMITTED BY LAW, THE AGGREGATE LIABILITY OF VOXXY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THE SERVICES AND THIS AGREEMENT SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO VOXXY IN THE SIX (6) MONTHS IMMEDIATELY PRECEDING THE EVENT THAT GAVE RISE TO SUCH CLAIM. SOME JURISDICTIONS DON'T ALLOW THESE LIMITATIONS, SO THEY MAY NOT APPLY TO YOU.
            </p>
          </div>
        </section>

        {/* Section 14 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">14. Indemnification</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              If something you do on our platform gets us sued, you agree to cover us.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              To the fullest extent permitted by law, you agree to indemnify and hold harmless Voxxy from and against all damages, losses, and expenses of any kind (including without limitation reasonable attorneys' fees and costs) arising out of or related to: (a) your breach of this Agreement; (b) your Customer Data and your use of the Services; (c) Your Events and any claims from End Users, vendors, attendees, or other participants; (d) your violation of any law or regulation or the rights of any third party; and (e) any End User data you import into the Services without proper consent or authorization.
            </p>
          </div>
        </section>

        {/* Section 15 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">15. Dispute Resolution</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Before filing a claim, you agree to try to work it out with us informally first. Formal disputes are resolved through arbitration, not court, unless you opt out. Claims can only be brought individually — no class actions.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>15.1 Informal Resolution.</strong> Before filing a claim against Voxxy, you agree to try to resolve the dispute by first emailing team@voxxypresents.com with a description of your claim. We'll try to resolve the dispute informally. If we can't resolve it within thirty (30) days of our receipt of your email, you or Voxxy may then bring a formal proceeding.
            </p>
            <p>
              <strong>15.2 Arbitration Agreement.</strong> You and Voxxy agree to resolve any claims arising from or relating to the Services or this Agreement through final and binding arbitration, except as set forth below. You and Voxxy expressly waive the right to trial by jury. Discovery and rights to appeal in arbitration are generally more limited than in a lawsuit. There is no judge or jury in arbitration, and court review of an arbitration award is limited.
            </p>
            <p>
              <strong>15.3 Arbitration Opt-Out.</strong> You can decline the agreement to arbitrate by emailing team@voxxypresents.com within thirty (30) days of the date you first agree to this Agreement. Your email must be sent from the email address associated with your Account and must include your full name, business name, and a clear statement that you want to opt out of arbitration.
            </p>
            <p>
              <strong>15.4 Arbitration Procedures.</strong> Any arbitration will be administered by the American Arbitration Association ("AAA") under its Commercial Arbitration Rules. The arbitration will be conducted by a single arbitrator. The arbitration will take place in Wilmington, Delaware, or at another mutually agreed location.
            </p>
            <p>
              <strong>15.5 Arbitration Fees.</strong> The AAA's rules will govern payment of all arbitration fees. We will not seek attorneys' fees and costs in arbitration unless the arbitrator determines that your claim is frivolous.
            </p>
            <p>
              <strong>15.6 Exceptions to Arbitration.</strong> Either party may bring a lawsuit solely for injunctive relief to stop unauthorized use or abuse of the Services, or intellectual property infringement, without first engaging in arbitration or the informal dispute resolution process described above. Either party may also assert claims in small claims court if they qualify.
            </p>
            <p>
              <strong>15.7 Judicial Forum.</strong> If the agreement to arbitrate is found not to apply to you or your claim, or if you opt out of arbitration, you and Voxxy agree that any judicial proceeding must be brought exclusively in the federal or state courts located in Delaware, and you consent to venue and personal jurisdiction in those courts.
            </p>
            <p>
              <strong>15.8 No Class Actions.</strong> You may only resolve disputes with us on an individual basis, and may not bring a claim as a plaintiff or class member in a class, consolidated, or representative action. Class actions, class arbitrations, private attorney general actions, and consolidation with other arbitrations are not allowed.
            </p>
            <p>
              <strong>15.9 Time Limitation.</strong> Any claim must be commenced within one (1) year after the date the party asserting the claim first knows or reasonably should know of the act, omission, or default giving rise to the claim. If applicable law prohibits a one-year limitation period, any claim must be asserted within the shortest time period permitted by applicable law.
            </p>
          </div>
        </section>

        {/* Section 16 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">16. Additional Terms</h2>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              This Agreement is the whole agreement between us. We'll give you notice if we make changes that affect your rights.
            </p>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>16.1 Entire Agreement.</strong> This Agreement constitutes the entire agreement between you and Voxxy regarding the subject matter hereof, and supersedes any prior or contemporaneous agreements. This Agreement creates no third-party beneficiary rights.
            </p>
            <p>
              <strong>16.2 Governing Law.</strong> This Agreement and the Services shall be governed in all respects by the laws of the State of Delaware, without regard to its conflict of law provisions.
            </p>
            <p>
              <strong>16.3 Waiver, Severability, and Assignment.</strong> Our failure to enforce any provision of this Agreement is not a waiver of our right to do so later. If any provision is found unenforceable, the remaining provisions will remain in full effect. You may not assign your rights under this Agreement without our consent. We may assign our rights to any affiliate, subsidiary, or successor in interest.
            </p>
            <p>
              <strong>16.4 Modifications.</strong> We may modify this Agreement from time to time and will always post the most current version on our site. If a modification meaningfully reduces your rights, we'll notify you (for example, by sending you an email or displaying a notice within the Services) at least thirty (30) days before the changes take effect. By continuing to use the Services after modifications come into effect, you agree to be bound by the modified Agreement.
            </p>
            <p>
              <strong>16.5 Force Majeure.</strong> Neither party will be liable for any failure or delay in performing obligations under this Agreement when such failure or delay results from circumstances beyond the party's reasonable control, including without limitation acts of God, natural disasters, war, terrorism, pandemics, government orders, or interruptions in internet service or infrastructure.
            </p>
            <p>
              <strong>16.6 Notices.</strong> Notices to Voxxy should be sent to team@voxxypresents.com. We may send notices to you via the email address associated with your Account. Notices are considered received when sent to the email address on file.
            </p>
            <p>
              <strong>16.7 Contact Us.</strong> If you have any questions about these Terms, please contact us at team@voxxypresents.com.
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
