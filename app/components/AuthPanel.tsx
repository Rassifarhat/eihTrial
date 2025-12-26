import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";

export default async function AuthPanel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 text-sm">
      {user ? (
        <>
          <Link
            href="/protected/reset-password"
            className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-white backdrop-blur transition hover:border-white/40 hover:bg-black/70"
          >
            Change password
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-white backdrop-blur transition hover:border-white/40 hover:bg-black/70"
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/sign-in"
            className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-white backdrop-blur transition hover:border-white/40 hover:bg-black/70"
          >
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}
