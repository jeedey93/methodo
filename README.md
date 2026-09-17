# Méthodo

Plateforme pédagogique conçue pour les enseignants du primaire au Québec. Méthodo centralise la planification, la création de contenu IA, la gestion de classe et la communication avec les parents.

---

## Fonctionnalités

### Tableau de bord
Vue d'ensemble personnalisée — accès rapide à toutes les sections de l'application.

### Création de contenu IA (`/creer`)
- **Exercices** — génération d'exercices différenciés par matière, niveau et objectifs pédagogiques
- **Planification** — création de planifications de leçons structurées avec compétences du programme québécois
- Sauvegarde automatique dans la bibliothèque personnelle

### Bibliothèque (`/bibliotheque`)
- Documents générés et importés, classés par tags
- Prévisualisation, édition et export PDF
- Partage vers la communauté

### Planificateur hebdomadaire (`/planificateur`)
- Grille semaine par semaine avec cases horaires configurables
- Création et navigation entre les semaines
- Vue lecture seule partageable

### Communauté (`/communaute`)
- Ressources pédagogiques partagées par la communauté enseignante
- Système de favoris
- Profils publics par enseignant

### Ma classe & Gestion de classe (`/ma-classe`, `/classe`)
- Gestion de la liste d'élèves
- Sondages élèves avec résultats en temps réel

### Portail parents (`/portail-parents`)
- Configuration d'un portail public accessible par lien unique (sans compte)
- Partage d'informations de classe avec les familles

### Tableau blanc (`/tableau-blanc`)
Outil plein écran pour animer des cours. Toutes les données sont sauvegardées automatiquement par page.

**Widgets positionnables et redimensionnables :**
- Texte — taille, couleur, alignement, fond, gras
- Image — depuis l'ordinateur, modes contenu/remplissage
- Horloge — temps réel, avec ou sans secondes, couleur configurable
- Minuterie — durée configurable, démarrer/pause/reset, alerte visuelle à 0
- Emoji — picker de 48 emojis, taille configurable
- Formes — rectangle, cercle, triangle avec remplissage, bordure et opacité

**Outils de dessin :**
- Crayon, Surligneur (semi-transparent), Ligne, Flèche, Effacer
- Choix de couleur et épaisseur, effacement par clic ou global

**Gestion des pages :**
- Plusieurs pages par tableau, navigation par miniatures avec aperçu
- Renommage par double-clic, suppression, ajout de pages
- Fonds d'écran prédéfinis (12 wallpapers Unsplash), couleurs unies, image personnalisée
- Mode plein écran

### Paramètres & Aide
- Gestion du profil enseignant (nom, avatar)
- Section d'aide intégrée

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript 5 |
| UI | Tailwind CSS v4 + shadcn/ui + Lucide React |
| Auth | Supabase Auth (SSR) |
| Base de données | PostgreSQL via Supabase + Prisma 6 (ORM) |
| IA | *(intégration via API routes)* |

---

## Structure du projet

```
app/
├── (marketing)/          # Page d'accueil publique
├── (auth)/               # Connexion, inscription, mot de passe oublié
├── (app)/
│   ├── (padded)/         # Pages avec layout padded (max-w-5xl)
│   │   ├── dashboard/
│   │   ├── bibliotheque/
│   │   ├── creer/
│   │   ├── planificateur/
│   │   ├── communaute/
│   │   ├── ma-classe/
│   │   ├── classe/
│   │   ├── portail-parents/
│   │   ├── parametres/
│   │   └── aide/
│   └── tableau-blanc/    # Layout plein écran (hors padded)
├── p/[token]/            # Portail parents public (sans auth)
├── sondage/[id]/         # Sondage élève public
└── api/                  # Routes API
    ├── documents/
    ├── export/pdf/
    ├── parent-portal/
    ├── profile/
    ├── shared-resources/
    ├── sondage/
    ├── students/
    ├── week-plans/
    └── whiteboard-pages/

components/
├── layout/Sidebar.tsx
├── features/
│   ├── generation/
│   ├── planner/
│   └── resources/
└── ui/                   # Primitives shadcn/ui

prisma/
└── schema.prisma         # Modèles : User, TeacherProfile, Document,
                          #   Tag, SharedResource, WeekPlan,
                          #   ParentPortal, Student, WhiteboardPage
```

---

## Installation

### Prérequis
- Node.js 20+
- Un projet Supabase avec PostgreSQL

### 1. Cloner et installer

```bash
git clone <repo>
cd methodo
npm install
```

### 2. Variables d'environnement

Créer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

> `DATABASE_URL` est la connexion poolée (transactions), `DIRECT_URL` est la connexion directe (migrations).

### 3. Base de données

```bash
npx prisma generate
npx prisma db push
```

Pour le tableau blanc — exécuter dans le SQL Editor Supabase si la colonne n'existe pas encore :

```sql
ALTER TABLE methodo_whiteboard_pages
  ADD COLUMN IF NOT EXISTS paths JSONB NOT NULL DEFAULT '[]';
```

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Routes protégées

Toutes les routes sous `/dashboard`, `/creer`, `/bibliotheque`, `/planificateur`, `/communaute`, `/ma-classe`, `/classe`, `/portail-parents`, `/aide`, `/parametres` et `/tableau-blanc` redirigent vers `/connexion` si l'utilisateur n'est pas authentifié (via `proxy.ts`).

Les routes `/connexion` et `/inscription` redirigent vers `/dashboard` si l'utilisateur est déjà connecté.

---

## Déploiement

```bash
npm run build
```

Compatible Vercel — déploiement automatique sur push via l'intégration GitHub.
