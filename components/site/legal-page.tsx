import { PageHero } from "@/components/brand/page-hero"

type LegalPageProps = {
  title: string
  updatedAt: string
  sections: { title: string; paragraphs: string[] }[]
}

export function LegalPage({ title, updatedAt, sections }: LegalPageProps) {
  return (
    <>
      <PageHero image="/images/paysage-bapa.png" eyebrow="Informations légales" title={title} breadcrumbs={[{ label: "Accueil", href: "/" }, { label: title }]} />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-sm text-muted-foreground">Dernière mise à jour : {updatedAt}</p>
        {sections.map((s) => (
          <section key={s.title} className="mt-10">
            <h2 className="font-heading text-xl text-brun">{s.title}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-brun-soft">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </>
  )
}
