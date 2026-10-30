# Communauté Bapa

Template du sous-site **communaute.bapa-officiel.com** du Royaume Bapa (Ouest-Cameroun) : site public, inscription et connexion, espace membre et back-office.

Le site principal est [bapa-officiel.com](https://www.bapa-officiel.com). Ce sous-site en reprend l'identité visuelle : palette terre / or / crème, typographies Cinzel et Work Sans, frise de losanges, tuiles numérotées.

> **État actuel : interface seule.** Toutes les pages fonctionnent sur des données fictives (`lib/mock`). Le schéma de base de données (Prisma / MySQL) est prêt, mais l'authentification, les paiements et l'envoi de SMS ou d'emails restent à brancher.

## Stack

- Next.js 15 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (Radix), lucide-react
- react-hook-form + zod, TanStack Table v9, Recharts, date-fns (fr), sonner
- Prisma 6 + MySQL

## Démarrage

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:3000
npm run typecheck
```

### Rôle de démonstration

Un sélecteur dans la barre du haut de l'espace membre permet de prévisualiser l'interface selon le rôle :

- Membre
- Responsable d'association
- Trésorier
- Super administrateur

Le rôle est stocké dans le `localStorage`. Le menu Administration et l'accès aux pages `/admin/*` s'adaptent au rôle choisi : voir `lib/navigation.ts` et `components/admin/role-gate.tsx`.

## Organisation

```
app/
  (public)/     accueil, associations, événements, à propos/charte, FAQ, pages légales
  (auth)/       connexion, inscription (5 étapes), vérification OTP, mot de passe oublié,
                lien magique, en attente de validation
  (espace)/
    espace/     tableau de bord, profil, messages, associations, annuaire, actualités,
                événements, forum, documents, projets, contributions, contribuer, paramètres
    admin/      vue d'ensemble, inscriptions, membres, associations, événements, actualités,
                projets, contributions (saisie espèces), documents, modération, paramètres
components/
  brand/        logo, frise, pastilles, tuiles numérotées, hero, CTA
  site/         en-tête et pied de page publics
  auth/         formulaires d'authentification
  espace/       sidebar, topbar, cartes, chat, tunnel de paiement…
  admin/        DataTable générique, formulaires, files de validation et de modération
  shared/       cartes événement / projet / association, badges de statut
lib/
  types.ts      types métier
  mock/         données fictives
  data/         fonctions d'accès aux données (async) — à remplacer par Prisma
  labels.ts     libellés français des énumérations
  format.ts     montants (FCFA, €, $), dates (heure de Douala)
prisma/schema.prisma
```

### Brancher la base de données

Les pages ne lisent les données que via `lib/data/*`. Pour passer en production, remplacez le corps de ces fonctions par des requêtes Prisma : les signatures sont déjà asynchrones.

```bash
npm run db:migrate      # crée la base et la première migration (dev)
npm run db:generate
```

### Liste des associations

Les 78 associations réelles proviennent du classeur `Associations_BAPA_par_pays_et_ville.xlsx` (onglet « Données (filtrable) »). Après une mise à jour du classeur, régénérez `lib/mock/associations-source.ts` :

```bash
python3 scripts/associations-from-xlsx.py chemin/vers/Associations_BAPA_par_pays_et_ville.xlsx
```

Gardez l'ordre des lignes : les identifiants (`as1`… `as78`) suivent le numéro de ligne, et les données de démonstration (membres, événements, documents) y font référence.

### Reste à intégrer

- **Authentification** : Auth.js (NextAuth) avec adaptateur Prisma pour email + mot de passe, Google, Facebook et lien magique. L'OTP SMS / WhatsApp passe par un fournisseur au choix. Les modèles `User`, `Account`, `Session` et `VerificationToken` sont prévus.
- **Paiements** : APIs Orange Money et MTN MoMo, un prestataire carte (Stripe, CinetPay…) et PayPal. Les webhooks mettent à jour `Contribution.status`.
- **Notifications** : SMTP pour les emails, passerelle SMS et WhatsApp Business.
- **Messagerie temps réel** : polling, SSE ou WebSocket (Socket.IO, Pusher…).
- **Stockage des fichiers** : documents et avatars, sur le disque du VPS ou un stockage S3 compatible.

## Déploiement sur le VPS Contabo

Architecture : **Nginx** (TLS Let's Encrypt) en reverse proxy vers **Next.js standalone** sur `127.0.0.1:3005`, géré par **PM2** (ou Docker). La base est le **MySQL** déjà présent sur le VPS.

Le build produit `.next/standalone` (`output: "standalone"` dans `next.config.ts`) : un `server.js` autonome, sans `node_modules` complet.

### 1. Préparer le serveur (une fois)

```bash
# Node 20 LTS + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
sudo npm install -g pm2
pm2 startup systemd

# Dossiers
sudo mkdir -p /var/www/communaute-bapa/{releases,shared} /var/log/communaute-bapa
sudo chown -R deploy:deploy /var/www/communaute-bapa /var/log/communaute-bapa
```

### 2. Base MySQL

```sql
CREATE DATABASE communaute_bapa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bapa'@'localhost' IDENTIFIED BY 'mot-de-passe-fort';
GRANT ALL PRIVILEGES ON communaute_bapa.* TO 'bapa'@'localhost';
FLUSH PRIVILEGES;
```

Créez `/var/www/communaute-bapa/shared/.env` à partir de `.env.example` :

```bash
DATABASE_URL="mysql://bapa:mot-de-passe-fort@localhost:3306/communaute_bapa"
NEXT_PUBLIC_SITE_URL="https://communaute.bapa-officiel.com"
```

### 3. DNS et Nginx

1. Ajoutez un enregistrement **A** `communaute` vers l'IP du VPS, dans la zone `bapa-officiel.com`.
2. Installez le virtual host :

```bash
sudo cp deploy/nginx/communaute.bapa-officiel.com.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/communaute.bapa-officiel.com /etc/nginx/sites-enabled/
# Premier certificat : commenter temporairement le bloc « listen 443 », puis :
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d communaute.bapa-officiel.com
sudo nginx -t && sudo systemctl reload nginx
```

Le renouvellement automatique est géré par le timer systemd de certbot (`systemctl list-timers | grep certbot`).

### 4a. Déployer avec PM2 (recommandé)

```bash
REPO_URL=git@github.com:bapa/communaute.git ./deploy/deploy.sh main
```

Le script `deploy/deploy.sh` enchaîne les étapes suivantes :

1. clone de la branche dans `releases/<date>` ;
2. `npm ci`, `prisma generate`, `prisma migrate deploy` et `npm run build` ;
3. copie de `public/` et `.next/static/` dans le build standalone ;
4. bascule du lien `current` vers la nouvelle version ;
5. `pm2 startOrReload ecosystem.config.cjs` ;
6. nettoyage, en ne gardant que les 5 dernières versions.

Pour revenir en arrière, pointez `current` vers une version précédente puis relancez `pm2 reload communaute-bapa`.

Commandes utiles : `pm2 status`, `pm2 logs communaute-bapa`, `pm2 monit`.

### 4b. Alternative Docker

```bash
cp .env.example .env    # DATABASE_URL avec host.docker.internal au lieu de localhost
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Le conteneur n'écoute que sur `127.0.0.1:3005`. La configuration Nginx ci-dessus reste identique.

Côté MySQL, l'utilisateur doit accepter les connexions depuis le réseau Docker, par exemple `'bapa'@'172.17.%'`.

### Vérifications après déploiement

- `curl -I https://communaute.bapa-officiel.com` doit renvoyer `200` avec l'en-tête HSTS.
- Testez les pages `/`, `/connexion` et `/espace`.
- Surveillez `pm2 logs` pour d'éventuelles erreurs Prisma de connexion.
- Pensez à une sauvegarde quotidienne de la base, par exemple `mysqldump` via cron vers un stockage externe.
