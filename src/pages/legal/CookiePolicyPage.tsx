import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LegalLayout from '@/components/legal/LegalLayout'
import { ArrowLeft } from 'lucide-react'

export default function CookiePolicyPage() {
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
          <h1 className="text-4xl font-bold text-foreground">Cookie Policy</h1>
          <p className="text-muted-foreground italic">Last Updated: February 12, 2026</p>
        </div>

        {/* Annotation Box */}
        <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
          <p className="text-slate-700 leading-relaxed">
            This Cookie Policy explains exactly what cookies and similar technologies we use, why we
            use them, and how you can control them. We believe in opt-in tracking — no analytics
            cookies run until you say yes.
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-foreground/80 leading-relaxed">
          <p>
            This Cookie Policy describes how Voxxy AI, Inc. ("Voxxy," "we," "us," or "our") uses
            cookies and similar technologies when you use the Voxxy platform and visit our websites
            (collectively, the "Services"). Any capitalized terms not defined in this Cookie Policy
            have the meanings set forth in our{' '}
            <a
              href="/legal/terms"
              className="text-slate-600 hover:text-slate-900 underline transition-colors"
            >
              Terms of Service
            </a>
            . If you have any questions about this Cookie Policy, contact us at team@heyvoxxy.com.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. What Are Cookies?</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              Cookies are small text files that are placed on your device (computer, tablet, or
              mobile phone) when you visit a website. They are widely used to make websites work
              more efficiently, provide information to site owners, and enable certain features.
              Cookies can be "first-party" (set by us) or "third-party" (set by our service
              providers).
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Our Consent-First Approach</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              We don't track you until you say it's okay. When you visit our site, you'll see a
              consent banner. Only strictly necessary cookies run before you opt in.
            </p>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>2.1 Cookie Consent Banner.</strong> When you first visit our website or
              platform, you will see a cookie consent banner that gives you the choice to accept or
              decline non-essential cookies. We will not activate any analytics, performance, or
              third-party tracking cookies until you have affirmatively opted in through this
              banner.
            </p>
            <p>
              <strong>2.2 Strictly Necessary Cookies.</strong> The only cookies that operate before
              your consent are those strictly necessary for the functioning of the Services, such as
              authentication cookies that keep you logged in and security cookies that protect
              against fraud. These cookies cannot be disabled because the Services would not
              function without them.
            </p>
            <p>
              <strong>2.3 Changing Your Preferences.</strong> You can change your cookie preferences
              at any time by clicking the "Cookie Preferences" link in the footer of our website,
              which will re-display the consent banner and allow you to update your choices.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. Cookies We Use</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              Here's a transparent breakdown of every cookie and tracking technology we use,
              organized by purpose.
            </p>
          </div>

          <div className="space-y-6 text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Category 1: Strictly Necessary
              </h3>
              <p className="mb-4">
                These cookies are essential for the Services to function. They cannot be switched
                off. They are usually set in response to actions you take, such as logging in or
                setting your privacy preferences.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Cookie Name
                      </th>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Purpose
                      </th>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2 font-mono text-sm">
                        session_token
                      </td>
                      <td className="border border-border px-4 py-2">
                        Keeps you logged in and authenticates your session
                      </td>
                      <td className="border border-border px-4 py-2">
                        Session (expires when you close your browser)
                      </td>
                    </tr>
                    <tr className="bg-muted">
                      <td className="border border-border px-4 py-2 font-mono text-sm">
                        csrf_token
                      </td>
                      <td className="border border-border px-4 py-2">
                        Protects against cross-site request forgery attacks
                      </td>
                      <td className="border border-border px-4 py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2 font-mono text-sm">
                        cookie_consent
                      </td>
                      <td className="border border-border px-4 py-2">
                        Stores your cookie consent preferences
                      </td>
                      <td className="border border-border px-4 py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Category 2: Analytics & Performance (Requires Consent)
              </h3>
              <p className="mb-4">
                These cookies help us understand how you use the Services so we can improve them.
                They are only activated after you opt in through the cookie consent banner.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Service
                      </th>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Purpose
                      </th>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Cookie/Identifier
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2">
                        <strong>Mixpanel</strong>
                      </td>
                      <td className="border border-border px-4 py-2">
                        Product analytics and user behavior tracking. Helps us understand which
                        features are used and how we can improve them.
                      </td>
                      <td className="border border-border px-4 py-2 font-mono text-sm">mp_*</td>
                    </tr>
                    <tr className="bg-muted">
                      <td className="border border-border px-4 py-2">
                        <strong>Sentry</strong>
                      </td>
                      <td className="border border-border px-4 py-2">
                        Error monitoring and performance tracking. Captures technical errors so we
                        can fix bugs and improve reliability.
                      </td>
                      <td className="border border-border px-4 py-2 font-mono text-sm">
                        sentry-sc
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">
                        <strong>Cloudflare</strong>
                      </td>
                      <td className="border border-border px-4 py-2">
                        Content delivery, security, and analytics. Protects our site from malicious
                        traffic and improves load times.
                      </td>
                      <td className="border border-border px-4 py-2 font-mono text-sm">
                        __cf_bm, __cfruid
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Category 3: Payment Processing
              </h3>
              <p className="mb-4">
                These cookies are set by our payment processor, Stripe, when you interact with
                payment features. They are necessary for secure payment processing and fraud
                prevention.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Service
                      </th>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Purpose
                      </th>
                      <th className="border border-border px-4 py-2 text-left font-semibold">
                        Cookie/Identifier
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2">
                        <strong>Stripe</strong>
                      </td>
                      <td className="border border-border px-4 py-2">
                        Secure payment processing and fraud detection. Stripe sets these cookies to
                        verify payment information and protect against fraudulent transactions.
                      </td>
                      <td className="border border-border px-4 py-2 font-mono text-sm">
                        __stripe_*
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. Other Tracking Technologies</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>4.1 Pixels.</strong> A pixel (also called a web beacon or tracking pixel) is a
              small piece of code embedded in a web page or email. We may use pixels in our
              marketing emails to understand whether you opened the email or clicked on links within
              it. You can prevent pixel tracking in emails by configuring your email client to not
              load remote images.
            </p>
            <p>
              <strong>4.2 Device Identifiers.</strong> We may use device identifiers (such as your
              device's advertising ID or a unique token generated by the Services) to track,
              analyze, and improve the performance of the Services. These identifiers are subject to
              the same consent requirements as analytics cookies.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. What We Don't Do</h2>

          <div className="bg-white border border-violet-100 rounded-lg p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">
              We keep things simple. No ad tracking, no retargeting, no selling your browsing data.
            </p>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>We do not run advertising on Voxxy.</strong> We do not use advertising
              cookies, retargeting pixels, or partner with advertising networks to show you targeted
              ads on other websites. We do not share your browsing data with advertisers.
            </p>
            <p>
              <strong>We do not sell your data.</strong> As stated in our{' '}
              <a
                href="/legal/privacy"
                className="text-slate-600 hover:text-slate-900 underline transition-colors"
              >
                Privacy Policy
              </a>
              , we do not sell or share your personal information with third parties for their
              marketing purposes.
            </p>
            <p>
              <strong>We do not use cross-site tracking.</strong> We do not track your activity
              across other websites or apps.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">6. Your Choices</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              <strong>6.1 Cookie Consent Banner.</strong> Use our cookie consent banner to accept or
              decline non-essential cookies. You can update your preferences at any time by clicking
              the "Cookie Preferences" link in our website footer.
            </p>
            <p>
              <strong>6.2 Browser Settings.</strong> Most web browsers allow you to control cookies
              through their settings. You can set your browser to block cookies or to alert you when
              a cookie is being set. Note that blocking all cookies may affect the functionality of
              the Services (for example, you may not be able to stay logged in).
            </p>
            <p>
              <strong>6.3 Do Not Track.</strong> Some browsers offer a "Do Not Track" (DNT) feature.
              Because our consent-first approach means no analytics tracking occurs without your
              affirmative opt-in, our Services effectively honor the spirit of DNT by default.
            </p>
            <p>
              <strong>6.4 Third-Party Opt-Outs.</strong> You can also manage your preferences
              directly with our third-party service providers: Mixpanel provides an opt-out
              mechanism at mixpanel.com/optout; Cloudflare's privacy practices are described at
              cloudflare.com/privacypolicy.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">7. Updates to This Cookie Policy</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in the cookies
              we use, changes in technology, or changes in applicable law. We will post the most
              current version on our website. If a modification meaningfully changes how we use
              cookies, we'll notify you by email or by displaying a prominent notice within the
              Services at least thirty (30) days before the changes take effect.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">8. Contact Us</h2>

          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              If you have questions about this Cookie Policy or our use of cookies, please contact
              us at:
            </p>
            <div className="pl-4">
              <p className="font-semibold">Voxxy AI, Inc.</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:team@heyvoxxy.com"
                  className="text-slate-600 hover:text-slate-900 underline transition-colors"
                >
                  team@heyvoxxy.com
                </a>
              </p>
              <p>Brooklyn, New York</p>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
