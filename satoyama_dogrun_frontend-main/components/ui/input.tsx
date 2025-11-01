import * as React from "react"

import { cn } from "@/lib/utils"

// FC今治ブランドスタイルのインプット
interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "fc-primary" | "satoyama"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border-input focus-visible:ring-ring",
      "fc-primary": "border-fc-imabari-navy/20 focus-visible:ring-fc-imabari-yellow focus-visible:border-fc-imabari-navy",
      satoyama: "border-satoyama-green/30 focus-visible:ring-satoyama-green focus-visible:border-satoyama-green",
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-fc-imabari-navy/40",
          "md:text-sm",
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
