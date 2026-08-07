import { FaLink, FaMagic, FaChartLine } from "react-icons/fa";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: FaLink,
    title: "Paste your URL",
    description:
      "Copy your long URL and paste it into LinkForge. No complicated setup required.",
  },
  {
    number: "02",
    icon: FaMagic,
    title: "Create your short link",
    description:
      "Click generate and instantly get a clean, shareable short link for your URL.",
  },
  {
    number: "03",
    icon: FaChartLine,
    title: "Track your results",
    description:
      "Monitor clicks, traffic, devices, and other insights from your LinkForge dashboard.",
  },
];

export const LandingWorks = () => {
  return (
    <section
      id="how-it-works"
      className="w-full bg-black px-4 py-20 text-white sm:px-6 sm:py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
            How it works
          </p>

          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Short links.
            <span className="block text-white/50">
              Made ridiculously simple.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg md:text-xl">
            From your first URL to detailed analytics, LinkForge keeps the
            entire process fast, simple, and effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-3 md:gap-6">
          {/* Connecting Line */}
          <div className="absolute left-[16.66%] right-[16.66%] top-10 hidden h-px bg-white/15 md:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Icon */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                    <Icon className="text-lg" />
                  </div>
                </div>

                {/* Step Number */}
                <span className="mt-6 text-xs font-semibold tracking-[0.2em] text-white/40">
                  STEP {step.number}
                </span>

                {/* Title */}
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55 sm:text-base">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex justify-center md:mt-20">
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-white/85 sm:px-8 sm:text-base"
          >
            Create Your First Link
          </Link>
        </div>
      </div>
    </section>
  );
};
