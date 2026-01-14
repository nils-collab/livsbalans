import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";
  const error_param = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  console.log("Auth callback received:", { 
    code: !!code, 
    token_hash: !!token_hash, 
    type,
    error: error_param,
    error_description,
    next
  });

  // Check if Supabase returned an error
  if (error_param) {
    console.error("Supabase auth error:", error_param, error_description);
    const errorUrl = new URL(`${origin}/auth/auth-code-error`);
    errorUrl.searchParams.set("error", error_param);
    if (error_description) {
      errorUrl.searchParams.set("message", error_description);
    }
    return NextResponse.redirect(errorUrl.toString());
  }

  // For PKCE flow with code - redirect to client-side handler
  // The client has the PKCE verifier stored in browser storage
  if (code) {
    console.log("Code received, redirecting to client-side handler");
    const clientUrl = new URL(`${origin}/auth/handle-callback`);
    clientUrl.searchParams.set("code", code);
    clientUrl.searchParams.set("next", next);
    return NextResponse.redirect(clientUrl.toString());
  }

  const supabase = await createClient();

  // Handle email confirmation with token_hash (non-PKCE flow)
  if (token_hash && type) {
    console.log("Verifying OTP with token_hash and type:", type);
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "invite" | "magiclink" | "email_change",
    });
    if (error) {
      console.error("OTP verification error:", error.message, error);
      const errorUrl = new URL(`${origin}/auth/auth-code-error`);
      errorUrl.searchParams.set("error", "otp_error");
      errorUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(errorUrl.toString());
    } else {
      console.log("OTP verification successful, type:", type);
      // For password recovery, redirect to reset password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No valid parameters found
  console.log("No auth parameters found, redirecting to error page");
  const errorUrl = new URL(`${origin}/auth/auth-code-error`);
  errorUrl.searchParams.set("error", "no_params");
  errorUrl.searchParams.set("message", "Inga giltiga autentiseringsparametrar hittades");
  return NextResponse.redirect(errorUrl.toString());
}




