import {
  FaLink,
  FaChartLine,
  FaShieldAlt,
  FaPen,
  FaBolt,
  FaFolderOpen,
} from "react-icons/fa";

const features = [
  {
    icon: FaLink,
    title: "Shorten Instantly",
    description:
      "Turn long, complicated URLs into clean, memorable links in seconds.",
  },
  {
    icon: FaPen,
    title: "Custom Short Links",
    description:
      "Create branded and meaningful short links that are easy to remember and share.",
  },
  {
    icon: FaChartLine,
    title: "Real-Time Analytics",
    description:
      "Track clicks, traffic sources, devices, and locations with powerful insights.",
  },
  {
    icon: FaShieldAlt,
    title: "Secure by Design",
    description:
      "Keep your links protected with secure redirects and reliable infrastructure.",
  },
  {
    icon: FaBolt,
    title: "Lightning Fast",
    description:
      "Deliver fast redirects with optimized infrastructure and intelligent caching.",
  },
  {
    icon: FaFolderOpen,
    title: "Manage Everything",
    description:
      "Organize, manage, and monitor all your shortened links from one simple dashboard.",
  },
];

export const LandingFeatures = () => {
  return (
    <section
      id="product"
      className="w-full px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-black/50">
            Everything you need
          </p>

          <h2 className="text-4xl font-bold leading-tight tracking-tight text-black sm:text-5xl md:text-6xl">
            More than just
            <span className="block">a shorter URL.</span>
          </h2>

          <p className="mt-5 text-base leading-relaxed text-black/60 sm:text-lg md:text-xl">
            LinkForge gives you the tools to create, manage, analyze, and
            optimize every link you share.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-black/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-xl sm:p-7 lg:p-8"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white transition-transform duration-300 group-hover:scale-105">
                  <Icon className="text-lg" />
                </div>

                {/* Content */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-black/60 sm:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
