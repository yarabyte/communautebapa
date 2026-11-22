import type { Metadata } from "next"

import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = { title: "Mentions légales" }

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="30 octobre 2026"
      sections={[
        {
          title: "Éditeur",
          paragraphs: [
            "Le site communaute.bapa-officiel.com est édité par la Chefferie supérieure Bapa, en lien avec le Comité de développement de Bapa (CODEBA), Bapa, Région de l'Ouest, Cameroun.",
            "Directeur de la publication : [à compléter]. Contact : communaute@bapa-officiel.com.",
          ],
        },
        {
          title: "Hébergement",
          paragraphs: ["Le site est hébergé sur un serveur privé virtuel (VPS) chez Contabo GmbH, Aschauer Straße 32a, 81549 Munich, Allemagne."],
        },
        {
          title: "Propriété intellectuelle",
          paragraphs: [
            "Les textes, photographies, emblèmes et logos du Royaume Bapa sont protégés. Toute reproduction sans autorisation écrite de la chefferie est interdite.",
          ],
        },
        {
          title: "Responsabilité",
          paragraphs: [
            "Les contenus publiés par les membres (messagerie, profils) relèvent de la responsabilité de leurs auteurs. Les modérateurs peuvent retirer tout contenu contraire à la charte.",
          ],
        },
      ]}
    />
  )
}
