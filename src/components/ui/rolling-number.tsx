import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const STRIP = "0123456789".split("");

/**
 * Visual-only number whose digits roll to their new value. Keep the real value
 * in accessible text next to it: this element is hidden from assistive tech.
 */
export function RollingNumber({ value, className }: { value: string; className?: string }) {
  const chars = value.split("");

  return (
    <span className={cn("rolling", className)} aria-hidden="true">
      {chars.map((char, index) => {
        // Keyed from the right so units stay put when the integer part grows.
        const key = chars.length - index;
        if (!/\d/.test(char)) {
          return (
            <span key={`s${key}`} className="rolling-static">
              {char}
            </span>
          );
        }
        return (
          <span
            key={`d${key}`}
            className="rolling-digit"
            style={{ "--d": Number(char), "--i": Math.min(index, 6) } as CSSProperties}
          >
            <span className="rolling-strip">
              {STRIP.map((digit) => (
                <span key={digit}>{digit}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
