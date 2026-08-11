import { type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clipboard,
  ExternalLink,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { urlService } from "../../services/urlService";

type CreateLinkProps = {
  onCreated?: () => Promise<void> | void;
};

export const CreateLink = ({ onCreated }: CreateLinkProps) => {
  const navigate = useNavigate();

  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    if (!originalUrl.trim()) {
      setError("Please enter a destination URL.");
      return;
    }

    try {
      new URL(originalUrl.trim());
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await urlService.createShortUrl({
        originalUrl: originalUrl.trim(),
        ...(customAlias.trim()
          ? {
              customAlias: customAlias.trim(),
            }
          : {}),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to create short URL.");
      }

      const shortUrl = `${import.meta.env.VITE_API_BASE_URL}/urls/${response.data.shortCode}`;

      setCreatedUrl(shortUrl);

      await onCreated?.();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your link.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!createdUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the short URL.");
    }
  };

  const handleCreateAnother = () => {
    setOriginalUrl("");
    setCustomAlias("");
    setCreatedUrl(null);
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Header */}

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#fafafa]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-5xl items-center px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-black/45
              transition
              hover:text-black
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl justify-center px-5 py-12 sm:px-8 lg:py-20">
        <div className="w-full max-w-2xl">
          {!createdUrl ? (
            <>
              {/* Heading */}

              <div className="mb-10">
                <div
                  className="
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    text-white
                  "
                >
                  <Link2 className="h-5 w-5" />
                </div>

                <h1 className="text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
                  Create a short link
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-black/45 sm:text-base">
                  Turn a long URL into a clean, shareable LinkForge link.
                </p>
              </div>

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="
                  rounded-[2rem]
                  border
                  border-black/[0.07]
                  bg-white
                  p-6
                  shadow-[0_20px_60px_rgba(0,0,0,0.04)]
                  sm:p-8
                "
              >
                {/* Original URL */}

                <div>
                  <label
                    htmlFor="originalUrl"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Destination URL
                  </label>

                  <input
                    id="originalUrl"
                    type="url"
                    value={originalUrl}
                    onChange={(event) => setOriginalUrl(event.target.value)}
                    placeholder="https://example.com/your-long-url"
                    autoComplete="url"
                    disabled={isSubmitting}
                    className="
                      h-13
                      w-full
                      rounded-2xl
                      border
                      border-black/[0.09]
                      bg-[#fafafa]
                      px-4
                      text-sm
                      outline-none
                      transition
                      placeholder:text-black/25
                      focus:border-black/25
                      focus:bg-white
                    "
                  />

                  <p className="mt-2 text-xs text-black/35">
                    The URL users will be redirected to.
                  </p>
                </div>

                {/* Custom Alias */}

                <div className="mt-7">
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="customAlias"
                      className="text-sm font-semibold"
                    >
                      Custom alias
                    </label>

                    <span className="text-xs text-black/30">Optional</span>
                  </div>

                  <div className="flex overflow-hidden rounded-2xl border border-black/[0.09] bg-[#fafafa] focus-within:border-black/25 focus-within:bg-white">
                    <span className="flex items-center border-r border-black/[0.07] px-4 text-sm text-black/35">
                      localhost:5000/
                    </span>

                    <input
                      id="customAlias"
                      type="text"
                      value={customAlias}
                      onChange={(event) => setCustomAlias(event.target.value)}
                      placeholder="my-link"
                      autoComplete="off"
                      disabled={isSubmitting}
                      className="
                        h-13
                        min-w-0
                        flex-1
                        bg-transparent
                        px-4
                        text-sm
                        outline-none
                        placeholder:text-black/25
                      "
                    />
                  </div>

                  <p className="mt-2 text-xs text-black/35">
                    Leave empty and LinkForge will generate one automatically.
                  </p>
                </div>

                {/* Error */}

                {error && (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    mt-8
                    flex
                    h-13
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-black
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-black/85
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating link...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create short link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success */

            <div className="py-10 text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-50
                  text-emerald-600
                "
              >
                <Check className="h-7 w-7" />
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                Link created
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-[-0.045em]">
                Your link is ready
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">
                Your destination has been shortened and is ready to share.
              </p>

              <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-black/[0.07] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 rounded-2xl bg-[#fafafa] p-4">
                  <Link2 className="h-4 w-4 shrink-0 text-black/40" />

                  <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold">
                    {createdUrl}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="
                      flex
                      h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-black
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-black/85
                    "
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>

                  <a
                    href={createdUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      flex
                      h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-black/[0.08]
                      bg-white
                      text-sm
                      font-semibold
                      text-black/70
                      transition
                      hover:border-black/20
                      hover:text-black
                    "
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCreateAnother}
                  className="
                    rounded-full
                    border
                    border-black/[0.08]
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-black/65
                    transition
                    hover:border-black/20
                    hover:text-black
                  "
                >
                  Create another
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="
                    rounded-full
                    bg-black
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-black/85
                  "
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
