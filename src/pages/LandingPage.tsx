import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ModesSection from "@/components/landing/ModesSection";
import StepsSection from "@/components/landing/StepsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <ModesSection />
        <StepsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
