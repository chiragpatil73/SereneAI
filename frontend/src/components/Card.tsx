import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/70 border border-[var(--color-navy)]/8 p-5",
        className
      )}
      style={{ boxShadow: "var(--shadow-soft)" }}
      {...rest}
    />
  );
}
