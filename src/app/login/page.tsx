import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { redirect: redirectTo, error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[400px] border border-border p-10">
        <header className="mb-10">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-label block mb-2">
            Verification_Required
          </span>
          <h1 className="text-3xl font-black tracking-display uppercase">
            Author Login
          </h1>
          <p className="text-muted-foreground text-xs font-mono mt-2 uppercase tracking-label">
            Access restricted to platform contributors.
          </p>
        </header>
        <LoginForm redirect={redirectTo} error={error} />
      </div>
    </main>
  );
}
