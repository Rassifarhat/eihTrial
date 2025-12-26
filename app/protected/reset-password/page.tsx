import { resetPasswordAction } from "@/app/actions";
import {
  FormMessage,
  getMessageFromSearchParams,
} from "@/app/components/FormMessage";

export default function ProtectedResetPassword({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const message = getMessageFromSearchParams(searchParams);

  return (
    <div className="min-h-screen bg-black/90 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-white/10 bg-black/50 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Reset your password</h1>
            <p className="text-sm text-white/70">
              Set a new password to continue.
            </p>
          </div>

          <FormMessage message={message} />

          <form action={resetPasswordAction} className="mt-6 flex flex-col gap-4">
            <input
              type="hidden"
              name="redirectTo"
              value="/protected/reset-password"
            />
            <label className="flex flex-col gap-2 text-sm">
              New password
              <input
                name="password"
                type="password"
                required
                placeholder="New password"
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40"
              />
            </label>

            <button
              type="submit"
              className="mt-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Update password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
