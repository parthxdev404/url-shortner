import { LandingFaq } from "../../components/layouts/LandingFaq";
import { LandingFeatures } from "../../components/layouts/LandingFeatures";
import { LandingHome } from "../../components/layouts/LandingHome";
import { LandingPricing } from "../../components/layouts/LandingPricing";
import { LandingWorks } from "../../components/layouts/LandingWorks";
import { Navbar } from "../../components/layouts/Navbar";

export const Landing = () => {
  return (
    <>
      <Navbar />
      <LandingHome />
      <LandingFeatures />
      <LandingWorks />
      <LandingPricing />
      <LandingFaq />
    </>
  );
};
