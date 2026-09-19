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
    "border border-[#0c2e1b] bg-[#0c2e1b] text-[#f0c34e] font-bold shadow-md shadow-[#0c2e1b]/20 hover:bg-[#133e25] hover:border-[#133e25] hover:text-[#fbe58a]",
  amber:
    "border border-[#0c2e1b] bg-[#0c2e1b] text-[#f0c34e] font-bold shadow-md shadow-[#0c2e1b]/20 hover:bg-[#133e25] hover:border-[#133e25] hover:text-[#fbe58a]",
  secondary:
    "border border-[#d2ded5] bg-white text-[#1c3d2b] font-semibold hover:bg-[#edf4ef] shadow-xs",
  glass:
    "border border-[#d2ded5] bg-white text-[#1c3d2b] font-semibold hover:bg-[#edf4ef] shadow-xs",
  danger:
    "border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100",
  ghost:
    "text-[#526b5c] hover:text-[#0c2317] hover:bg-[#eaf2ec]",
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
