import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DescriptionSection from "@/components/DescriptionSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import StatsSection from "@/components/StatsSection";
import PressSection from "@/components/PressSection";
import ReviewsSection from "@/components/ReviewsSection";
import ImpactSection from "@/components/ImpactSection";
import PhoneMockupSection from "@/components/PhoneMockupSection";
import AppFeaturesSection from "@/components/AppFeaturesSection";
import BuiltForSection from "@/components/BuiltForSection";
import CoverageMapSection from "@/components/CoverageMapSection";
import WhySection from "@/components/WhySection";
import BlogTeaserSection from "@/components/BlogTeaserSection";
import FAQSection from "@/components/FAQSection";
import MissionSection from "@/components/MissionSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-[#060606] min-h-screen">
      <Navbar />
      <HeroSection />
      <DescriptionSection />
      <ServicesSection />
      <HowItWorksSection />
      <StatsSection />
      <PressSection />
      <ReviewsSection />
      {/* <ImpactSection /> */}
      <PhoneMockupSection />
      <AppFeaturesSection />
      <BuiltForSection />
      <CoverageMapSection />
      <WhySection />
      <BlogTeaserSection />
      <FAQSection />
      <MissionSection />
      <CTASection />
      <Footer />
    </div>
  );
}
