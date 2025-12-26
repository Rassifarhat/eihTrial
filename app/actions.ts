"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const getOrigin = async () =>
  (await headers()).get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

const getSafeRedirect = (value?: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";
  const redirectTo = getSafeRedirect(formData.get("redirectTo")?.toString());
  const supabase = await createClient();

  if (!email || !password) {
    const params = new URLSearchParams({
      error: "Email and password required",
      email,
    });
    return redirect(`/sign-in?${params.toString()}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const params = new URLSearchParams({
      error: error.message || "Unable to sign in",
      email,
    });
    return redirect(`/sign-in?${params.toString()}`);
  }

  return redirect(redirectTo);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = await getOrigin();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      error.message || "Could not reset password",
    );
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const redirectTo = getSafeRedirect(formData.get("redirectTo")?.toString());
  const redirectPath = redirectTo || "/reset-password";

  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      redirectPath,
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      redirectPath,
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      redirectPath,
      error.message || "Password update failed",
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return encodedRedirect(
      "error",
      redirectPath,
      "Session expired. Please sign in again.",
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  if (profileError) {
    return encodedRedirect(
      "error",
      redirectPath,
      "Password updated, but profile update failed",
    );
  }

  return encodedRedirect("success", redirectPath, "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const createUserAction = async (formData: FormData) => {
  const emailInput = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const role = formData.get("role")?.toString() || "";
  const specialtyInput = formData.get("specialty")?.toString() || "";
  const redirectPath = "/protected/admin/users";

  const email = emailInput.trim().toLowerCase();
  const specialty = specialtyInput.trim();

  if (!email || !password || !role) {
    return encodedRedirect(
      "error",
      redirectPath,
      "Email, password, and role are required",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    return encodedRedirect("error", redirectPath, "Not authorized");
  }

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    return encodedRedirect(
      "error",
      redirectPath,
      error instanceof Error
        ? error.message
        : "Missing Supabase admin credentials",
    );
  }
  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError) {
    return encodedRedirect("error", redirectPath, createError.message);
  }

  const newUser = created.user;
  if (!newUser) {
    return encodedRedirect("error", redirectPath, "User creation failed");
  }

  let specialtyId: string | null = null;
  if (specialty) {
    const { data: existing, error: specialtyError } = await adminClient
      .from("specialties")
      .select("id")
      .ilike("name", specialty)
      .maybeSingle();

    if (specialtyError) {
      return encodedRedirect(
        "error",
        redirectPath,
        "Specialty lookup failed",
      );
    }

    if (existing?.id) {
      specialtyId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await adminClient
        .from("specialties")
        .insert({ name: specialty })
        .select("id")
        .single();

      if (insertError) {
        return encodedRedirect(
          "error",
          redirectPath,
          "Specialty creation failed",
        );
      }

      specialtyId = inserted.id;
    }
  }

  const { error: profileError } = await adminClient.from("profiles").upsert(
    {
      id: newUser.id,
      email,
      specialty_id: specialtyId,
      must_change_password: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return encodedRedirect("error", redirectPath, profileError.message);
  }

  const { data: roleRow, error: roleError } = await adminClient
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();

  if (roleError || !roleRow) {
    return encodedRedirect("error", redirectPath, "Role not found");
  }

  const { error: userRoleError } = await adminClient
    .from("user_roles")
    .insert({
      user_id: newUser.id,
      role_id: roleRow.id,
    });

  if (userRoleError) {
    return encodedRedirect("error", redirectPath, userRoleError.message);
  }

  return encodedRedirect(
    "success",
    redirectPath,
    "User created. Ask them to reset their password on first sign-in.",
  );
};
