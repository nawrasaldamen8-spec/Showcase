import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection</span>
          </div>

          <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[#141413]">
            Privacy Policy
          </h1>

          <p className="font-serif text-sm text-[#87867f]">
            Last updated: September 2026 &bull; Clear standards for privacy and data stewardship.
          </p>
        </div>

        {/* Editorial Body Content */}
        <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-3xl p-6 sm:p-10 space-y-8 font-serif text-sm text-[#141413]/85 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              1. Principles of Data Stewardship
            </h2>
            <p>
              Pority is built on respect for creators and their portfolios. We never sell, lease, or monetize your personal identity data to third-party advertisers or data brokers.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account Data:</strong> Email address, unique handle, and name used for authentication and profile presentation.
              </li>
              <li>
                <strong>Portfolio Media:</strong> High-resolution photographs, project sketches, and descriptions uploaded to your studio showcase.
              </li>
              <li>
                <strong>Career Credentials:</strong> Education, experience milestones, and professional licenses voluntarily added to your profile.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              3. Cloud Infrastructure &amp; Encryption
            </h2>
            <p>
              All image and document assets are stored in enterprise-grade Cloudflare R2 object stores with strict transport security encryption (TLS 1.3). Credentials and passwords are encrypted using high-work-factor cryptographic hashing.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#141413]">
              4. Your Rights &amp; Account Erasure
            </h2>
            <p>
              You maintain sovereign control over your data. You may update your profile, export your published portfolio records, or permanently delete your account and all associated assets at any time through Account Settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
