import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DescriptionSection from "@/components/DescriptionSection";
import StatsSection from "@/components/StatsSection";
import ReviewsSection from "@/components/ReviewsSection";
import PhoneMockupSection from "@/components/PhoneMockupSection";
import BuiltForSection from "@/components/BuiltForSection";
import WhySection from "@/components/WhySection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-[#060606] min-h-screen">
      <Navbar />
      <HeroSection />
      <DescriptionSection />
      <StatsSection />
      <ReviewsSection />
      <PhoneMockupSection />
      <BuiltForSection />
      <WhySection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
