import React from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, Scale, CreditCard, ShieldAlert, CheckCircle2, Mail, Ban, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const lastUpdated = "September 1, 2026";

  const handleBack = () => {
    // 1. Explicit 'from' query parameter or route state
    const explicitFrom = searchParams.get("from") || (location.state as any)?.from;
    if (explicitFrom) {
      navigate(explicitFrom);
      return;
    }

    // 2. Document referrer check (if opened from registration / login)
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.origin === window.location.origin) {
          window.location.href = document.referrer;
          return;
        }
      } catch (e) {
        // ignore url parse error
      }
    }

    // 3. Normal history back if available
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    // 4. Default fallback
    navigate("/login");
  };

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "eligibility-account", title: "2. Eligibility & Account Security" },
    { id: "candidate-conduct", title: "3. Candidate Responsibilities" },
    { id: "ai-evaluations", title: "4. AI Scoring & Assessments" },
    { id: "bgv-authorization", title: "5. Background Verification & DigiLocker" },
    { id: "payments-refunds", title: "6. Payments, Pricing & Refund Policy" },
    { id: "intellectual-property", title: "7. Intellectual Property" },
    { id: "prohibited-activities", title: "8. Prohibited Conduct" },
    { id: "disclaimers-liability", title: "9. Disclaimers & Limitation of Liability" },
    { id: "termination", title: "10. Account Suspension & Termination" },
    { id: "governing-law", title: "11. Governing Law & Jurisdiction" },
    { id: "contact-support", title: "12. Contact & Grievance" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Link to="/" className="flex items-center">
              <img src="/aimploy-logo.png" alt="Aimploy" className="h-7 object-contain" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b bg-muted/30 py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            User Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Aimploy Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Please review these terms carefully before accessing or using the Aimploy candidate platform,
            AI resume builder, or applying for jobs.
          </p>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 space-y-2 p-4 rounded-xl border bg-card/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs font-medium py-1.5 px-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Legal Body */}
          <div className="lg:col-span-3 space-y-10 text-sm leading-relaxed">
            {/* Summary card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  Key Highlights of These Terms
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li>• <strong>Honest Information:</strong> Resumes, credentials, and answers submitted must be authentic and truthful.</li>
                  <li>• <strong>AI Disclaimer:</strong> AI-generated match scores and resume suggestions are assistive screening tools and do not guarantee job placement or employment.</li>
                  <li>• <strong>Payment & Refund Terms:</strong> Paid digital features (such as verification fees or pass access) are billed securely through Razorpay and subject to our transparent cancellation and refund policy.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 1 */}
            <section id="acceptance" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, browsing job opportunities, uploading a resume, or using any services provided by <strong>Aimploy</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) via <strong>candidates.aimploy.org</strong>, you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy. If you do not agree to all terms, you must not use or access this platform.
              </p>
            </section>

            {/* Section 2 */}
            <section id="eligibility-account" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                2. Eligibility & Account Security
              </h2>
              <p>
                You must be at least 18 years of age (or have reached the age of majority in your jurisdiction) to register for an Aimploy candidate account. When registering, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain the confidentiality of your login credentials and password.</li>
                <li>Promptly notify us if you discover or suspect unauthorized access to your account.</li>
                <li>Accept full responsibility for all activities conducted under your account credentials.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="candidate-conduct" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                3. Candidate Responsibilities & Submissions
              </h2>
              <p>
                As a candidate on Aimploy, you represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>All details in your profile, resume, certifications, and work experience represent your genuine qualifications.</li>
                <li>Your resume uploads are clean PDF documents free of malicious code, macros, or viruses.</li>
                <li>You hold all necessary rights to any project portfolios, GitHub links, or code repositories you provide during application.</li>
                <li>You will not submit duplicate applications using fictitious identities or email addresses.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="ai-evaluations" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                4. AI Scoring & Assessments Disclaimer
              </h2>
              <p>
                Aimploy provides automated AI features, including resume skill-matching, job fit scoring, AI resume builders, and automated audio question analysis.
              </p>
              <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground space-y-1.5">
                <p>
                  <strong>No Guarantee of Hiring:</strong> Aimploy is a recruitment facilitation and technology platform. We do not guarantee interview shortlisting, hiring decisions, or job offers. Final hiring decisions rest entirely with prospective employers.
                </p>
                <p>
                  <strong>Assistive Screening:</strong> AI evaluations are indicative assistive tools. Employers are encouraged to review complete candidate credentials before reaching hiring conclusions.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="bgv-authorization" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                5. Background Verification & DigiLocker Authorization
              </h2>
              <p>
                When you initiate background verification (BGV) or authenticate through DigiLocker:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>You authorize Aimploy to verify your credentials against government and educational repositories via accredited APIs.</li>
                <li>You certify that the documents fetched belong solely to you. Providing forged credentials or impersonating another individual is grounds for permanent ban and legal recourse.</li>
              </ul>
            </section>

            {/* Section 6 - Crucial for Razorpay merchant compliance */}
            <section id="payments-refunds" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                6. Payments, Pricing & Refund Policy
              </h2>
              <p>
                Aimploy offers select premium digital features for candidates (such as the Candidate Verification Pass or priority assessments):
              </p>
              
              <div className="space-y-3 pl-2">
                <div className="p-3.5 rounded-lg border bg-card">
                  <h4 className="font-semibold text-foreground text-sm mb-1">A. Transparent Pricing</h4>
                  <p className="text-muted-foreground text-xs">
                    All applicable fees (e.g. ₹10 for the verification pass or as clearly displayed on the checkout screen) are inclusive of applicable taxes. Pricing is displayed prior to payment confirmation.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border bg-card">
                  <h4 className="font-semibold text-foreground text-sm mb-1">B. Payment Processing via Razorpay</h4>
                  <p className="text-muted-foreground text-xs">
                    Payments are handled securely through Razorpay. Accepted methods include UPI, Debit/Credit Cards, and Net Banking. All transactions are encrypted.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border bg-card">
                  <h4 className="font-semibold text-foreground text-sm mb-1">C. Cancellation & Refund Policy</h4>
                  <p className="text-muted-foreground text-xs">
                    Because Aimploy provides immediate digital services and automated verification unlocks:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs mt-1.5">
                    <li><strong>Completed Services:</strong> Digital services that have already been activated or consumed are non-refundable.</li>
                    <li><strong>Failed / Duplicate Transactions:</strong> If your bank account is debited but your pass or feature was not credited due to technical error, your transaction will be automatically reconciled or refunded to your original payment source within 5-7 business days.</li>
                    <li><strong>Refund Inquiries:</strong> If you believe you were charged erroneously, please email <a href="mailto:support@aimploy.org" className="text-primary hover:underline">support@aimploy.org</a> with your Payment ID within 48 hours.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="intellectual-property" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                7. Intellectual Property
              </h2>
              <p>
                The Aimploy name, logos, website layout, algorithms, and design system are proprietary intellectual property of Aimploy. You retain ownership of your personal resumes and uploaded content, granting Aimploy a limited license to host, display, and process your materials solely to deliver recruitment services.
              </p>
            </section>

            {/* Section 8 */}
            <section id="prohibited-activities" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Ban className="w-5 h-5 text-destructive" />
                8. Prohibited Conduct
              </h2>
              <p>You agree that you will not:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Reverse engineer, decompile, scrape, or extract source code or AI models from Aimploy.</li>
                <li>Submit misleading, fraudulent, or impersonated resumes and certificates.</li>
                <li>Attempt to bypass authentication, payment gates, or rate limits.</li>
                <li>Use automated bots or scripts to bulk-apply to job listings.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="disclaimers-liability" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                9. Disclaimers & Limitation of Liability
              </h2>
              <p className="text-muted-foreground text-xs">
                AIMPLOY IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, AIMPLOY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF THE PLATFORM, DELAYS IN HIRING, OR EMPLOYER REJECTIONS.
              </p>
            </section>

            {/* Section 10 */}
            <section id="termination" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Ban className="w-5 h-5 text-primary" />
                10. Account Suspension & Termination
              </h2>
              <p>
                Aimploy reserves the right to suspend or terminate accounts that violate these Terms, provide falsified credentials, or engage in suspicious or abusive activities, with or without prior notice.
              </p>
            </section>

            {/* Section 11 */}
            <section id="governing-law" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                11. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts of law in India.
              </p>
            </section>

            {/* Section 12 */}
            <section id="contact-support" className="space-y-3 scroll-mt-24 pb-8 border-b">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                12. Contact & Grievance Redressal
              </h2>
              <p>
                For questions regarding these Terms, payment assistance, or refund inquiries, please contact:
              </p>
              <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">Aimploy Support & Legal</p>
                <p className="text-muted-foreground text-xs">Email: <a href="mailto:support@aimploy.org" className="text-primary hover:underline">support@aimploy.org</a></p>
                <p className="text-muted-foreground text-xs">Grievances: <a href="mailto:grievance@aimploy.org" className="text-primary hover:underline">grievance@aimploy.org</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Aimploy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors font-medium">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors font-medium">Terms of Service</Link>
            <a href="mailto:support@aimploy.org" className="hover:text-foreground transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
