"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and first hydration render, true afterwards (safe for persisted client state). */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
