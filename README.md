# TAQUIN LAB

Jeu du taquin et laboratoire pédagogique NSI, en français. React 19, TypeScript, Vite et Tailwind CSS 4. Licence MIT.

## Fonctionnalités

- Grilles 3×3, 4×4, 5×5, mélanges par coups légaux, clic/tactile/clavier (les flèches déplacent le vide).
- Chronomètre à partir du premier coup, pause, annulation (500 derniers coups), tuiles bien placées, sauvegarde locale validée.
- BFS, A* (Manhattan) et IDA*, calculs dans un Web Worker annulable, indice et animation réglable.
- Laboratoire : comparaison réelle sur une même grille, états explorés, frontière maximale, temps et longueur du chemin.
- Parcours Python NSI, pile d'appels interactive (descente/retour), dix exercices avec correction et score au premier essai.
- Clavier, annonces des événements, focus visibles, animations réduites selon les préférences système. Aucun compte ni traceur.

## Démarrer

Node.js 22 ou supérieur.

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

`PLAYWRIGHT_BASE_URL` permet de vérifier une publication. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permet d'utiliser un Chromium déjà installé.

## Architecture

- `src/core/puzzle.ts` : moteur pur, parité, heuristique, recherches et trace récursive.
- `src/core/solver.worker.ts` : calculs isolés de l'interface.
- `src/core/storage.ts` : sauvegarde versionnée et validation des données.
- `src/App.tsx` : jeu, session et laboratoire.
- `src/components/Learning.tsx` : cours, pile et exercices.
- `tests/e2e` : parcours ordinateur/mobile et contrôles axe WCAG A/AA.
- `hosting/worker.mjs` : hébergement Cloudflare gratuit du build public validé.

## Résolution : garanties et limites

BFS est réservé aux grilles 3×3. Chaque recherche a un budget de 250 000 états développés et de 6 secondes. A* et IDA* utilisent une heuristique admissible : lorsqu'ils aboutissent, le chemin est optimal. L'atteinte d'une limite ne prouve jamais l'insolubilité. Les grandes grilles difficiles peuvent dépasser ces budgets ; le défi découverte permet une démonstration rapide et reproductible.

La frontière maximale indique la file/liste ouverte pour BFS/A*, et la profondeur maximale du chemin pour IDA*. Ce n'est pas une mesure des octets utilisés (les ensembles de visites et les parents ont également un coût).

Le chronomètre mesure la session active, sans les pauses ni le temps où la page est fermée. Une partie assistée est signalée. Les données de jeu restent dans `localStorage` ; les réponses aux exercices restent seulement en mémoire de la page. Le fournisseur d'hébergement reçoit les requêtes HTTP habituelles.

## Publication automatique et gratuite

Le workflow `.github/workflows/ci.yml` lance les tests unitaires, TypeScript, le build et Playwright sur ordinateur/mobile. Seulement si tout passe sur `main`, il publie `dist` dans la branche `gh-pages`.

Cloudflare Pages a refusé la connexion Git et la création de projet lors de la mise en place (erreurs fournisseur 8000011 / 8000030). Le relais statique `hosting/worker.mjs` utilise donc Cloudflare Workers et une source GitHub publique fixe, sans secret côté client ni jeton de déploiement stocké dans le dépôt. Le HTML est actualisé sous environ quelques minutes (cache GitHub et edge), les assets sont nommés par hash et conservés entre les publications pour les sessions déjà ouvertes. Les quotas gratuits de Cloudflare Workers s'appliquent ; aucun service payant n'est activé. Le Worker n'accepte que GET/HEAD et les chemins statiques autorisés.

Pour passer ultérieurement à GitHub Pages : activer Settings → Pages → Deploy from a branch → `gh-pages` / root. Aucun changement du build n'est requis (URLs relatives).

## Référence pédagogique

Progression adaptée du PDF fourni « Évaluation Programmation — La récursivité — Le jeu du taquin », lycée J. Calvin, académie d'Amiens : construction/aplatissement, position du vide, `bien_placees`, `est_resolu`, déplacements, voisins, recherche bornée et `extraire_tuiles`. Le document original n'est pas redistribué. Les extraits Python affichés sont explicatifs et ne sont pas exécutés dans le navigateur.

## Contribuer

Créer une branche, ajouter des tests pour les changements du moteur ou des parcours, puis ouvrir une pull request. Ne jamais intégrer `node_modules`, `dist` ou des secrets dans `main`. La publication de `gh-pages` est réservée au workflow.
