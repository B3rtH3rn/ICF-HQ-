import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on every request (except static assets, see matcher below).
 * Three jobs:
 *  1. Refresh the Supabase session cookie so it doesn't silently expire.
 *  2. Redirect signed-out visitors away from /dashboard before it renders.
 *  3. Redirect anyone who isn't role="admin" away from /admin before it
 *     renders. The role lookup only runs for /admin requests — every other
 *     route still costs just the one getUser() call, same as before.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

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
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboardPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (!user && isDashboardPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminPath) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Only reached for /admin requests — every other route never pays for
    // this extra round-trip. RLS ("Users can view their own role") lets
    // this succeed with the anon key; a missing or non-admin row both read
    // as "not admin" below.
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleRow?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|mini-apps|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
