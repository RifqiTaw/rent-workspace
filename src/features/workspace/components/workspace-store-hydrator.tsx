"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "../store/workspace-store";

/** Loads the persisted configuration from localStorage after mount. */
export function WorkspaceStoreHydrator() {
  useEffect(() => {
    void useWorkspaceStore.persist.rehydrate();
  }, []);

  return null;
}
