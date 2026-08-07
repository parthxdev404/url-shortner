import { LinkInput } from "../ui/LinkInput";

export const LandingHome = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden mt-20">
      <section className="flex w-full justify-center px-4 pt-20 sm:px-6 sm:pt-24 md:px-8 md:pt-28 lg:pt-32">
        <main className="flex w-full max-w-6xl flex-col items-center text-center">
          {/* Hero Heading */}
          <div className="max-w-5xl">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-black sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Transform Long{" "}
              <span className="block sm:inline text-blue-500">URLs</span>
              <br className="hidden sm:block" />
              <span className="mt-1 block sm:mt-0">
                into Powerful Short Links.
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="mt-6 w-full max-w-3xl text-base font-medium leading-relaxed text-black/70 sm:mt-7 sm:text-lg md:text-xl lg:text-2xl">
            Generate secure, customizable short links, gain real-time insights
            into your traffic, and organize every link from one place.
          </p>

          {/* Link Input */}
          <div className="mt-8 w-full sm:mt-10">
            <LinkInput />
          </div>
        </main>
      </section>
    </div>
  );
};
