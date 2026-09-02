import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "amber" | "glass";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30",
  amber:
    "border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30",
  secondary:
    "border border-white/15 bg-white/[0.06] text-slate-200 font-medium backdrop-blur-md hover:bg-white/[0.12] hover:text-white hover:border-white/25 shadow-sm",
  glass:
    "border border-white/15 bg-white/[0.06] text-slate-200 font-medium backdrop-blur-md hover:bg-white/[0.12] hover:text-white hover:border-white/25 shadow-sm",
  danger:
    "border border-red-500/30 bg-red-500/15 text-red-300 font-medium backdrop-blur-md hover:bg-red-500/25 hover:border-red-500/50",
  ghost:
    "text-slate-400 hover:text-white hover:bg-white/5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
