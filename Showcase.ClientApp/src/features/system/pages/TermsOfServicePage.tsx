import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f0eee6] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 pb-28">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-[#87867f] hover:text-[#141413] transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Studio</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#cccbc8] pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8e5dc] border border-[#cccbc8] font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-[#d97757]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Legal Framework</span>
          </div>

          <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[#141413]">
            Terms of Service
          </h1>

          <p className="font-serif text-sm text-[#87867f]">
            Last updated: September 2026 &bull; Effective for all Pority creators, visitors, and studios.
          </p>
        </div>

        {/* Editorial Body Content */}
        <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-3xl p-6 sm:p-10 space-y-8 font-serif text-sm text-[#141413]/85 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, browsing public galleries, or uploading architectural documentation to Pority (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              2. Intellectual Property &amp; Moral Rights
            </h2>
            <p>
              Creators retain full ownership, copyright, and moral authorship of all photographs, architectural renders, elevations, and design manuscripts published to their portfolio. Pority does not claim ownership over any creative works.
            </p>
            <p>
              By publishing your projects, you grant Pority a non-exclusive, worldwide license solely to render, index, and display your selected imagery across discovery streams and curated showcases.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              3. Community Standards &amp; Content Integrity
            </h2>
            <p>
              You agree not to upload plagiarized work, uncredited studio assets, malicious payloads, or content that infringes upon the intellectual property of fellow architects. Pority maintains a zero-tolerance policy against unauthorized commercial exploitation and reserves the right to suspend non-compliant accounts.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              4. Verification Badges &amp; Curated Spotlights
            </h2>
            <p>
              The verified checkmark badge represents confirmed professional identity. Badges are granted at the editorial discretion of the Pority curation team upon review of credentials. Pority reserves the right to revoke verification or curated placement in the event of ethical breaches or account impersonation.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              5. Account Security &amp; Storage Quotas
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. Cloud storage allocations on Cloudflare R2 are subject to standard fair-use quotas to preserve platform bandwidth for all practitioners.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
