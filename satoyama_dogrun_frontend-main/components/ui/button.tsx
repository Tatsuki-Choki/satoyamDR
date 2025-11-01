import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // アシックス里山スタジアムバリアント（比率3:2:1:1:1:1）
        "asics-primary": "bg-asics-satoyama-blue text-white hover:bg-asics-satoyama-blue-600 hover:shadow-lg",
        "asics-secondary": "bg-asics-satoyama-white text-asics-satoyama-blue border-2 border-asics-satoyama-blue hover:bg-asics-satoyama-blue hover:text-white",
        "asics-green": "bg-asics-satoyama-green text-white hover:bg-asics-satoyama-green-600 hover:shadow-lg",
        "asics-gold": "bg-asics-satoyama-gold text-white hover:bg-asics-satoyama-gold-600 hover:shadow-lg",
        "asics-navy": "bg-asics-satoyama-navy text-white hover:bg-asics-satoyama-navy-600 hover:shadow-lg",
        "asics-yellow": "bg-asics-satoyama-yellow text-asics-satoyama-navy font-bold hover:bg-asics-satoyama-yellow-600 hover:shadow-lg",
        
        // FC今治ブランドバリアント（サブ使用）
        "fc-primary": "bg-fc-imabari-navy text-white hover:opacity-90 hover:shadow-lg",
        "fc-cta": "bg-fc-imabari-yellow text-fc-imabari-navy font-bold hover:opacity-90 hover:shadow-lg",
        "fc-secondary": "border-2 border-fc-imabari-navy text-fc-imabari-navy bg-white hover:bg-fc-imabari-navy hover:text-white",
        
        // 旧里山バリアント（下位互換性）
        "satoyama-nature": "bg-asics-satoyama-green text-white font-bold hover:shadow-lg",
        "satoyama-gold": "bg-asics-satoyama-gold text-white hover:opacity-90 hover:shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
