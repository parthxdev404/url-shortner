import {
  FaCheck,
  FaInfinity,
  FaChartLine,
  FaLink,
  FaBolt,
} from "react-icons/fa";

const benefits = [
  {
    icon: FaLink,
    text: "Create short links instantly",
  },
  {
    icon: FaInfinity,
    text: "No subscription or hidden fees",
  },
  {
    icon: FaChartLine,
    text: "Access link analytics",
  },
  {
    icon: FaBolt,
    text: "Fast and reliable redirects",
  },
];

export const LandingPricing = () => {
  return (
    <section
      id="pricing"
      className="w-full px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
            Pricing
          </p>

          <h2 className="text-4xl font-bold leading-tight tracking-tight text-black sm:text-5xl md:text-6xl">
            Simple pricing.
            <span className="block text-black/40">Actually free.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg md:text-xl">
            Everything you need to create and manage powerful short links,
            without a subscription, trial, or credit card.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto mt-12 max-w-2xl sm:mt-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-black p-7 text-white shadow-2xl sm:p-10 md:p-12">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
              Free Forever
            </div>

            {/* Price */}
            <div>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-bold tracking-tight sm:text-7xl">
                  $0
                </span>

                <span className="mb-2 text-sm text-white/50">/ forever</span>
              </div>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
                No credit card. No free trial. No surprise charges. Just
                powerful link management for free.
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-white/10" />

            {/* Benefits */}
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black">
                      <Icon className="text-xs" />
                    </div>

                    <span className="text-sm text-white/75 sm:text-base">
                      {benefit.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <a
              href="/signup"
              className="mt-10 flex h-13 w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/85 sm:text-base"
            >
              Get Started for Free
            </a>

            <p className="mt-4 text-center text-xs text-white/35">
              Start shortening links in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
