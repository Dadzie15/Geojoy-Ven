"use client";

import { useState, type KeyboardEvent } from "react";
import { controlClasses } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export type PriceBounds = { min: number; max: number };

type PriceRangeFieldProps = {
  idPrefix: string;
  bounds: PriceBounds;
  /** Applied values in whole cedis; undefined means "no limit". */
  min?: number;
  max?: number;
  onChange: (min: number | undefined, max: number | undefined, source: "slider" | "input") => void;
};

// Thumb: 24 px visible, 44 px hit area (transparent 10 px border, background clipped to the padding box).
const thumb =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:size-11 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[10px] [&::-webkit-slider-thumb]:border-transparent [&::-webkit-slider-thumb]:bg-brown [&::-webkit-slider-thumb]:bg-clip-padding focus-visible:[&::-webkit-slider-thumb]:bg-brown-light " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:size-11 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[10px] [&::-moz-range-thumb]:border-transparent [&::-moz-range-thumb]:bg-brown [&::-moz-range-thumb]:bg-clip-padding " +
  "[&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent";

const rangeClasses = cn(
  "pointer-events-none absolute inset-0 h-11 w-full cursor-pointer appearance-none bg-transparent",
  thumb,
);

/** Range slider with two thumbs plus min / max inputs, in whole cedis. Values at a bound mean "no limit". */
export function PriceRangeField({ idPrefix, bounds, min, max, onChange }: PriceRangeFieldProps) {
  const low = min ?? bounds.min;
  const high = max ?? bounds.max;
  const span = Math.max(bounds.max - bounds.min, 1);

  // The inputs keep what is being typed; they commit on blur or Enter.
  const [typed, setTyped] = useState<{ min: string; max: string } | null>(null);
  const shownMin = typed?.min ?? String(low);
  const shownMax = typed?.max ?? String(high);

  const limit = (value: number, bound: number) => (value === bound ? undefined : value);
  const clamp = (value: number) => Math.min(Math.max(value, bounds.min), bounds.max);

  function commitTyped() {
    if (!typed) return;
    const parse = (text: string, fallback: number) => {
      const value = Number.parseInt(text, 10);
      return Number.isFinite(value) ? clamp(value) : fallback;
    };
    let nextMin = parse(typed.min, bounds.min);
    let nextMax = parse(typed.max, bounds.max);
    if (nextMin > nextMax) [nextMin, nextMax] = [nextMax, nextMin];
    setTyped(null);
    onChange(limit(nextMin, bounds.min), limit(nextMax, bounds.max), "input");
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTyped();
    }
  }

  const position = (value: number) => ((value - bounds.min) / span) * 100;
  const singlePrice = bounds.min === bounds.max;

  return (
    <div className="flex flex-col gap-3">
      {!singlePrice && (
        <div className="relative h-11">
          {/* The track is inset by half a hit area so the fill lines up with the thumb centres. */}
          <div aria-hidden="true" className="absolute inset-x-5.5 top-1/2 h-0.5 -translate-y-1/2 bg-line">
            <div
              className="absolute inset-y-0 -my-px bg-brown"
              style={{ left: `${position(low)}%`, right: `${100 - position(high)}%` }}
            />
          </div>
          <input
            type="range"
            aria-label="Minimum price"
            aria-valuetext={`₵${low}`}
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={low}
            onChange={(event) => onChange(limit(Math.min(Number(event.target.value), high), bounds.min), max, "slider")}
            // When the thumbs meet near the top, keep the minimum thumb on top so it can still be moved.
            className={cn(rangeClasses, low > bounds.max - span / 10 && "z-10")}
          />
          <input
            type="range"
            aria-label="Maximum price"
            aria-valuetext={`₵${high}`}
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={high}
            onChange={(event) => onChange(min, limit(Math.max(Number(event.target.value), low), bounds.max), "slider")}
            className={rangeClasses}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {(["min", "max"] as const).map((key) => (
          <div key={key} className="relative">
            <label htmlFor={`${idPrefix}-${key}`} className="sr-only">
              {key === "min" ? "Minimum price in cedis" : "Maximum price in cedis"}
            </label>
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink">
              ₵
            </span>
            <input
              id={`${idPrefix}-${key}`}
              name={key}
              type="number"
              inputMode="numeric"
              min={bounds.min}
              max={bounds.max}
              step={1}
              value={key === "min" ? shownMin : shownMax}
              onChange={(event) =>
                setTyped({ min: shownMin, max: shownMax, [key]: event.target.value })
              }
              onBlur={commitTyped}
              onKeyDown={onInputKeyDown}
              className={cn(controlClasses(false), "rounded-input pl-[1.4rem]")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
