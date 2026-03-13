import type { Metadata } from "next";
import { MetaLabel } from "@/components/meta-label";
import { TagPill } from "@/components/tag-pill";
import { getAllTags } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all tags on tcrei blog",
};

export default async function TagsPage() {
  const supabase = await createClient();
  const tags = (await getAllTags(supabase)).sort((left, right) =>
    left.name.localeCompare(right.name)
  );

  return (
    <main className="mx-auto max-w-layout px-4 py-12 md:px-8">
      <h1 className="mb-8">
        <MetaLabel>All Tags</MetaLabel>
      </h1>

      {tags.length === 0 ? (
        <div className="py-24 text-center">
          <MetaLabel>No tags yet.</MetaLabel>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {tags.map((tag) => (
            <div key={tag.name} className="flex items-center gap-2">
              <TagPill tag={tag.name} />
              <MetaLabel>{tag.count}</MetaLabel>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
