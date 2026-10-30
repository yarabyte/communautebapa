import { Pill } from "@/components/brand/pill"

export function AuthHeading({ tag, title, description }: { tag?: string; title: string; description?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {tag && <Pill>{tag}</Pill>}
      <h1 className="font-heading text-3xl leading-tight text-brun sm:text-4xl">{title}</h1>
      {description && <p className="text-brun-soft">{description}</p>}
    </div>
  )
}
