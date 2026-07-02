"use client";

import { useSyncExternalStore } from "react";

import { getMediaAsset } from "@/lib/browser-api";
import type { MediaAsset } from "@/lib/types";

// Client-side cache of hydrated assets so editor node views can render a
// thumbnail from just an assetId without each one hitting the API. Seeded from
// a post's `media` map on load and appended to when new media is inserted.

const cache = new Map<number, MediaAsset>();
const listeners = new Set<() => void>();
const inflight = new Set<number>();

function emit() {
  for (const listener of listeners) listener();
}

export function addAssets(assets: (MediaAsset | undefined | null)[]) {
  let changed = false;
  for (const asset of assets) {
    if (asset && asset.id != null) {
      cache.set(asset.id, asset);
      changed = true;
    }
  }
  if (changed) emit();
}

export function seedFromMediaMap(map: Record<string, MediaAsset>) {
  addAssets(Object.values(map));
}

function ensureFetched(id: number) {
  if (cache.has(id) || inflight.has(id)) return;
  inflight.add(id);
  getMediaAsset(id)
    .then((asset) => {
      cache.set(id, asset);
      emit();
    })
    .catch(() => {})
    .finally(() => inflight.delete(id));
}

export function useAsset(id: number | null | undefined): MediaAsset | undefined {
  const asset = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (id != null ? cache.get(id) : undefined),
    () => undefined,
  );
  if (id != null && !asset) ensureFetched(id);
  return asset;
}
