import { Banknote, CreditCard } from "lucide-react"

import type { PaymentMethod } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PaymentMethodIcon({ method, className }: { method: PaymentMethod; className?: string }) {
  const base = cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", className)
  switch (method) {
    case "ORANGE_MONEY":
      return <span className={cn(base, "bg-[#FF7900] text-white")}>OM</span>
    case "MTN_MOMO":
      return <span className={cn(base, "bg-[#FFCC00] text-[#004F71]")}>MoMo</span>
    case "PAYPAL":
      return <span className={cn(base, "bg-[#003087] text-white")}>PP</span>
    case "CARD":
      return (
        <span className={cn(base, "bg-indigo-bapa/10 text-indigo-bapa")}>
          <CreditCard className="size-4" />
        </span>
      )
    case "CASH":
      return (
        <span className={cn(base, "bg-olive/15 text-olive")}>
          <Banknote className="size-4" />
        </span>
      )
  }
}
