# Vérification de TAQUIN LAB

Date : 15 novembre 2026.

## Tests

- 22 tests unitaires : mouvements, absence de mutation, mélanges solubles 3/4/5, parité, Manhattan, chemins optimaux, budgets, résolution 4×4 et 5×5, pile du PDF, validation des sauvegardes, routes et en-têtes du relais Cloudflare.
- 14 scénarios Playwright (7 sur ordinateur, 7 sur mobile) : jeu et annulation, restauration, tailles, résolution animée, comparaison, pile, exercices, clavier, données corrompues, chronomètre/pause, continuité des exercices et interruption d'une animation.
- Contrôle axe WCAG A/AA sur les quatre espaces, dans les deux formats, sans violation détectée lors de la validation verte.
- Vérification de l'absence de débordement horizontal sur chaque espace.
- TypeScript strict, build de production et formatage Prettier.

Validation navigateur réussie : https://github.com/antigone13090/taquin-lab/actions/runs/43711459428
Les rapports et captures sont disponibles dans les artefacts GitHub Actions (7 jours).

## Vérification de la publication

URL : https://taquin-lab.valentinlamede13.workers.dev/

Vérifié dans le navigateur cloud sur l'URL publique : chargement de l'application, défi en deux coups, calcul du Worker, animation jusqu'à la victoire, compteur à 2 et 8/8 tuiles placées, trace récursive avec i = 5 puis i = 6, correction d'un exercice et affichage de la grille 4×4.

Capture : [application publiée](screenshots/published.jpg).

## Revue et corrections

Une revue indépendante a testé trente positions 3×3 : les trois solveurs ont retourné des solutions légales de même longueur optimale. Elle a relevé des contrastes, les compteurs décoratifs des onglets et la conservation des assets entre déploiements. Ces points ont été corrigés. La progression des exercices est désormais conservée au changement d'onglet et le raccourci pédagogique interrompt les calculs/animations.

## Limites connues

- Les recherches s'arrêtent après 250 000 états ou 6 secondes. Aucune promesse de résoudre rapidement toute grille 4×4 ou 5×5.
- Le contrôle axe et les parcours clavier ne constituent pas un audit exhaustif RGAA avec lecteurs d'écran.
- L'hébergement utilise Cloudflare Workers gratuit avec une source de build publique fixe sur GitHub. Les quotas gratuits et les caches fournisseurs s'appliquent.
- Les résultats pédagogiques restent en mémoire de la page ; les parties utilisent le stockage local de l'appareil.
