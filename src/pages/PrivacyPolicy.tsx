import React from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, RefreshCw, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
    { id: "introduction", title: "1. Introduction" },
    { id: "information-collected", title: "2. Information We Collect" },
    { id: "ai-audio-processing", title: "3. AI & Audio Interview Processing" },
    { id: "bgv-digilocker", title: "4. DigiLocker & Background Verification" },
    { id: "how-we-use", title: "5. How We Use Your Information" },
    { id: "sharing-disclosure", title: "6. Data Sharing & Disclosure" },
    { id: "payment-security", title: "7. Payment Information & Security" },
    { id: "data-retention", title: "8. Data Retention & Storage" },
    { id: "candidate-rights", title: "9. Your Rights & Choices" },
    { id: "contact-grievance", title: "10. Contact & Grievance Officer" },
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
              <Link to="/terms">Terms of Service</Link>
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
            <Shield className="w-3.5 h-3.5" />
            Privacy & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Aimploy Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            We are committed to protecting your privacy and ensuring your candidate data, resumes,
            and verification credentials remain secure, confidential, and under your control.
          </p>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
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
            {/* Quick summary card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  Key Privacy Highlights
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li>• <strong>Your Data Belongs to You:</strong> We do not sell your personal data or resume details to third-party data brokers.</li>
                  <li>• <strong>Employer Visibility:</strong> Your profile and submitted job applications are only shared with verified employers whose jobs you apply to.</li>
                  <li>• <strong>AI Transparency:</strong> AI analysis of resumes and interview recordings is used solely to assist candidate matching and screening.</li>
                  <li>• <strong>Bank-Grade Encryption:</strong> All sensitive data is secured in transit via TLS 1.3 and at rest via AES-256.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 1 */}
            <section id="introduction" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                1. Introduction
              </h2>
              <p>
                Welcome to <strong>Aimploy</strong> (&quot;Aimploy&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
                Aimploy operates the talent and candidate career platform at <strong>candidates.aimploy.org</strong> and associated recruitment services.
                This Privacy Policy explains how we collect, use, disclose, and safeguard candidate information when you visit our website, build your profile, apply for jobs, utilize our AI Resume Builder, or undertake background verification.
              </p>
              <p>
                By registering on or using Aimploy, you consent to the data collection and processing practices described in this Privacy Policy.
              </p>
            </section>

            {/* Section 2 */}
            <section id="information-collected" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                2. Information We Collect
              </h2>
              <p>We collect information that you directly provide to us, as well as information collected automatically:</p>
              
              <div className="space-y-3 pl-2">
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <h4 className="font-semibold text-foreground text-sm mb-1">A. Account & Profile Information</h4>
                  <p className="text-muted-foreground text-xs">
                    Full name, email address, phone number, password hash, profile photograph, city/location, LinkedIn profile URL, GitHub URL, portfolio links, and preferred job roles.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border">
                  <h4 className="font-semibold text-foreground text-sm mb-1">B. Resume & Career Details</h4>
                  <p className="text-muted-foreground text-xs">
                    Uploaded resumes (PDF format), employment history, education, skill tags, certifications, career objective, and answers to job application questionnaires.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border">
                  <h4 className="font-semibold text-foreground text-sm mb-1">C. Technical & Device Information</h4>
                  <p className="text-muted-foreground text-xs">
                    IP address, browser type, operating system, session tokens, timestamps, and error diagnostics collected to secure authentication and improve app stability.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="ai-audio-processing" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                3. AI & Audio Interview Processing
              </h2>
              <p>
                Aimploy employs artificial intelligence (including Large Language Models via secure APIs) to power candidate job-fit analysis, resume generation, and audio question evaluation:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong>Resume Parsing & Fit Scoring:</strong> Your resume is parsed to extract key skills and evaluate alignment with employer job descriptions.
                </li>
                <li>
                  <strong>Audio Interview Recordings:</strong> When you complete audio screening questions, your audio is securely uploaded, transcribed, and analyzed for question relevance. Your audio recordings are made available only to the hiring team for that job.
                </li>
                <li>
                  <strong>Zero Public AI Training:</strong> Your private candidate information, resume contents, and audio recordings are never used to train public third-party foundational AI models.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="bgv-digilocker" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                4. DigiLocker & Background Verification (BGV)
              </h2>
              <p>
                If you elect to verify your profile or complete employer background verification:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong>Explicit Consent:</strong> DigiLocker authentication is only initiated upon your explicit consent via the official DigiLocker OAuth portal.
                </li>
                <li>
                  <strong>Verified Documents:</strong> We receive verified credentials (such as degree certificates or ID proof) strictly to confirm authenticity.
                </li>
                <li>
                  <strong>No Aadhaar Number Storage:</strong> In compliance with UIDAI regulations and Indian data protection guidelines, we do not store unredacted Aadhaar numbers or raw biometric information.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="how-we-use" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                5. How We Use Your Information
              </h2>
              <p>We process your data for legitimate recruitment and platform operations:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>To maintain your candidate account and verify your identity via email OTP or OAuth.</li>
                <li>To enable you to apply for jobs and submit required portfolios, cover letters, and custom question answers.</li>
                <li>To deliver your application and AI assessment reports to the respective hiring employers.</li>
                <li>To send important transactional notifications (application updates, interview requests, account security alerts).</li>
                <li>To prevent fraud, automated abuse, duplicate accounts, and unauthorized access.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="sharing-disclosure" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                6. Data Sharing & Disclosure
              </h2>
              <p>
                We do not sell, rent, or trade your personal information. We disclose data solely under the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong>Verified Employers:</strong> When you submit an application to a job, the designated recruiters and HR managers gain access to your submitted resume, answers, and contact info.
                </li>
                <li>
                  <strong>Trusted Infrastructure Providers:</strong> Cloud hosting (AWS), database infrastructure, transactional email relays (SMTP/SES), and AI processing partners bound by strict confidentiality and data-processing agreements.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If compelled by applicable law, court order, or government authority to protect vital interests or enforce our platform terms.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="payment-security" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                7. Payment Information & Security
              </h2>
              <p>
                When candidates purchase optional features (such as the Aimploy Verification Pass or premium resume exports):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  All payment transactions are processed securely through <strong>Razorpay Software Private Limited</strong>, a PCI-DSS Level 1 compliant payment gateway.
                </li>
                <li>
                  <strong>Aimploy does not store or process your credit card numbers, debit card PINs, CVVs, or Net Banking credentials on our servers.</strong>
                </li>
                <li>Razorpay handles payment authorization, tokenization, and processing under industry-standard bank security protocols.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="data-retention" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                8. Data Retention & Storage
              </h2>
              <p>
                Your candidate profile and application records are retained for as long as your account remains active or as needed to provide you with recruitment services. You may request account deactivation or data removal at any time by contacting our support team.
              </p>
            </section>

            {/* Section 9 */}
            <section id="candidate-rights" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                9. Your Rights & Choices
              </h2>
              <p>As an Aimploy user, you enjoy several key privacy rights:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong>Access & Update:</strong> You can review, edit, or update your personal information, resume, and experience anytime from your Profile Dashboard.</li>
                <li><strong>Data Deletion:</strong> You can request permanent erasure of your profile and submitted materials.</li>
                <li><strong>Opt-Out of Notifications:</strong> You can manage communication preferences for job alerts and promotional messages.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="contact-grievance" className="space-y-3 scroll-mt-24 pb-8 border-b">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                10. Contact & Grievance Officer
              </h2>
              <p>
                If you have questions, concerns, or complaints regarding this Privacy Policy or our data handling practices, you may contact our Grievance Officer at:
              </p>
              <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">Aimploy Privacy & Compliance Team</p>
                <p className="text-muted-foreground text-xs">Email: <a href="mailto:support@aimploy.org" className="text-primary hover:underline">support@aimploy.org</a></p>
                <p className="text-muted-foreground text-xs">Legal & Grievance: <a href="mailto:grievance@aimploy.org" className="text-primary hover:underline">grievance@aimploy.org</a></p>
                <p className="text-muted-foreground text-xs">Platform: <a href="https://candidates.aimploy.org" className="text-primary hover:underline">candidates.aimploy.org</a></p>
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
