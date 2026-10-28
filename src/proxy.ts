import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { PARENT_SESSION_COOKIE } from "@/lib/auth/parent-session-constants";
import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase/config";

function hasVeliSession(request: NextRequest) {
  const token = request.cookies.get(PARENT_SESSION_COOKIE)?.value?.trim();
  return Boolean(token);
}

function handleVeliProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/veli/login";
  const loggedIn = hasVeliSession(request);

  if (!loggedIn && !isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/veli/login";
    redirectUrl.searchParams.set("error", "unauthorized");
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (loggedIn && isLoginRoute) {
    return NextResponse.redirect(new URL("/veli/dashboard", request.url));
  }

  return NextResponse.next();
}

async function handleAdminProxy(request: NextRequest) {
  if (!hasSupabaseConfig()) return NextResponse.next();

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user && !isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && !isAdmin && !isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdmin && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/veli")) {
    return handleVeliProxy(request);
  }

  if (pathname.startsWith("/admin")) {
    return handleAdminProxy(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/veli/:path*"],
};
