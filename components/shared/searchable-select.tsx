"use client"

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type SearchableOption = { value: string; label: string; count?: number }

const ALL = "TOUS"

/** Liste déroulante avec champ de recherche, sur le modèle d'un select2. */
export function SearchableSelect({
  value,
  onChange,
  options,
  allLabel,
  placeholder,
  searchPlaceholder,
  ariaLabel,
  className,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  options: SearchableOption[]
  allLabel: string
  placeholder?: string
  searchPlaceholder: string
  ariaLabel: string
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((option) => option.value === value)
  const label = current?.label ?? (value === ALL ? allLabel : placeholder)

  const choose = (next: string) => {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-sm whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-56 gap-0 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>Aucun résultat</CommandEmpty>
            <CommandGroup>
              <CommandItem value={allLabel} data-checked={value === ALL || undefined} onSelect={() => choose(ALL)}>
                {allLabel}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  data-checked={value === option.value || undefined}
                  onSelect={() => choose(option.value)}
                >
                  <span className="truncate">{option.label}</span>
                  {option.count != null && (
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">{option.count}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
