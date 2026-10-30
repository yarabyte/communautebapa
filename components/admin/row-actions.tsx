"use client"

import { Fragment } from "react"
import Link from "next/link"
import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type RowAction = {
  label: string
  icon?: LucideIcon
  href?: string
  toast?: string
  onSelect?: () => void
  destructive?: boolean
  separator?: boolean
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {actions.map((a) => {
          const Icon = a.icon
          const content = (
            <>
              {Icon && <Icon />} {a.label}
            </>
          )
          return (
            <Fragment key={a.label}>
              {a.separator && <DropdownMenuSeparator />}
              {a.href ? (
                <DropdownMenuItem asChild>
                  <Link href={a.href}>{content}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant={a.destructive ? "destructive" : "default"}
                  onSelect={() => {
                    a.onSelect?.()
                    if (a.toast) toast.success(a.toast)
                  }}
                >
                  {content}
                </DropdownMenuItem>
              )}
            </Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
