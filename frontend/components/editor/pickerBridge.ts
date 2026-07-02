"use client";

import type { MediaAssetAdmin } from "@/lib/types";

// Bridges editor node views / slash commands (which live outside the React tree
// that owns the modal) to the single MediaPicker rendered by the Editor. Only
// one editor is mounted at a time, so a module singleton is sufficient.

export interface PickerOptions {
  multiple?: boolean;
}

type Opener = (opts: PickerOptions) => Promise<MediaAssetAdmin[] | null>;

let opener: Opener | null = null;

export function registerPicker(fn: Opener | null) {
  opener = fn;
}

export function openMediaPicker(
  opts: PickerOptions = {},
): Promise<MediaAssetAdmin[] | null> {
  if (!opener) return Promise.resolve(null);
  return opener(opts);
}
