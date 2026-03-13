"use client";

import { useState, useRef, useId } from "react";

interface TagInputProps {
  initialTags?: string[];
  allTags: string[];
}

export function TagInput({ initialTags = [], allTags }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const addTag = (raw: string) => {
    const tag = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/^-|-$/g, "");
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(",")) {
      addTag(val.slice(0, -1));
    } else {
      setInputValue(val);
    }
  };

  const suggestions = allTags.filter(
    (t) => !tags.includes(t) && t.startsWith(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input type="hidden" name="tags" value={tags.join(",")} />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex max-w-[12rem] items-center gap-1 border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-label text-muted-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          list={listId}
          placeholder="Add tags (press Enter or comma)"
          className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {suggestions.length > 0 && (
          <datalist id={listId}>
            {suggestions.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Lowercase, alphanumeric and hyphens only. Press Enter or comma to add.
      </p>
    </div>
  );
}
