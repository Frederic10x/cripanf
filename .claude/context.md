# Notes App - Context

## Objectif

Application de gestion de notes avec catégorisation automatique par IA (Groq). Support des notes vocales et organisation par catégories (todo, done, recurring, waiting_followup).

**Stack :** Next.js 16.1.6 + React 19.2.3 + TypeScript 5 + Supabase SSR + Groq SDK + date-fns + CSS pur (NO Tailwind)

---

## Maquettes de référence

**PRIORITÉ ABSOLUE** : Reproduire fidèlement les designs dans `public/design-references/`

- `connexion.png` → Page login
- `dashboard-desktop.png` → Dashboard desktop
- `dashboard-mobile.png` → Dashboard mobile
- `nouvelle-note.png` → Création note
- `note.png` → Détail note

---

## Design System

### Couleurs principales

```css
--color-primary: #ff6542; /* Orange - boutons, accents */
--color-primary-light: #fff4f0; /* Orange clair - backgrounds */

/* Categories */
--category-todo: #ff6542; /* À faire - Orange */
--category-done: #22c55e; /* Fait - Vert */
--category-recurring: #3b82f6; /* Cycliques - Bleu */
--category-waiting: #8b5cf6; /* Attente - Violet */
```

**Voir `src/styles/variables.css` pour le design system complet** (typography, spacing, shadows, etc.)

---

## Architecture

### Structure clés

```
src/
├── app/
│   ├── (auth)/login/                    # Routes publiques
│   ├── (dashboard)/                     # Routes protégées
│   │   ├── DashboardContext.tsx         # State global (selectedCategory)
│   │   ├── dashboard/ + note/[id]/ + note/new/
│   ├── api/
│   │   ├── notes/route.ts               # GET (all), POST
│   │   ├── notes/[id]/route.ts          # GET, PUT, DELETE
│   │   └── categorize/route.ts          # POST - IA catégorisation
│   ├── components/
│   │   ├── ui/                          # NoteCard, Sidebar, SearchBar...
│   │   └── icons/                       # SVG en composants React
├── lib/
│   ├── supabase/client.ts               # Browser client
│   ├── groq/client.ts                   # Groq + categorizeNote()
│   └── types/
│       ├── note.ts                      # Types + constantes
│       └── database.ts                  # Types Supabase générés
├── styles/
│   ├── globals.css
│   └── variables.css                    # Design tokens
└── middleware.ts                        # Protection routes + auth
```

### Patterns & Conventions

**Route Groups :**

- `(auth)` : publiques | `(dashboard)` : protégées

**State Management :**

- `DashboardContext` + custom hook `useDashboard()`

**Composants :**

- Server Components par défaut, `'use client'` pour interactivité uniquement

**Types :**

- Constantes centralisées : `CATEGORIES`, `CATEGORY_LABELS`, `CATEGORY_COLORS`, `CATEGORY_ICONS`
- Type `Category` dérivé : `typeof CATEGORIES[keyof typeof CATEGORIES]`

**Imports :**

- Alias `@/` → `src/`

---

## Fonctionnalités

### Gestion de notes

- CRUD complet avec vérification ownership (user_id)
- Support notes vocales (flag `is_voice_note`)
- Recherche et filtrage par catégorie

### Catégorisation automatique (IA)

- API `/api/categorize` utilise Groq (llama-3.1-8b-instant)
- Input : contenu → Output : `{ category, title }`
- Fallback graceful si erreur Groq : `{ category: 'todo', title: content.slice(0,60) }`

### Authentification

- Middleware Next.js + Supabase Auth
- Routes protégées : `/dashboard/*`, `/note/*`
- Redirections auto : non connecté → `/login`, connecté → `/dashboard`

---

## Base de données Supabase

### Table `notes`

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
title VARCHAR(255)
content TEXT
category VARCHAR(50) CHECK (IN 'todo','done','recurring','waiting_followup')
created_at TIMESTAMP
updated_at TIMESTAMP
is_voice_note BOOLEAN
```

**RLS activé** : Users voient uniquement leurs notes.

---

## APIs

### Supabase Auth

- Package : `@supabase/ssr`
- Middleware protège `/dashboard/*`, `/note/*`
- Matcher exclut : `/api`, `/_next`, statiques

### API Routes Notes

| Route             | Méthode | Description      |
| ----------------- | ------- | ---------------- |
| `/api/notes`      | GET     | Liste notes user |
| `/api/notes`      | POST    | Créer note       |
| `/api/notes/[id]` | GET     | Détail note      |
| `/api/notes/[id]` | PUT     | Modifier note    |
| `/api/notes/[id]` | DELETE  | Supprimer note   |

**Toutes les routes vérifient l'authentification et l'ownership.**

### Groq LLM (Catégorisation)

- **Modèle :** `llama-3.1-8b-instant`
- **Route :** `POST /api/categorize`
- **Body :** `{ content: string }`
- **Response :** `{ category: Category, title: string }`
- **Config :** `temperature: 0.3, max_tokens: 150`

---

## Variables d'environnement

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

---

## Principes de développement

### ✅ À FAIRE

**Architecture :**

- Server Components par défaut
- `'use client'` uniquement si nécessaire (state, events, context)
- Route groups pour organisation
- Middleware pour protection routes

**Styling :**

- CSS pur avec CSS variables (NO Tailwind)
- Mobile-first (breakpoints : 768px, 1024px)
- Design tokens dans `variables.css`

**TypeScript :**

- Mode strict
- Types Supabase générés
- Constantes typées (`as const`)
- Validation runtime + TypeScript

**Naming :**

- Composants : `PascalCase`
- API : `route.ts`
- Constantes : `SCREAMING_SNAKE_CASE`
- Interfaces : `PascalCase` (Note, Database)

**Code Quality :**

- Validation serveur ET client
- Error handling avec fallbacks
- Constantes centralisées (pas de duplication)
- Comments en français

### ❌ À NE PAS FAIRE

- Tailwind CSS
- Over-engineering (KISS)
- Composants sur-génériques
- Ignorer maquettes
- Duplication constantes
- `'use client'` inutile
- Ne jamais créer de fichiers .md de documentation/changelog
- Pas de IMPLEMENTATION.md, CHANGES.md, README updates, etc.
- Modifications = code uniquement

---

## Logo

**Nom :** Cripan' (avec apostrophe)
**Icône :** Orange carré avec icône note/stylo blanc
