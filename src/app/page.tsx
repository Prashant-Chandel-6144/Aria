import type { Metadata } from "next";
import LandingNav from "@/components/landing/landing-nav";
import HeroSection from "@/components/landing/hero-section";
import DashboardPreview from "@/components/landing/dashboard-preview";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import IntegrationsSection from "@/components/landing/integrations-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import PricingSection from "@/components/landing/pricing-section";
import FaqCtaSection from "@/components/landing/faq-cta-section";

export const metadata: Metadata = {
  title: "Aria — AI-Powered Email & Productivity Assistant",
  description:
    "Aria connects your Gmail, Google Calendar, GitHub, and Slack into one intelligent AI workspace. Triage emails, compose faster, and reclaim hours every week.",
  keywords: ["AI email", "email assistant", "Gmail AI", "productivity", "inbox management"],
  openGraph: {
    title: "Aria — AI-Powered Email & Productivity Assistant",
    description:
      "Connect your Gmail, Calendar, GitHub, and Slack. Let AI handle the noise — you focus on what matters.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqCtaSection />
    </div>
  );
}
