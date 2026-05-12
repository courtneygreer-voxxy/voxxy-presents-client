import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LegalLayout from '@/components/legal/LegalLayout'
import { ArrowLeft } from 'lucide-react'

export default function MobileEULAPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <LegalLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Mobile End User License Agreement</h1>
          <p className="text-muted-foreground italic">Last Updated: February 12, 2026</p>
        </div>

        {/* Annotation Box */}
        <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
          <p className="text-slate-700 leading-relaxed">
            This EULA is specific to the Hey Voxxy mobile application. If you're an Event Producer using the Voxxy web platform, see our{' '}
            <a href="/legal/terms" className="text-slate-600 hover:text-slate-900 underline transition-colors">
              Terms of Service
            </a>
            . The annotations in these highlighted boxes aren't part of the official EULA but are here to help you understand each section.
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-foreground/80 leading-relaxed">
          <p>
            This End User License Agreement ("EULA") is a binding legal agreement between you (the "End User" or "you") and Voxxy AI, Inc. ("Voxxy," "we," "us," or "our") governing your use of the Hey Voxxy mobile application (the "App"). By downloading, installing, accessing, or using the App, you agree to be bound by this EULA. If you do not agree to this EULA, do not download, install, or use the App.
          </p>
          <p>
            This EULA incorporates by reference our{' '}
            <a href="/legal/privacy" className="text-slate-600 hover:text-slate-900 underline transition-colors">
              Privacy Policy
            </a>
            , which explains how we collect, use, and protect your personal information. Any capitalized terms not defined in this EULA have the meanings set forth in our Privacy Policy. If you have any questions about this EULA, contact us at team@heyvoxxy.com.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. License Grant</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>1.1 Limited License.</strong> Subject to your compliance with this EULA, Voxxy grants you a limited, non-exclusive, non-transferable, revocable license to download, install, and use the App on a mobile device that you own or control, solely for your personal, non-commercial use.
            </p>
            <p>
              <strong>1.2 Restrictions.</strong> You may not: (a) copy, modify, or create derivative works of the App; (b) reverse engineer, decompile, or disassemble the App; (c) rent, lease, lend, sell, sublicense, or otherwise transfer the App to any third party; (d) remove, alter, or obscure any proprietary notices on the App; or (e) use the App in any manner that violates applicable law or this EULA.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Age Requirement</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>2.1 Minimum Age.</strong> You must be at least 18 years old to use the App. By using the App, you represent and warrant that you are 18 years of age or older. We do not knowingly collect personal information from individuals under 18. If we learn that we have collected personal information from a user under 18, we will delete that information as quickly as possible.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. Account Registration</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>3.1 Account Creation.</strong> To use certain features of the App, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <p>
              <strong>3.2 Account Security.</strong> You are responsible for safeguarding your account credentials and for any activities or actions taken under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. Use of the App</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              Hey Voxxy is a discovery and planning tool for nightlife and events. You use it to browse events, save favorites, get AI-powered recommendations, and stay up to date with your local scene.
            </p>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>4.1 Purpose of the App.</strong> Hey Voxxy is a mobile application that helps you discover local events, nightlife, and community gatherings. The App allows you to browse upcoming events, receive personalized recommendations, save favorite events, and get updates about events you're interested in.
            </p>
            <p>
              <strong>4.2 Contact Access.</strong> If you grant the App permission to access your device's contacts, we may use this information to help you discover which of your contacts are attending events or to facilitate social features within the App. You can revoke this permission at any time through your device settings. See our{' '}
              <a href="/legal/privacy" className="text-slate-600 hover:text-slate-900 underline transition-colors">
                Privacy Policy
              </a>{' '}
              for details on how we handle contact information.
            </p>
            <p>
              <strong>4.3 Location Services.</strong> The App may request access to your device's location services to provide location-based event recommendations and to show you events near you. You can enable or disable location services at any time through your device settings. Disabling location services may limit certain features of the App.
            </p>
            <p>
              <strong>4.4 AI-Powered Features.</strong> The App includes AI-powered features (such as personalized event recommendations and a conversational assistant) to help you discover events that match your interests. When you interact with AI-powered features, your inputs (such as dining preferences, event interests, and questions you ask) may be processed by OpenAI's services under their data processing terms. We do not share personally identifiable information with OpenAI unless necessary to provide the service you requested. See our{' '}
              <a href="/legal/privacy" className="text-slate-600 hover:text-slate-900 underline transition-colors">
                Privacy Policy
              </a>{' '}
              for more details.
            </p>
            <p>
              <strong>4.5 Acceptable Use.</strong> You agree to use the App in compliance with all applicable laws and regulations and in a manner consistent with our{' '}
              <a href="/legal/acceptable-use" className="text-slate-600 hover:text-slate-900 underline transition-colors">
                Acceptable Use Policy
              </a>
              . You may not use the App to transmit, distribute, or store material that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. Third-Party Services</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>5.1 Event Listings.</strong> The App displays event listings provided by third-party event producers and venues. Voxxy is not responsible for the accuracy, completeness, or quality of third-party event listings, nor are we responsible for any issues that arise from your attendance at third-party events.
            </p>
            <p>
              <strong>5.2 External Links.</strong> The App may contain links to third-party websites or services that are not owned or controlled by Voxxy. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
            <p>
              <strong>5.3 Third-Party Payments.</strong> If you purchase tickets or make payments through the App, those transactions may be processed by third-party payment processors (such as event ticketing platforms). Your use of third-party payment services is subject to their terms and conditions, and Voxxy is not responsible for any issues arising from third-party payment processing.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">6. Intellectual Property</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>6.1 Ownership.</strong> The App and all content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Voxxy, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p>
              <strong>6.2 User Content.</strong> If you submit, post, or transmit any content through the App (such as event reviews, comments, or profile information), you grant Voxxy a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content in connection with operating and promoting the App.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">7. App Store Terms</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              This section covers Apple App Store and Google Play Store specific requirements. If you downloaded Hey Voxxy from an app store, you also agreed to that store's terms when you installed the app.
            </p>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>7.1 Apple App Store.</strong> If you downloaded the App from the Apple App Store, the following additional terms apply:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                This EULA is between you and Voxxy only, not with Apple Inc. ("Apple"). Voxxy, not Apple, is solely responsible for the App and its content.
              </li>
              <li>
                The license granted to you is limited to a non-transferable license to use the App on an Apple-branded product that you own or control and as permitted by the Usage Rules set forth in the Apple Media Services Terms and Conditions.
              </li>
              <li>
                Apple has no obligation to furnish any maintenance and support services with respect to the App.
              </li>
              <li>
                In the event of any failure of the App to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price (if any) for the App to you. To the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the App.
              </li>
              <li>
                Apple is not responsible for addressing any claims by you or any third party relating to the App or your possession and/or use of the App, including but not limited to: (a) product liability claims; (b) any claim that the App fails to conform to any applicable legal or regulatory requirement; and (c) claims arising under consumer protection or similar legislation.
              </li>
              <li>
                In the event of any third-party claim that the App or your possession and use of the App infringes that third party's intellectual property rights, Voxxy, not Apple, will be solely responsible for the investigation, defense, settlement, and discharge of any such intellectual property infringement claim.
              </li>
              <li>
                Apple and Apple's subsidiaries are third-party beneficiaries of this EULA, and upon your acceptance of this EULA, Apple will have the right (and will be deemed to have accepted the right) to enforce this EULA against you as a third-party beneficiary.
              </li>
            </ul>
            <p>
              <strong>7.2 Google Play Store.</strong> If you downloaded the App from the Google Play Store, you agree to comply with Google's then-current Google Play Terms of Service.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">8. Updates and Modifications</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>8.1 App Updates.</strong> Voxxy may from time to time develop and provide updates to the App, which may include upgrades, bug fixes, patches, and other error corrections and/or new features (collectively, "Updates"). Updates may also modify or delete in their entirety certain features and functionality. You agree that Voxxy has no obligation to provide any Updates or to continue to provide or enable any particular features or functionality.
            </p>
            <p>
              <strong>8.2 Automatic Updates.</strong> You may need to update third-party software from time to time in order to use the App. The App may automatically download and install Updates from time to time. These automatic Updates are designed to improve, enhance, and further develop the App and may take the form of bug fixes, enhanced functions, new software modules, or completely new versions.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">9. Term and Termination</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>9.1 Term.</strong> This EULA is effective from the date you first download, install, access, or use the App and will remain in effect until terminated by you or Voxxy.
            </p>
            <p>
              <strong>9.2 Termination by You.</strong> You may terminate this EULA at any time by deleting the App from your device and discontinuing all use of the App.
            </p>
            <p>
              <strong>9.3 Termination by Voxxy.</strong> Voxxy may terminate or suspend your access to the App at any time, with or without cause, with or without notice, effective immediately. If we terminate or suspend your access for cause, you will not be entitled to any refund of amounts paid (if any).
            </p>
            <p>
              <strong>9.4 Effect of Termination.</strong> Upon termination of this EULA, your right to use the App will immediately cease, and you must delete all copies of the App from your device. Sections 6 (Intellectual Property), 10 (Disclaimers), 11 (Limitation of Liability), 12 (Indemnification), and 13 (Dispute Resolution) will survive any termination of this EULA.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">10. Disclaimers</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              This is the standard "no warranties" section required by law. In plain language: we provide the app as-is, and we can't guarantee it will always work perfectly or meet your specific needs.
            </p>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, VOXXY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              VOXXY DOES NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. VOXXY DOES NOT WARRANT THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY INFORMATION PROVIDED THROUGH THE APP, INCLUDING EVENT LISTINGS, RECOMMENDATIONS, OR AI-GENERATED CONTENT.
            </p>
            <p>
              VOXXY IS NOT RESPONSIBLE FOR ANY EVENTS LISTED IN THE APP, INCLUDING THE ACCURACY OF EVENT INFORMATION, THE QUALITY OF EVENTS, OR ANY HARM THAT MAY RESULT FROM YOUR ATTENDANCE AT EVENTS.
            </p>
          </div>
        </section>

        {/* Section 11 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">11. Limitation of Liability</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              This section limits how much we can be held liable for if something goes wrong. The caps exist to keep our legal risk manageable so we can continue operating the service.
            </p>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL VOXXY, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE APP, EVEN IF VOXXY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, VOXXY'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THIS EULA OR YOUR USE OF THE APP WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO VOXXY FOR USE OF THE APP IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
            </p>
            <p>
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN WARRANTIES OR DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU. IN SUCH JURISDICTIONS, VOXXY'S LIABILITY WILL BE LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.
            </p>
          </div>
        </section>

        {/* Section 12 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">12. Indemnification</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              You agree to indemnify, defend, and hold harmless Voxxy, its affiliates, officers, directors, employees, agents, suppliers, and licensors from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or related to: (a) your use of the App; (b) your violation of this EULA; (c) your violation of any rights of another party, including any event producers or other users; or (d) your violation of any applicable laws or regulations.
            </p>
          </div>
        </section>

        {/* Section 13 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">13. Dispute Resolution</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              If we have a legal dispute, we'll try to resolve it through binding arbitration rather than going to court. This is faster and cheaper for everyone.
            </p>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>13.1 Informal Resolution.</strong> If you have a dispute with Voxxy, you agree to first contact us at team@heyvoxxy.com and attempt to resolve the dispute informally. We will attempt to resolve the dispute informally by contacting you via email. If a dispute is not resolved within thirty (30) days of submission, you or Voxxy may bring a formal proceeding.
            </p>
            <p>
              <strong>13.2 Binding Arbitration.</strong> Except as provided below, you and Voxxy agree that any dispute, claim, or controversy arising out of or relating to this EULA or the App will be settled by binding arbitration administered by the American Arbitration Association ("AAA") in accordance with its Consumer Arbitration Rules. The arbitration will be conducted in New York, New York, or another mutually agreed upon location. Judgment on the arbitration award may be entered in any court having jurisdiction.
            </p>
            <p>
              <strong>13.3 Exceptions to Arbitration.</strong> Either party may seek equitable relief in court for infringement or other misuse of intellectual property rights (such as trademarks, trade secrets, or patents). You or Voxxy may also seek relief in small claims court for disputes or claims within the scope of that court's jurisdiction.
            </p>
            <p>
              <strong>13.4 Class Action Waiver.</strong> YOU AND VOXXY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
            </p>
            <p>
              <strong>13.5 Governing Law.</strong> This EULA and any dispute arising out of or related to it or the App will be governed by the laws of the State of New York, without regard to its conflict of laws principles.
            </p>
          </div>
        </section>

        {/* Section 14 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">14. General Provisions</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>14.1 Entire Agreement.</strong> This EULA, together with our{' '}
              <a href="/legal/privacy" className="text-slate-600 hover:text-slate-900 underline transition-colors">
                Privacy Policy
              </a>
              , constitutes the entire agreement between you and Voxxy regarding the App and supersedes all prior agreements and understandings.
            </p>
            <p>
              <strong>14.2 Amendments.</strong> Voxxy may modify this EULA from time to time. If we make material changes, we will notify you by email or by posting a notice in the App at least thirty (30) days before the changes take effect. Your continued use of the App after the effective date of the revised EULA constitutes your acceptance of the changes.
            </p>
            <p>
              <strong>14.3 Waiver.</strong> No waiver by Voxxy of any term or condition set forth in this EULA will be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition.
            </p>
            <p>
              <strong>14.4 Severability.</strong> If any provision of this EULA is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
            </p>
            <p>
              <strong>14.5 Assignment.</strong> You may not assign or transfer this EULA or any of your rights or obligations under it without Voxxy's prior written consent. Voxxy may assign or transfer this EULA without restriction.
            </p>
            <p>
              <strong>14.6 Force Majeure.</strong> Voxxy will not be liable for any failure or delay in performance due to causes beyond its reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.
            </p>
          </div>
        </section>

        {/* Section 15 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">15. Contact Information</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              If you have any questions about this EULA or the App, please contact us at:
            </p>
            <div className="pl-4">
              <p className="font-semibold">Voxxy AI, Inc.</p>
              <p>Email: <a href="mailto:team@heyvoxxy.com" className="text-slate-600 hover:text-slate-900 underline transition-colors">team@heyvoxxy.com</a></p>
              <p>Brooklyn, New York</p>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
