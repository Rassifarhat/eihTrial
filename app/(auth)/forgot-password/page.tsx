import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions";
import {
  FormMessage,
  getMessageFromSearchParams,
} from "@/app/components/FormMessage";

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const message = getMessageFromSearchParams(searchParams);

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/50 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="text-sm text-white/70">
          Remembered your password?{" "}
          <Link className="text-red-300 hover:text-red-200" href="/sign-in">
            Back to sign in
          </Link>
        </p>
      </div>

      <FormMessage message={message} />

      <form action={forgotPasswordAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          Send reset link
        </button>
      </form>
    </div>
  );
}
