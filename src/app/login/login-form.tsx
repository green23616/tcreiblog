"use client";

import { useState } from "react";
import { Github } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  redirect?: string;
  error?: string;
}

type Provider = "github" | "google";

export function LoginForm({ redirect, error }: LoginFormProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  async function signIn(provider: Provider) {
    setLoadingProvider(provider);
    const supabase = createClient();
    const redirectTo =
      window.location.origin +
      "/auth/callback" +
      (redirect ? `?redirect=${encodeURIComponent(redirect)}` : "");

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (oauthError) {
      setLoadingProvider(null);
    }
    // On success, browser navigates to provider — no reset needed
  }

  const isLoading = loadingProvider !== null;

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="border border-destructive p-4 text-destructive text-[10px] font-mono uppercase tracking-label"
        >
          [AUTH_ERROR]: Authentication failed. Please try again.
        </div>
      )}

      <Button
        variant="default"
        className="w-full h-12 uppercase tracking-label"
        onClick={() => signIn("github")}
        disabled={isLoading}
        aria-label="Continue with GitHub"
      >
        <Github className="mr-2 size-4" aria-hidden="true" />
        {loadingProvider === "github"
          ? "Authorizing_Github..."
          : "Continue with GitHub"}
      </Button>

      <Button
        variant="outline"
        className="w-full h-12 uppercase tracking-label"
        onClick={() => signIn("google")}
        disabled={isLoading}
        aria-label="Continue with Google"
      >
        <span
          className="mr-2 size-4 inline-flex items-center justify-center text-xs font-bold font-mono"
          aria-hidden="true"
        >
          G
        </span>
        {loadingProvider === "google"
          ? "Authorizing_Google..."
          : "Continue with Google"}
      </Button>
    </div>
  );
}
