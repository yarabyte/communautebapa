"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const dialCodes = [
  { code: "+237", label: "Cameroun" },
  { code: "+33", label: "France" },
  { code: "+32", label: "Belgique" },
  { code: "+41", label: "Suisse" },
  { code: "+49", label: "Allemagne" },
  { code: "+1", label: "Canada / États-Unis" },
  { code: "+44", label: "Royaume-Uni" },
]

type PhoneInputProps = {
  dialCode: string
  onDialCodeChange: (v: string) => void
  inputProps: React.ComponentProps<"input">
  invalid?: boolean
}

export function PhoneInput({ dialCode, onDialCodeChange, inputProps, invalid }: PhoneInputProps) {
  return (
    <div className="flex gap-2">
      <Select value={dialCode} onValueChange={onDialCodeChange}>
        <SelectTrigger className="h-11! w-28 bg-card" aria-label="Indicatif">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dialCodes.map((d) => (
            <SelectItem key={d.code} value={d.code}>
              {d.code} <span className="text-muted-foreground in-data-[slot=select-trigger]:hidden">{d.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="tel" inputMode="tel" placeholder="6 70 00 00 00" className="h-11 flex-1 bg-card" aria-invalid={invalid} {...inputProps} />
    </div>
  )
}
