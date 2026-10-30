import type { Metadata } from "next"

import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = { title: "Politique de confidentialité" }

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="30 octobre 2026"
      sections={[
        {
          title: "Données collectées",
          paragraphs: [
            "Lors de votre inscription : identité, coordonnées (email, téléphone), quartier et famille d'origine, ville et pays de résidence, profession, photo de profil facultative.",
            "Lors de vos contributions : montant, devise, moyen de paiement et référence de transaction. Aucune donnée de carte bancaire n'est stockée par la communauté.",
          ],
        },
        {
          title: "Finalités",
          paragraphs: [
            "Vos données servent à valider votre adhésion, à vous mettre en relation avec les membres et associations, à gérer vos inscriptions aux événements et à émettre vos reçus de contribution.",
          ],
        },
        {
          title: "Visibilité dans l'annuaire",
          paragraphs: [
            "Votre profil n'est visible que des membres validés. Vous pouvez masquer votre téléphone, votre email ou vous retirer de l'annuaire depuis vos paramètres.",
          ],
        },
        {
          title: "Conservation et droits",
          paragraphs: [
            "Les données sont conservées tant que votre compte est actif, puis supprimées ou anonymisées dans un délai de 12 mois. Les données comptables sont conservées 10 ans.",
            "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à communaute@bapa-officiel.com.",
          ],
        },
      ]}
    />
  )
}
