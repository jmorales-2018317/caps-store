"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxCount?: number;
  disabled?: boolean;
};

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  className,
  maxCount,
  disabled,
}: MultiSelectProps) {
  const selectedSet = React.useMemo(() => new Set(value), [value]);

  function toggleOption(optionValue: string) {
    const next = new Set(selectedSet);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onValueChange(Array.from(next));
  }

  const selectedLabels = options
    .filter((o) => selectedSet.has(o.value))
    .map((o) => o.label);

  const triggerLabel =
    selectedLabels.length === 0
      ? placeholder
      : maxCount && selectedLabels.length > maxCount
        ? `${selectedLabels.slice(0, maxCount).join(", ")} +${selectedLabels.length - maxCount}`
        : selectedLabels.join(", ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-between overflow-hidden", className)}
        >
          <span className="truncate text-left">{triggerLabel}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-64 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto p-1">
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted">Sin opciones.</p>
        ) : (
          options.map((option) => {
            const checked = selectedSet.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span>{option.label}</span>
                {checked ? <Check className="size-4" /> : null}
              </button>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
