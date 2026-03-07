import React from "react";
import Header from "../../reference_folder/components/header";
import HeroSection from "../../reference_folder/components/hero-section";
import FeatureCards from "../../reference_folder/components/feature-cards";
import EffortlessIntegration from "../../reference_folder/components/effortless-integration-updated";
import NumbersThatSpeak from "../../reference_folder/components/numbers-that-speak";
import DocumentationSection from "../../reference_folder/components/documentation-section";
import TestimonialsSection from "../../reference_folder/components/testimonials-section";
import FAQSection from "../../reference_folder/components/faq-section";
import PricingSection from "../../reference_folder/components/pricing-section";
import CTASection from "../../reference_folder/components/cta-section";
import FooterSection from "../../reference_folder/components/footer-section";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeatureCards />
        <EffortlessIntegration />
        <NumbersThatSpeak />
        <DocumentationSection />
        <TestimonialsSection />
        <FAQSection />
        <PricingSection />
        <CTASection />
      </main>
      <FooterSection />
    </>
  );
}
