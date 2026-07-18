"use client";

import { useEffect, useState, type FC } from "react";
import { cn } from "@/lib/utils";
import { CHAT_MODELS } from "@/lib/models";
import type { AvailableModel } from "@/app/api/models/route";

type ModelPickerProps = {
  value: string;
  onChange: (modelId: string) => void;
  className?: string;
};

export const ModelPicker: FC<ModelPickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [models, setModels] = useState<AvailableModel[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<{ models: AvailableModel[] }>;
      })
      .then(({ models: fetched }) => {
        if (cancelled) return;
        setModels(fetched);
        const selected = fetched.find((m) => m.id === value);
        const firstAvailable = fetched.find((m) => m.available);
        if ((!selected || !selected.available) && firstAvailable) {
          onChange(firstAvailable.id);
        }
      })
      .catch(() => {
        // If availability can't be determined, list everything; the chat
        // endpoint reports missing keys with a clear error message.
        if (!cancelled) {
          setModels(
            CHAT_MODELS.map(({ id, label }) => ({ id, label, available: true })),
          );
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <select
      value={models ? value : "loading"}
      onChange={(e) => onChange(e.target.value)}
      disabled={!models}
      aria-label="Model"
      className={cn(
        "border-input dark:bg-input/30 h-8 rounded-md border bg-transparent px-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {models ? (
        models.map((model) => (
          <option key={model.id} value={model.id} disabled={!model.available}>
            {model.label}
            {model.available ? "" : " (no API key)"}
          </option>
        ))
      ) : (
        <option value="loading">Loading models...</option>
      )}
    </select>
  );
};
