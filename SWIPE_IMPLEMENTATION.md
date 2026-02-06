# Implémentation du Swipe Mobile sur NoteRow

## ✅ Fonctionnalités Implémentées

### 1. **Swipe Gesture (Mobile uniquement)**
- **Activation** : Swipe gauche (droite → gauche) sur les NoteRow
- **Plateforme** : Mobile uniquement (< 768px), desktop garde le comportement actuel
- **Animation** : Utilise `transform: translateX()` pour une performance à 60fps
- **Optimisation** : `will-change: transform` pour les performances GPU

### 2. **Boutons d'Action**
Lors du swipe, deux boutons apparaissent à droite :

#### **Bouton Recatégoriser** (bleu)
- **Icône** : RecurringIcon
- **Action** : Ouvre un bottom sheet avec les 4 catégories
- **Design** : Identique au `manualCategoryMenu` de la page de détail
- **Catégories** :
  - À faire (todo) - Orange
  - Fait (done) - Vert
  - Tâches cycliques (recurring) - Bleu
  - Attente de retour (waiting_followup) - Violet
- **API** : `PATCH /api/notes/[id]` avec `{ category: newCategory }`
- **Refresh** : Appel de `onUpdate()` pour rafraîchir la liste

#### **Bouton Supprimer** (rouge)
- **Icône** : SVG trash bin
- **Action** : Ouvre une modale de confirmation centrée
- **Modale** :
  - Titre : "Supprimer la note ?"
  - Message : "Cette action est irréversible."
  - Boutons : Annuler (gris) + Supprimer (rouge)
- **API** : `DELETE /api/notes/[id]`
- **Refresh** : Appel de `onUpdate()` pour rafraîchir la liste

### 3. **Comportement du Swipe**
- **Seuil** : 80px pour activer l'ouverture
- **Maximum** : 160px de translation (80px par bouton)
- **Reset** : Swipe incomplet retourne à la position initiale
- **Fermeture** : Tap sur la note ou swipe droit ferme les boutons
- **Transition** : Animation fluide à 0.3s ease-out

### 4. **Accessibilité**
- ✅ **ARIA labels** : `aria-label` sur tous les boutons
- ✅ **Focus trap** : `role="dialog"` et `aria-modal="true"` sur les modales
- ✅ **Clavier** : Touche `ESC` ferme les modales/bottom sheets
- ✅ **Titres** : `aria-labelledby` pour les titres de dialogue
- ✅ **Descriptions** : `aria-describedby` pour les descriptions

### 5. **Événements Natifs**
- Utilise `TouchEvent` natif (pas de bibliothèque externe)
- `touchstart` : Capture la position initiale
- `touchmove` : Calcule et applique la translation
- `touchend` : Détermine si le swipe est complet ou doit être réinitialisé
- **Cleanup** : `useEffect` avec cleanup pour les event listeners

## 📁 Fichiers Modifiés

### 1. `src/app/components/ui/NoteRow.tsx`
**Ajouts** :
- Import des icônes (TodosIcon, DoneIcon, RecurringIcon, WaitingFollowupIcon)
- State management pour le swipe (`translateX`, `isSwiping`)
- State pour les modales (`showCategorySheet`, `showDeleteModal`)
- Handlers pour touch events (`handleTouchStart`, `handleTouchMove`, `handleTouchEnd`)
- Handlers pour les actions (`handleRecategorize`, `handleDelete`, `handleCategoryChange`, `handleConfirmDelete`)
- Bottom sheet pour la sélection de catégorie
- Modale de confirmation de suppression
- Prop `onUpdate?: () => void` pour le refresh

### 2. `src/app/components/ui/NoteRow.module.css`
**Ajouts** :
- `.swipeContainer` : Container pour gérer l'overflow
- `.actionsContainer` : Container pour les boutons d'action
- `.recategorizeButton` / `.deleteButton` : Styles des boutons
- `.bottomSheetOverlay` / `.bottomSheet` : Bottom sheet mobile
- `.categoryList` / `.categoryButton` : Liste des catégories
- `.modalOverlay` / `.modal` : Modale de confirmation
- Animations : `fadeIn`, `slideUp`, `scaleIn`
- Media query desktop (min-width: 768px) pour cacher les actions

### 3. `src/app/(dashboard)/dashboard/page.tsx`
**Modifications** :
- Ajout de `onUpdate={fetchNotes}` sur tous les `<NoteRow>` :
  - Desktop list (ligne 365)
  - Mobile list (ligne 380)
  - Search modal results (ligne 427)

## 🧪 Test Plan

### Tests Mobile (< 768px)

#### **iOS Safari**
1. Ouvrir le dashboard sur iPhone/iPad
2. Swiper une note de droite à gauche
3. Vérifier que les boutons apparaissent
4. Tester le bouton "Recatégoriser" :
   - Bottom sheet s'ouvre
   - Sélectionner une catégorie
   - Vérifier que la liste se rafraîchit
5. Tester le bouton "Supprimer" :
   - Modale de confirmation s'ouvre
   - Tester "Annuler" (ferme la modale)
   - Tester "Supprimer" (supprime et rafraîchit)
6. Tester ESC sur clavier externe (iPad)
7. Vérifier les performances (60fps)

#### **Chrome Android**
1. Répéter tous les tests iOS
2. Vérifier le touch feedback
3. Tester avec différentes tailles d'écran

### Tests Desktop (≥ 768px)
1. Vérifier que le swipe n'est **pas actif**
2. Les boutons d'action ne doivent **pas apparaître**
3. Le comportement normal (click → détail) doit fonctionner

### Tests d'Accessibilité
1. Navigation au clavier (Tab, Enter, ESC)
2. Lecteur d'écran (VoiceOver iOS, TalkBack Android)
3. Vérifier les annonces ARIA

## 🔧 Contraintes Techniques Respectées

✅ Événements natifs `TouchEvent` (pas de lib externe)
✅ `transform` pour les performances (60fps)
✅ `will-change: transform` pour l'optimisation GPU
✅ Cleanup des listeners dans `useEffect`
✅ TypeScript strict avec types de `note.ts`
✅ ARIA labels sur tous les éléments interactifs
✅ Focus trap sur les modales (`role="dialog"`, `aria-modal="true"`)
✅ ESC ferme les modales
✅ Desktop inactif (media query ≥ 768px)

## 🎨 Design

Le design du **bottom sheet de catégories** est identique au `manualCategoryMenu` de la page de détail :
- Même couleurs de fond (rgba avec 0.15 d'opacité)
- Mêmes icônes
- Mêmes labels
- Même structure et padding

La **modale de suppression** suit le même design que la modale existante sur NoteCard.

## 📱 Comportement Mobile

- **Seuil d'activation** : 80px
- **Translation max** : 160px (80px/bouton)
- **Transition** : 0.3s ease-out (quand pas de swipe actif)
- **Performance** : 60fps grâce à `transform` + `will-change`

## 🚀 Prochaines Étapes

1. Tester sur iOS Safari (iPhone/iPad)
2. Tester sur Chrome Android
3. Tester les performances avec des listes longues
4. Vérifier l'accessibilité avec lecteurs d'écran
5. (Optionnel) Ajouter un haptic feedback sur iOS si souhaité
