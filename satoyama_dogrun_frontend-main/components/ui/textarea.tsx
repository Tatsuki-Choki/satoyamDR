import * as React from "react"

import { cn } from "@/lib/utils"

// FC今治ブランドスタイルのテキストエリア
interface TextareaProps extends React.ComponentProps<"textarea"> {
  variant?: "default" | "fc-primary" | "satoyama"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border-input focus-visible:ring-ring",
      "fc-primary": "border-fc-imabari-navy/20 focus-visible:ring-fc-imabari-yellow focus-visible:border-fc-imabari-navy",
      satoyama: "border-satoyama-green/30 focus-visible:ring-satoyama-green focus-visible:border-satoyama-green",
    }

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background transition-all duration-300",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-fc-imabari-navy/40",
          "resize-y",
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
Textarea.displayName = "Textarea"

export { Textarea }
