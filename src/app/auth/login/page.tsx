"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isInAppBrowser } from "@/lib/utils/browser-detection";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signUpEmailSent, setSignUpEmailSent] = useState(false);
  const [inAppBrowserInfo, setInAppBrowserInfo] = useState<{
    isInApp: boolean;
    appName: string | null;
  }>({ isInApp: false, appName: null });
  const [linkCopied, setLinkCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setInAppBrowserInfo(isInAppBrowser());
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Ange din e-postadress");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (error) throw error;
      setResetEmailSent(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSignUpEmailSent(true);
        setLoading(false);
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Redirect to home page after successful login
        router.push("/");
        return;
      }
      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <Card className="w-full max-w-md relative z-10 shadow-soft border-border rounded-3xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-soft">
              <span className="text-2xl text-white font-bold">和</span>
            </div>
            <span className="text-xl font-heading font-light text-foreground tracking-tight">
              livsbalans.co
            </span>
          </div>
          <CardDescription className="text-muted-foreground">
            Bedöm din livssituation, identifiera orsaker och skapa en målbild för en bättre livsbalans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {signUpEmailSent ? (
            // Sign Up Email Sent Confirmation
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="font-semibold text-lg">Kolla din e-post!</h3>
                <p className="text-sm text-muted-foreground">
                  Vi har skickat ett bekräftelsemail till <strong>{email}</strong>.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 text-left">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Viktigt:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Klicka på länken i mailet för att aktivera kontot</li>
                    <li>Öppna länken i <strong>samma webbläsare</strong> som du skapade kontot i</li>
                    <li>Kolla skräpposten om mailet inte dyker upp</li>
                  </ul>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSignUpEmailSent(false);
                    setIsSignUp(false);
                  }}
                  className="w-full"
                >
                  Tillbaka till inloggning
                </Button>
              </div>
            </div>
          ) : isForgotPassword ? (
            // Forgot Password Form
            <div className="space-y-4">
              {resetEmailSent ? (
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-2xl">✉️</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Om det finns ett konto med e-postadressen <strong>{email}</strong> har vi skickat en länk för att återställa lösenordet.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                    className="w-full"
                  >
                    Tillbaka till inloggning
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold">Glömt lösenord?</h3>
                    <p className="text-sm text-muted-foreground">
                      Ange din e-postadress så skickar vi en återställningslänk.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="din@email.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Skickar..." : "Skicka återställningslänk"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full"
                    disabled={loading}
                  >
                    Tillbaka till inloggning
                  </Button>
                </form>
              )}
            </div>
          ) : (
            // Login/Signup Form
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Lösenord</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Glömt lösenord?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Bearbetar..." : isSignUp ? "Skapa konto" : "Logga in"}
              </Button>
            </form>
          )}

          {!isForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Eller fortsätt med
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {inAppBrowserInfo.isInApp ? (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="h-4 w-4 text-amber-600 dark:text-amber-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                          Google-inloggning blockerad
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Du använder {inAppBrowserInfo.appName || "en app"} som
                          har en inbyggd webbläsare. Google tillåter inte
                          inloggning härifrån av säkerhetsskäl.
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-100/50 dark:bg-amber-900/30 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">Så här gör du:</p>
                      <ol className="list-decimal list-inside space-y-0.5">
                        <li>
                          Tryck på menyn (
                          <span className="font-mono">···</span> eller{" "}
                          <span className="font-mono">⋮</span>)
                        </li>
                        <li>Välj &quot;Öppna i Safari&quot; eller &quot;Öppna i webbläsare&quot;</li>
                      </ol>
                    </div>
                    <Button
                      type="button"
                      onClick={handleCopyLink}
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                      {linkCopied ? (
                        <>
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Kopierad!
                        </>
                      ) : (
                        <>
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Kopiera länk
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                )}
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  {isSignUp
                    ? "Har du redan ett konto? Logga in"
                    : "Har du inget konto? Skapa konto"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




