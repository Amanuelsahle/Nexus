import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // 1. Initialize the Supabase client for edge proxying
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value),
          );
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 2. Safely grab the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3. Your custom auth routing logic
  const authPaths = ["/auth/login", "/auth/register"];
  const isAuthPath = authPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  // Only redirect if authenticated and trying to access auth routes
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

// Kept your matcher configuration identical
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
