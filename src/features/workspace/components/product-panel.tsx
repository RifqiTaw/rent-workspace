"use client";

import { useShallow } from "zustand/react/shallow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACCESSORIES, CHAIRS, DESKS } from "../data/catalog";
import { getAccessoryCapacity } from "../data/preview-layout";
import { useWorkspaceHydrated, useWorkspaceStore } from "../store/workspace-store";
import type { Product } from "../types";
import { getAccessoryLimit } from "../utils/configuration";
import { AccessoryCard } from "./accessory-card";
import { SelectableProductCard } from "./selectable-product-card";

type Category = "desk" | "chair" | "accessory";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "desk", label: "Desks" },
  { value: "chair", label: "Chairs" },
  { value: "accessory", label: "Accessories" },
];

const CARD_GRID = "grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-1";

function SingleChoiceList({
  legend,
  name,
  products,
  selectedId,
  disabled,
  onSelect,
}: {
  legend: string;
  name: string;
  products: readonly Product[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">{legend}</legend>
      <div className={CARD_GRID}>
        {products.map((product) => (
          <SelectableProductCard
            key={product.id}
            product={product}
            name={name}
            checked={product.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function ProductPanel() {
  const hydrated = useWorkspaceHydrated();
  const { deskId, chairId, accessories } = useWorkspaceStore(
    useShallow(({ deskId, chairId, accessories }) => ({ deskId, chairId, accessories })),
  );
  const selectDesk = useWorkspaceStore((state) => state.selectDesk);
  const selectChair = useWorkspaceStore((state) => state.selectChair);
  const setAccessoryQuantity = useWorkspaceStore((state) => state.setAccessoryQuantity);

  // Until persisted state loads, show nothing as selected so the UI never
  // flashes the defaults over the user's saved configuration.
  const accessoryCount = hydrated
    ? Object.values(accessories).reduce((sum, quantity) => sum + quantity, 0)
    : 0;
  const status: Record<Category, string | null> = {
    desk: hydrated && deskId ? "1" : null,
    chair: hydrated && chairId ? "1" : null,
    accessory: accessoryCount > 0 ? String(accessoryCount) : null,
  };

  return (
    <Tabs defaultValue="desk" className="gap-4">
      <TabsList className="h-10! w-full">
        {CATEGORIES.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="gap-1.5 px-2">
            {label}
            {status[value] && (
              <span className="rounded-full bg-brand px-1.5 text-[0.7rem] leading-4 font-semibold text-brand-foreground tabular-nums">
                <span className="sr-only">, selected: </span>
                {status[value]}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="desk">
        <SingleChoiceList
          legend="Choose a desk"
          name="desk"
          products={DESKS}
          selectedId={hydrated ? deskId : null}
          disabled={!hydrated}
          onSelect={selectDesk}
        />
      </TabsContent>

      <TabsContent value="chair">
        <SingleChoiceList
          legend="Choose a chair"
          name="chair"
          products={CHAIRS}
          selectedId={hydrated ? chairId : null}
          disabled={!hydrated}
          onSelect={selectChair}
        />
      </TabsContent>

      <TabsContent value="accessory">
        <div className={CARD_GRID}>
          {ACCESSORIES.map((product) => (
            <AccessoryCard
              key={product.id}
              product={product}
              quantity={hydrated ? (accessories[product.id] ?? 0) : 0}
              limit={getAccessoryLimit(product.id, accessories)}
              capacity={getAccessoryCapacity(product.kind)}
              disabled={!hydrated}
              onQuantityChange={(quantity) => setAccessoryQuantity(product.id, quantity)}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
