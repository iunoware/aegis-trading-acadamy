import Hero from "./(components)/Hero";
import MarketTicker from "./(components)/MarketTicker";
import WhyChooseAegis from "./(components)/WhyChooseAegis";
import TrustedBy from "./(components)/TrustedBy";
import LearningJourney from "./(components)/LearningJourney";
import Pricing from "./(components)/Pricing";
import Testimonials from "./(components)/Testimonials";
import Mentors from "./(components)/Mentors";
import Certifications from "./(components)/Certifications";

export default function Home() {
  return (
    <>
      <Hero />
      <MarketTicker />
      <WhyChooseAegis />
      <TrustedBy />
      <LearningJourney />
      <Pricing />
      <Testimonials />
      <Mentors />
      <Certifications />
    </>
  );
}

