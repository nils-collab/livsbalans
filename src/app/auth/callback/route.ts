import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  console.log("Auth callback received:", { code: !!code, token_hash: !!token_hash, type });

  const supabase = await createClient();

  // Handle email confirmation
  if (token_hash && type) {
    console.log("Verifying OTP with token_hash and type:", type);
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "invite" | "magiclink" | "email_change",
    });
    if (error) {
      console.error("OTP verification error:", error.message);
    } else {
      console.log("OTP verification successful, redirecting to:", next);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle OAuth callback
  if (code) {
    console.log("Exchanging code for session");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Code exchange error:", error.message);
    } else {
      console.log("Code exchange successful, redirecting to:", next);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  console.log("Auth failed, redirecting to error page");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}




