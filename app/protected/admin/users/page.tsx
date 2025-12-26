import { createUserAction } from "@/app/actions";
import {
  FormMessage,
  getMessageFromSearchParams,
} from "@/app/components/FormMessage";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const fallbackRoles = ["admin", "doctor", "assistant", "nurse", "allied"];

type SearchParams = Record<string, string | string[] | undefined>;

type Specialty = {
  id: string;
  name: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    redirect("/sign-in?error=Not%20authorized");
  }

  const { data: roleRows } = await supabase
    .from("roles")
    .select("name")
    .order("name");

  const { data: specialties } = await supabase
    .from("specialties")
    .select("id,name")
    .order("name");

  const roles = roleRows?.length
    ? roleRows.map((role) => role.name)
    : fallbackRoles;

  const message = getMessageFromSearchParams(searchParams);

  return (
    <div className="min-h-screen bg-black/90 text-white">
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-white/10 bg-black/50 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Create a user</h1>
            <p className="text-sm text-white/70">
              Admin-only user provisioning with a temporary password.
            </p>
          </div>

          <form action={createUserAction} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Email
              <input
                name="email"
                type="email"
                required
                placeholder="user@example.com"
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Temporary password
              <input
                name="password"
                type="password"
                minLength={6}
                required
                placeholder="Set a temporary password"
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Role
              <select
                name="role"
                required
                defaultValue=""
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
              >
                <option value="" disabled>
                  Select a role
                </option>
                {roles.map((role) => (
                  <option key={role} value={role} className="bg-black">
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Specialty (optional)
              <input
                name="specialty"
                type="text"
                list="specialty-options"
                placeholder="e.g. Cardiology"
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40"
              />
              <datalist id="specialty-options">
                {(specialties || []).map((specialty: Specialty) => (
                  <option key={specialty.id} value={specialty.name} />
                ))}
              </datalist>
            </label>

            <button
              type="submit"
              className="mt-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Create user
            </button>
          </form>

          <FormMessage message={message} />
        </div>
      </div>
    </div>
  );
}
