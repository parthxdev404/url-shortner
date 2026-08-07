import { FaLink } from "react-icons/fa";

export const LinkInput = () => {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex w-full flex-col gap-3 rounded-2xl border-2 border-black/10 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full">
        {/* Input */}
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:px-4">
          <FaLink className="shrink-0 text-lg text-black/50" />

          <input
            type="url"
            placeholder="Enter or paste a long URL to shorten"
            className="h-12 min-w-0 w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40 sm:text-base"
          />
        </div>

        {/* Button */}
        <button
          type="button"
          className="h-12 w-full shrink-0 rounded-xl bg-black px-6 text-sm font-medium text-white transition-all duration-200 hover:bg-black/80 active:scale-[0.98] sm:w-auto sm:rounded-full sm:px-7 sm:text-base"
        >
          Generate Link — It's Free
        </button>
      </div>
    </div>
  );
};
