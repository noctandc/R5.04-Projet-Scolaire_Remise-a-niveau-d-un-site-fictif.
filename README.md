# R5.04-FinalProject
Ce projet est une plateforme e-commerce dont la base de code a été modernisée pour répondre aux standards industriels de qualité, de test et de performance.

## État du Projet

L'intégralité des exigences principales a été remplie, portée à l'automatisation et à la couverture de tests.

| Catégorie | État | Détails |
| :--- | :---: | :--- |
| **Qualité de Code** | Fait | ESLint (React, Hooks, Perfectionist, A11y, Unicorn) & Prettier |
| **Git Hooks** | Fait | Husky & Lint-staged (Validation auto avant commit/push) |
| **Tests (Jest)** | Fait | Couverture globale > 82% (Statements & Lines) |
| **Performance** | Fait | Lighthouse CI intégré (Accessibilité: 100/100) |

## Stack Technique & Outils

### 1. Qualité de Code & Standardisation
- **Prettier** : Formatage automatique (Single quotes, 120 chars, no trailing commas).
- **ESLint** : 
  - **Frontend** : Protection des Hooks, accessibilité (JSX-A11y), et tri automatique des imports (Perfectionist).
  - **Backend** : Plugins `n` et `unicorn` pour un code Node.js moderne.

### 2. Automatisation (Git Hooks)
- **Husky** : 
  - `pre-commit` : Exécute ESLint, Prettier et les tests liés aux fichiers modifiés.
  - `pre-push` : Lance la suite de tests complète et vérifie les seuils de couverture.

### 3. Tests & Couverture
Le projet utilise **Jest** avec des seuils de couverture stricts :
- **Statements/Lines** : 80% min.
- **Branches** : 60% min.
- **Functions** : 70% min.

### 4. Performance & Accessibilité
Analyse via **Google Lighthouse CI** avec les seuils suivants :
- Accessibilité : **100**
- Meilleures pratiques : **90**
- SEO / Performance : **80**

## Architecture & Workflow

### Stratégie de Branches
Le projet suit une stratégie de branches rigoureuse :
- `main` : Branche protégée, stable.
- `feature/*` : Développement de nouvelles fonctionnalités.
- `fix/*` : Corrections de bugs.

### Convention de Commits
Respect de la norme **Conventional Commits** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction
- `style`: Design / CSS
- `test`: Ajout de tests
- `chore`: Maintenance / Config

## Difficultés rencontrées & Solutions

Le développement de ce projet a présenté plusieurs défis techniques :

### 1. Conflits de Dépendances (Monorepo & Tailwind v4)
* **Problème** : L'installation de la toute nouvelle version de **Tailwind CSS (v4)** a créé des conflits de "peer dependencies" avec certains plugins ESLint plus anciens.
* **Solution** : Utilisation du flag `--legacy-peer-deps` pour forcer la résolution et configuration manuelle de la hiérarchie ESLint entre la racine et les packages pour éviter les collisions.

### 2. Intégration Jest & Modules ESM (Axios)
* **Problème** : Les versions récentes d'Axios utilisent le format ESM (ES Modules), ce qui provoquait une erreur `SyntaxError: Cannot use import statement outside a module` lors de l'exécution des tests Jest via `react-scripts`.
* **Solution** : Mise en place d'un `moduleNameMapper` dans la configuration Jest du frontend pour rediriger les imports vers la version CommonJS (`axios.cjs`), assurant la compatibilité avec l'environnement de test.

### 3. Gestion de la Couverture dans un Monorepo
* **Problème** : Husky et `lint-staged` ne lancent les tests que sur les fichiers modifiés. Cela provoquait des échecs de push car la couverture était calculée sur un échantillon réduit, tombant mécaniquement sous les 80%.
* **Solution** : Mise en place d'une vérification manuelle globale (`npm run test -- --coverage`) avant les phases de déploiement pour garantir l'intégrité du score de couverture réel du projet.

### 4. Conflits d'instances React
* **Problème** : Erreurs de type "Invalid Hook Call" dues à la présence de plusieurs instances de React dans les différents `node_modules` du monorepo.
* **Solution** : Nettoyage complet des arbres de dépendances et utilisation des `overrides` dans le `package.json` racine pour garantir une version unique et partagée de React.

## Installation et Lancement

```bash
# 1. Installer les dépendances (Monorepo)
npm install --legacy-peer-deps

# 2. Lancer les serveurs (Front + Back)
npm run dev

# 3. Exécuter les tests avec couverture
npm run test

# 4. Vérifier la qualité du code (Lint)
npm run lint

# 5. Lancer l'analyse Lighthouse
npm run lighthouse
