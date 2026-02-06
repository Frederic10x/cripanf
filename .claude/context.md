# Cripanf - Contexte de l'App

## Vue d'ensemble

App de prise de notes Next.js 16 avec catégorisation alimentée par l'IA (API Groq). Les notes sont auto-catégorisées en 4 types. Design mobile-first avec actions de balayage.

## Stack Technologique

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Base de données**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **IA**: Groq SDK (catégorisation des notes)
- **Utilitaires**: date-fns
- **Gestionnaire de paquets**: bun/npm

## Structure du Projet

```
src/
├── app/
│   ├── (auth)/              # Pages de connexion
│   ├── (dashboard)/         # App principale (dashboard, note/[id], note/new)
│   ├── api/                 # Route handlers
│   │   ├── notes/           # GET (récupérer), POST (créer)
│   │   ├── notes/[id]/      # PATCH (modifier catégorie), DELETE
│   │   ├── categorize/      # POST (catégorisation IA)
│   │   └── auth/callback/   # Callback OAuth
│   ├── components/
│   │   ├── ui/              # NoteRow, NoteCard, Sidebar, MobileNav, SearchBar, etc.
│   │   └── icons/           # Icônes de catégories (TodosIcon, DoneIcon, etc.)
│   ├── layout.tsx           # Layout racine
│   └── styles/              # CSS global + CSS modules
├── lib/
│   ├── supabase/            # Instances Supabase client/server
│   └── types/
│       ├── note.ts          # Interface Note, CATEGORIES, CATEGORY_LABELS/COLORS/ICONS
│       └── database.ts      # Types générés par Supabase
└── public/                  # Icônes SVG, assets
```

## Modèle de Données Principal

### Note

```ts
interface Note {
  id: string;
  user_id: string;
  title: string; // Généré par l'IA à partir du contenu
  content: string; // Saisie utilisateur
  category: "todo" | "done" | "recurring" | "waiting_followup";
  created_at: string;
  updated_at: string;
  is_voice_note: boolean;
  insights: string[] | null; // Insights générés par l'IA
  tags: string[];
}
interface UserTag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
```

### Catégories

- **todo** ("À faire") - bleu/--category-todo
- **done** ("Fait") - vert/--category-done
- **recurring** ("Tâches cycliques") - orange/--category-recurring
- **waiting_followup** ("Attente de retour") - rouge/--category-waiting

## Points de Terminaison Clés

### GET /api/notes

Paramètres query: `category`, `search`, `limit` (par défaut 20), `offset` (par défaut 0)
Retourne: `{ notes: Note[], total: number }`

### POST /api/notes

Corps: `{ content: string, is_voice_note?: boolean }`

- Valide le contenu (3-10000 caractères)
- Appelle `/api/categorize` pour la catégorisation IA
- Retourne: Note créée (201)

### PATCH /api/notes/[id]

Met à jour la catégorie ou d'autres champs de la note

### DELETE /api/notes/[id]

Suppression logique ou physique (vérifier l'implémentation)

### POST /api/categorize

Corps: `{ content: string }`
Retourne: `{ category, title, insights }`

### GET /api/tags

Retourne: `{ tags: UserTag[] }` - tous les tags de l'utilisateur, triés alphabétiquement

### POST /api/tags

Corps: `{ name: string }`
- Normalise le nom (trim + lowercase)
- Valide longueur (1-30 caractères)
- Contrôle UNIQUE (erreur 409 si existe déjà)
- Retourne: UserTag créé (201)

### DELETE /api/tags/[id]

Supprime le tag et l'enlève de toutes les notes de l'utilisateur

## Composants UI Principaux

### NoteRow (Balayage Mobile)

- Balayage tactile (seuil 60px, max 160px)
- Révèle les boutons recatégoriser (bleu) + supprimer (rouge)
- Bottom sheet pour la sélection de catégorie
- Modal de confirmation de suppression
- API Touch native, performance 60fps
- Pattern simple reveal (CustomEvent 'noterow-reveal')
- Desktop: balayage caché (≥768px), comportement au clic normal

### NoteCard

- Vue desktop de la note

### Sidebar

- Navigation filtre par catégorie
- Gestion des tags utilisateur: affiche liste triée alphabétiquement, permet création et suppression
- Callback `onTagsChange` pour filtrer les notes par tags

### MobileNav

- Barre de navigation mobile en bas

### SearchBar

- Recherche de notes avec debouncing

## Authentification

- OAuth Supabase (GitHub, etc.)
- Session stockée en cookies (support SSR)
- Vérification auth sur routes protégées
- Redirection vers login si non autorisé

## Architecture CSS

- Styles globaux dans `src/styles/`
- CSS Modules pour les styles scopés des composants (`.module.css`)
- Variables CSS pour les couleurs de thème (--category-todo, etc.)
- Design responsive mobile-first

## Notes Importantes

- Langue: Labels et messages UI en français
- Toutes les notes scopées à l'authentification user_id
- Timestamps au format ISO 8601
- Recherche full-text ilike sur title + content
- Insights vides = null (pas de tableau vide)
- Tags: tableau de strings normalisées (lowercase), suppression en cascade (tag supprimé → enlever de toutes les notes)
