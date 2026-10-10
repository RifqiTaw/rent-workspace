import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWorkspaceHydrated, useWorkspaceStore } from "../store/workspace-store";
import type { LineItem, RentalEstimate, WorkspaceConfiguration } from "../types";
import { getLineItems, getRentalEstimate } from "../utils/pricing";

export interface RentalSummary {
  /** False until the persisted configuration has loaded on the client. */
  hydrated: boolean;
  configuration: WorkspaceConfiguration;
  lineItems: LineItem[];
  estimate: RentalEstimate;
}

/** Current configuration plus derived line items and pricing (never stored). */
export function useRentalSummary(): RentalSummary {
  const hydrated = useWorkspaceHydrated();
  const configuration = useWorkspaceStore(
    useShallow(({ deskId, chairId, accessories, durationMonths }) => ({
      deskId,
      chairId,
      accessories,
      durationMonths,
    })),
  );

  return useMemo(() => {
    const lineItems = getLineItems(configuration);
    return {
      hydrated,
      configuration,
      lineItems,
      estimate: getRentalEstimate(lineItems, configuration.durationMonths),
    };
  }, [hydrated, configuration]);
}
