import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url, website_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const provider = user.identities?.[0]?.provider ?? "oauth";

  return (
    <div className="mx-auto max-w-layout px-4 py-12 md:px-8">
      <h1 className="mb-8 text-xl font-bold tracking-display">Settings</h1>
      <SettingsForm profile={profile} provider={provider} />
    </div>
  );
}
