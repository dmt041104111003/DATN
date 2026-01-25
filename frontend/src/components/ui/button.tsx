import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-block rounded border-none text-center transition-all duration-500 cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 m-[5px]",
  {
    variants: {
      variant: {
        default: "bg-[#3d405b] text-white hover:bg-[#2d3047]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "bg-transparent border-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        link: "bg-transparent underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "text-[17px] py-2 px-4",
        xs: "text-sm py-1 px-3",
        sm: "text-sm py-1.5 px-3",
        lg: "text-lg py-3 px-6",
        icon: "p-0 w-10 h-10",
        "icon-xs": "p-0 w-6 h-6",
        "icon-sm": "p-0 w-8 h-8",
        "icon-lg": "p-0 w-12 h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }), "group")}
      {...props}
    >
      <span className="inline-block relative transition-all duration-500 group-hover:pr-[15px]">
        {children}
        <span className="absolute opacity-0 top-0 -right-[15px] transition-all duration-500 group-hover:opacity-100 group-hover:right-0">
          »
        </span>
      </span>
    </Comp>
  )
}

export { Button, buttonVariants }
