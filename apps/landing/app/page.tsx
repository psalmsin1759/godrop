import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServiceTicker from "@/components/home/ServiceTicker";
import Manifesto from "@/components/home/Manifesto";
import Services from "@/components/home/Services";
import HowItWorks from "@/components/home/HowItWorks";
import Stats from "@/components/home/Stats";
import AppShowcase from "@/components/home/AppShowcase";
import Cities from "@/components/home/Cities";
import Reviews from "@/components/home/Reviews";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main>
        <HeroSection />
        <ServiceTicker />
        <Manifesto />
        <Services />
        <HowItWorks />
        <Stats />
        <AppShowcase />
        <Cities />
        <Reviews />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
