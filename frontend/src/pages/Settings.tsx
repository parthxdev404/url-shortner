import { ArrowLeft, LogOut, ShieldCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export const Settings = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Replace settings with login.
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Header */}

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#fafafa]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-black/50
              transition
              hover:text-black
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <h1 className="text-sm font-semibold">Settings</h1>
        </div>
      </header>

      {/* Content */}

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
            Account
          </p>

          <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em]">
            Settings
          </h2>

          <p className="mt-3 text-sm text-black/45">
            Manage your LinkForge account and security.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account */}

          <section className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04]">
                  <User className="h-4 w-4 text-black/60" />
                </div>

                <div>
                  <h3 className="text-sm font-bold">Account information</h3>

                  <p className="mt-1 text-xs text-black/40">
                    Your LinkForge account details.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-black/[0.06]">
              <SettingRow label="Name" value={user?.name ?? "—"} />

              <SettingRow label="Email" value={user?.email ?? "—"} />

              <SettingRow label="Role" value={user?.role ?? "USER"} />
            </div>
          </section>

          {/* Security */}

          <section className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04]">
                  <ShieldCheck className="h-4 w-4 text-black/60" />
                </div>

                <div>
                  <h3 className="text-sm font-bold">Security</h3>

                  <p className="mt-1 text-xs text-black/40">
                    Manage your account security.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-5
                  py-4
                  text-left
                  transition
                  hover:border-red-300
                  hover:bg-red-100
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100">
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-red-600">
                      Log out
                    </p>

                    <p className="mt-1 text-xs text-red-500/70">
                      Sign out of your LinkForge account.
                    </p>
                  </div>
                </div>

                <LogOut className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

type SettingRowProps = {
  label: string;
  value: string;
};

const SettingRow = ({ label, value }: SettingRowProps) => {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5 sm:px-7">
      <span className="text-xs font-medium uppercase tracking-[0.1em] text-black/35">
        {label}
      </span>

      <span className="truncate text-sm font-medium text-black/70">
        {value}
      </span>
    </div>
  );
};
