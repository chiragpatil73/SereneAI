import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "emergency";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-navy-soft)]",
  secondary: "bg-[var(--color-mint)] text-[var(--color-navy)] hover:bg-[#cfe3d8]",
  ghost: "bg-transparent text-[var(--color-navy)] hover:bg-[var(--color-cream-dim)] border border-[var(--color-navy)]/15",
  emergency: "bg-[var(--color-emergency)] text-white hover:bg-[#a4463f]",
};

const SIZES: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 rounded-lg gap-1.5",
  md: "text-sm px-5 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3.5 rounded-xl gap-2.5",
};

export function Button({ variant = "primary", size = "md", icon, fullWidth, className, children, ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-ring",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
