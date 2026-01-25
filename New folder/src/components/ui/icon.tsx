import { cn } from "@/lib/utils"

interface IconProps {
  name: string
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  xs: "text-[14px]",
  sm: "text-[18px]",
  md: "text-[24px]",
  lg: "text-[36px]",
  xl: "text-[48px]",
}

export function Icon({ name, className, size = "md" }: IconProps) {
  return (
    <span className={cn("material-icons", sizeMap[size], className)}>
      {name}
    </span>
  )
}
