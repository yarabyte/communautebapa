import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const ctaVariants = cva(
  "relative inline-flex items-center justify-center gap-2.5 rounded-full text-sm font-medium tracking-[0.02em] whitespace-nowrap transition-all duration-300 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-terre text-[#FFF8EE] shadow-[0_10px_20px_-10px_rgba(156,91,52,0.8)] before:pointer-events-none before:absolute before:inset-[3px] before:rounded-full before:border before:border-[rgba(255,232,190,0.45)] hover:-translate-y-px hover:shadow-[0_14px_24px_-10px_rgba(156,91,52,0.9)]",
        ghostLight: "border border-creme-light/50 text-creme-light backdrop-blur-sm hover:bg-creme-light/10",
        outline: "border border-terre/40 bg-creme-light text-terre-dark hover:border-terre hover:bg-creme-dark",
        dark: "bg-brun text-creme-light hover:bg-nuit",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

type CtaLinkProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof ctaVariants> & { diamond?: boolean }

export function CtaLink({ className, variant, size, diamond, children, ...props }: CtaLinkProps) {
  return (
    <Link className={cn(ctaVariants({ variant, size }), className)} {...props}>
      {diamond && <i aria-hidden className="size-[7px] rotate-45 bg-or-light" />}
      {children}
    </Link>
  )
}
