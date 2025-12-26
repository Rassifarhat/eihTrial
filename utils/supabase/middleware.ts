import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const INACTIVITY_MS = 30 * 60 * 1000;
const LAST_ACTIVE_COOKIE = "eih_last_active";

const isPublicPath = (pathname: string) => {
  return (
    pathname === "/" ||
    pathname === "/sign-in" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/auth/callback")
  );
};

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const pathname = request.nextUrl.pathname;

  const applyCookies = (target: NextResponse) => {
    response.cookies.getAll().forEach((cookie) => {
      target.cookies.set(cookie);
    });
  };

  if (!user) {
    response.cookies.delete(LAST_ACTIVE_COOKIE);
  }

  if (!user && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api")) {
      const jsonResponse = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
      applyCookies(jsonResponse);
      return jsonResponse;
    }

    const signInUrl = new URL("/sign-in", request.url);
    const redirectTo = `${pathname}${request.nextUrl.search}`;
    signInUrl.searchParams.set("redirect_to", redirectTo);
    const redirectResponse = NextResponse.redirect(signInUrl);
    applyCookies(redirectResponse);
    return redirectResponse;
  }

  if (user) {
    const lastActive = request.cookies.get(LAST_ACTIVE_COOKIE)?.value;
    if (lastActive) {
      const lastActiveMs = Number(lastActive);
      if (!Number.isNaN(lastActiveMs)) {
        const now = Date.now();
        if (now - lastActiveMs > INACTIVITY_MS) {
          await supabase.auth.signOut();
          response.cookies.delete(LAST_ACTIVE_COOKIE);

          if (pathname.startsWith("/api")) {
            const jsonResponse = NextResponse.json(
              { error: "Session expired due to inactivity" },
              { status: 401 },
            );
            applyCookies(jsonResponse);
            return jsonResponse;
          }

          const signInUrl = new URL("/sign-in", request.url);
          signInUrl.searchParams.set(
            "error",
            "Session expired due to inactivity. Please sign in again.",
          );
          const redirectResponse = NextResponse.redirect(signInUrl);
          applyCookies(redirectResponse);
          return redirectResponse;
        }
      }
    }
  }

  if (user && pathname !== "/protected/reset-password") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .maybeSingle();

    if (!profileError && profile?.must_change_password) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "Password change required" },
          { status: 403 },
        );
      }

      const resetUrl = new URL("/protected/reset-password", request.url);
      resetUrl.searchParams.set(
        "error",
        "Password change required to continue.",
      );
      return NextResponse.redirect(resetUrl);
    }
  }

  if (user) {
    response.cookies.set(LAST_ACTIVE_COOKIE, Date.now().toString(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.ceil(INACTIVITY_MS / 1000),
    });
  }

  return response;
};
