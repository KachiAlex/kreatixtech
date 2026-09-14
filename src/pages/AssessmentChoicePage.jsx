import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, User, Shield, ArrowRight } from 'lucide-react';
import { trackClick } from '../services/analytics';

export default function AssessmentChoicePage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] mb-3">
            Request an Assessment
          </h1>
          <p className="text-[#666] text-lg">
            Choose how you'd like to get started. Both options connect you with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Quick Request */}
          <Link
            to="/request-assessment"
            onClick={() => trackClick('assessment_choice_quick')}
            className="group bg-white rounded-2xl border border-[#E8E5E0] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#F2782E]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F2782E]/10 flex items-center justify-center mb-5">
              <Zap className="h-7 w-7 text-[#F2782E]" />
            </div>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Quick Request</h2>
            <p className="text-[#666] mb-6">
              Submit a request in minutes — no account needed. We'll email you within 24 hours
              with next steps.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <span className="text-green-600 font-bold">✓</span> No registration required
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <span className="text-green-600 font-bold">✓</span> Fast — fill a simple form
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <span className="text-green-600 font-bold">✓</span> Get a confirmation email
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-[#F2782E] font-bold text-sm group-hover:gap-3 transition-all">
              Submit a request <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          {/* Login / Register */}
          <Link
            to="/portal/login"
            onClick={() => trackClick('assessment_choice_portal')}
            className="group bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F2782E]/20 flex items-center justify-center mb-5">
              <User className="h-7 w-7 text-[#F2782E]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Login / Register</h2>
            <p className="text-white/60 mb-6">
              Create an account to track your request, message our team, upload files,
              and view reports — all in one place.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="text-green-400 font-bold">✓</span> Track request status
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="text-green-400 font-bold">✓</span> Message the security team
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="text-green-400 font-bold">✓</span> Upload files & view reports
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-[#F2782E] font-bold text-sm group-hover:gap-3 transition-all">
              Go to portal <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-[#999]">
            Not sure which to choose?{' '}
            <Link to="/contact" className="text-[#F2782E] hover:underline">Contact us</Link>
            {' '}and we'll help you decide.
          </p>
        </div>
      </div>
    </div>
  );
}
