import * as React from "react"

import { cn } from "@/lib/utils"

// カードバリアントの定義
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "fc-primary" | "fc-accent" | "satoyama"
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, ...props }, ref) => {
    const variantStyles = {
      default: "border bg-card",
      "fc-primary": "border-t-4 border-t-fc-imabari-navy bg-white",
      "fc-accent": "border-l-4 border-l-fc-imabari-yellow bg-white",
      satoyama: "border-t-4 border-t-satoyama-green bg-gradient-to-br from-white to-satoyama-green-50",
    }

    const hoverStyles = hover
      ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      : ""

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg text-card-foreground shadow-md overflow-hidden",
          variantStyles[variant],
          hoverStyles,
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// FC今治の波形デザインを持つカードヘッダー
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  wave?: boolean
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, wave = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 p-6",
          wave && "relative",
          className
        )}
        {...props}
      >
        {wave && (
          <div className="absolute inset-0 opacity-5">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 50"
              preserveAspectRatio="none"
            >
              <path
                d="M0,20 Q50,5 100,20 T200,20 L200,50 L0,50 Z"
                fill="currentColor"
                className="text-fc-imabari-navy"
              />
            </svg>
          </div>
        )}
        <div className="relative z-10">{props.children}</div>
      </div>
    )
  }
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-heading font-bold leading-none tracking-tight text-fc-imabari-navy",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
