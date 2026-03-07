# PRD — CodeShelf Developer Blog

## Table of Contents

- [Overview](#overview)
- [Target Users](#target-users)
- [Core Features](#core-features)
- [Explicit Non-Features](#explicit-non-features)
- [Auth Model](#auth-model)
- [Scale Constraints](#scale-constraints)
- [Design Direction](#design-direction)

---

## Overview

A simple developer blog platform for ~10 authors with ~50 posts each. Modern, clean, monochrome aesthetic. Typography-first — no vivid colors, animations, or complex interactions.

## Target Users

- **Authors:** Developers who want a minimal, distraction-free blogging platform with markdown support
- **Readers:** Developers browsing technical blog posts (read-only, no accounts needed)

## Core Features

| Feature | Description |
|---------|-------------|
| OAuth registration | Self-service via Google and GitHub |
| Markdown editor | EasyMDE with preview toggle |
| Post publishing | Public immediately on save (no drafts) |
| Tag system | Authors tag posts; readers filter by tag |
| Author profiles | Display name, bio, avatar, website link |
| Per-author URLs | Each author gets `/@username` |
| Dark mode | System-aware with manual toggle |
| Responsive | Mobile through 4K UHD |

## Explicit Non-Features

These are intentional omissions, not gaps:

- No search
- No comments or reactions
- No draft/private posts
- No categories (tags only)
- No admin dashboard
- No analytics
- No newsletter/email

## Auth Model

- Self-registration via Google and GitHub OAuth (Supabase Auth)
- No admin role — each author manages their own content only
- Profile auto-created on first login via database trigger

## Scale Constraints

- ~10 authors, ~50 posts each (~500 posts total)
- Read-heavy, write-light workload
- No need for full-text search, pagination sufficient

## Design Direction

Extracted from two reference images (see `docs/ref1.jpg`, `docs/ref2.jpg`):

- **Ref 1 (Motion Music letterhead):** Ultra-minimal, monochrome, extreme whitespace, print-media feel
- **Ref 2 (RSC/NASA Mission Overview):** Technical grid, metadata labels, hairline borders, monospaced data

Combined: typography-first, grid-disciplined, generous spacing, monospaced accents, zero shadows, sharp corners. Full token spec in `docs/DESIGN_TOKENS.md`.
