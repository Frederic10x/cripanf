# Notes App - Context

## Objectif

App de prise de notes avec catégorisation automatique IA (Groq).

**Stack :** Next.js 16 + TypeScript + Supabase + Groq + CSS pur (NO Tailwind)

---

## Maquettes de référence

**PRIORITÉ ABSOLUE** : Reproduire fidèlement les designs dans `public/design-references/`

- `connexion.png` → Page login
- `dashboard-desktop.png` → Dashboard desktop
- `dashboard-mobile.png` → Dashboard mobile
- `nouvelle-note.png` → Création note
- `note.png` → Détail note

---

## Design System (extrait des maquettes)

### Couleurs

```css
/* Primary */
--color-primary: #ff6542; /* Orange principal (boutons, accents) */
--color-primary-light: #fff4f0; /* Orange très clair (backgrounds) */

/* Backgrounds */
--color-bg: #ffffff;
--color-bg-secondary: #f5f5f5;

/* Text */
--color-text: #1a1a1a;
--color-text-secondary: #6b6b6b;

/* Borders */
--color-border: #e8e8e8;

/* Categories */
--category-todo: #ff6542; /* À faire - Orange */
--category-done: #22c55e; /* Fait - Vert */
--category-recurring: #3b82f6; /* Cycliques - Bleu */
--category-waiting: #8b5cf6; /* Attente - Violet */
```

### Typography

- **Font :** Inter (ou -apple-system fallback)
- **Sizes :** 12px, 14px, 16px, 18px, 24px, 32px
- **Weights :** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Line-height :** 1.5 (body), 1.2 (headings)

### Spacing

- **Base unit :** 8px
- **Scale :** 8px, 12px, 16px, 24px, 32px, 48px

### Borders & Shadows

- **Radius :** 8px (cards), 6px (inputs), 20px (buttons)
- **Shadow cards :** `0 2px 8px rgba(0,0,0,0.08)`
- **Shadow buttons :** `0 2px 4px rgba(255,101,66,0.2)`

---

## Architecture

### Structure

```
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   └── note/
│   │       ├── new/
│   │       └── [id]/
│   ├── api/
│   │   ├── notes/
│   │   └── categorize/
│   ├── components/
│   │   ├── ui/
│   │   └── forms/
│   └── styles/
│       ├── globals.css
│       └── variables.css
├── lib/
│   ├── supabase/
│   ├── groq/
│   └── types/
└── middleware.ts
```

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

### Catégories

```typescript
'todo' → 'À faire'
'done' → 'Fait'
'recurring' → 'Tâches cycliques'
'waiting_followup' → 'Attente de retour avec relance'
```

**RLS activé** : Users voient uniquement leurs notes.

---

## APIs

### Supabase Auth

- Package : `@supabase/ssr`
- Middleware protège : `/dashboard/*`, `/note/*`
- Redirections auto selon session

### Groq LLM

- Modèle : `llama-3.1-8b-instant`
- Endpoint : `POST /api/categorize`
- Input : `{ content: string }`
- Output : `{ category, title }`

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

- Mobile-first (breakpoints : 768px, 1024px)
- CSS Modules uniquement
- Server Components par défaut
- TypeScript strict
- Validation serveur + client

### ❌ À NE PAS FAIRE

- Tailwind CSS
- Over-engineering
- Composants sur-génériques
- Ignorer les maquettes

---

## Logo

**Nom :** Cripan' (avec apostrophe)
**Icône :** Orange carré avec icône note/stylo blanc
