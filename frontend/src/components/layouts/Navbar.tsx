import { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between rounded-full bg-black px-5 py-3 shadow-lg sm:px-7">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            linkforge
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex lg:gap-9">
            <a
              href="/"
              className="text-sm text-white/80 transition hover:text-white lg:text-base"
            >
              Home
            </a>

            <a
              href="#product"
              className="text-sm text-white/80 transition hover:text-white lg:text-base"
            >
              Product
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-white/80 transition hover:text-white lg:text-base"
            >
              How It Works
            </a>

            <a
              href="#pricing"
              className="text-sm text-white/80 transition hover:text-white lg:text-base"
            >
              Pricing
            </a>

            <a
              href="#faqs"
              className="text-sm text-white/80 transition hover:text-white lg:text-base"
            >
              FAQs
            </a>
          </div>

          {/* Desktop CTA */}
          <Link
            to="/register"
            className="hidden items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 md:inline-flex lg:text-base"
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black md:hidden"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-5 bg-black transition ${
                  isOpen ? "translate-y-1 rotate-45" : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-black transition ${
                  isOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-black transition ${
                  isOpen ? "-translate-y-1 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="mt-3 rounded-3xl bg-black p-5 shadow-xl md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="/"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Home
              </a>

              <a
                href="#product"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Product
              </a>

              <a
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                How It Works
              </a>

              <a
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Pricing
              </a>

              <a
                href="#faqs"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                FAQs
              </a>

              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="mt-3 rounded-full bg-white px-5 py-3 text-center font-medium text-black transition hover:bg-gray-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
