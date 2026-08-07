import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is LinkForge?",
    answer:
      "LinkForge is a simple URL shortening platform that turns long URLs into short, clean, and shareable links. You can also manage your links and view useful analytics.",
  },
  {
    question: "Is LinkForge really free?",
    answer:
      "Yes. LinkForge is completely free to use. There are no subscriptions, hidden charges, or credit card requirements.",
  },
  {
    question: "Do I need an account to shorten a URL?",
    answer:
      "You can create short links directly from the platform. Creating an account gives you access to additional link management and analytics features.",
  },
  {
    question: "Can I create custom short links?",
    answer:
      "Yes. LinkForge allows you to create customizable short links so you can choose a memorable alias instead of relying on a randomly generated code.",
  },
  {
    question: "Can I track clicks on my links?",
    answer:
      "Yes. LinkForge provides analytics that help you understand how your links are performing, including click activity and other useful traffic insights.",
  },
  {
    question: "Are my shortened links secure?",
    answer:
      "LinkForge is designed with security and reliability in mind. Links are handled through secure infrastructure and can be managed from your account.",
  },
  {
    question: "Can I manage all my links in one place?",
    answer:
      "Yes. Your links can be organized and managed from a central dashboard, making it easier to keep track of everything you have created.",
  },
  {
    question: "How quickly does a shortened link work?",
    answer:
      "Short links are generated within seconds, and visitors are redirected through LinkForge's optimized redirect system.",
  },
];

export const LandingFaq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faqs"
      className="w-full px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
            FAQs
          </p>

          <h2 className="text-4xl font-bold leading-tight tracking-tight text-black sm:text-5xl md:text-6xl">
            Questions?
            <span className="block text-black/40">We've got answers.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg md:text-xl">
            Everything you need to know about LinkForge and how it works.
          </p>
        </div>

        {/* FAQ List */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-black/10 bg-white sm:mt-16">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="border-b border-black/10 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-black/[0.02] sm:px-7 sm:py-6"
                >
                  <span className="text-base font-semibold tracking-tight text-black sm:text-lg">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <FaChevronDown className="text-xs" />
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-6 pr-16 text-sm leading-relaxed text-black/60 sm:px-7 sm:pb-7 sm:pr-20 sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center sm:mt-14">
          <p className="text-sm text-black/50 sm:text-base">
            Ready to create your first short link?
          </p>

          <Link
            to="/register"
            className="mt-4 inline-flex rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-black/80 sm:text-base"
          >
            Get Started — It's Free
          </Link>
        </div>
      </div>
    </section>
  );
};
