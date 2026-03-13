"use client";

import { useState } from "react";
import Image from "next/image";
import { updateProfile } from "@/lib/actions";

interface SettingsFormProps {
  profile: {
    username: string;
    display_name: string;
    bio: string;
    avatar_url: string;
    website_url: string;
  };
  provider: string;
}

export function SettingsForm({ profile, provider }: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    setIsPending(true);
    try {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form action={handleSubmit} className="max-w-reading space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="Profile picture"
            width={64}
            height={64}
            unoptimized
            className="rounded-full"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-muted" />
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            Profile Picture
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            From {provider}
          </p>
        </div>
      </div>

      {/* Status messages */}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-foreground">Profile updated.</p>
      )}

      {/* Username */}
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-xs font-medium uppercase tracking-label text-muted-foreground"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={profile.username}
          required
          autoComplete="username"
          spellCheck={false}
          className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          3–30 characters: lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      {/* Display name */}
      <div className="space-y-2">
        <label
          htmlFor="display_name"
          className="text-xs font-medium uppercase tracking-label text-muted-foreground"
        >
          Display Name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name}
          autoComplete="name"
          className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="text-xs font-medium uppercase tracking-label text-muted-foreground"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={profile.bio}
          className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <label
          htmlFor="website_url"
          className="text-xs font-medium uppercase tracking-label text-muted-foreground"
        >
          Website URL
        </label>
        <input
          id="website_url"
          name="website_url"
          type="url"
          defaultValue={profile.website_url}
          placeholder="https://example.com"
          className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Connected accounts */}
      <div className="border-t border-border pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
          Connected Accounts
        </p>
        <p className="text-sm text-foreground capitalize">{provider}</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
