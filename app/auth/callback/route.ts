import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthRedirectPath } from "@/lib/auth/redirect-path";
import { getSafeInternalPath } from "@/lib/auth/safe-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const safeNext = getSafeInternalPath(nextParam);
  const origin = url.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (safeNext) {
          return NextResponse.redirect(`${origin}${safeNext}`);
        }
        const path = await getPostAuthRedirectPath(supabase, user.id);
        return NextResponse.redirect(`${origin}${path}`);
      }

      return NextResponse.redirect(origin);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
