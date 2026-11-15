# TAQUIN LAB — plan et décisions

Objectif : application statique française, gratuite, pédagogique, React/TypeScript/Vite/Tailwind, déployée automatiquement depuis GitHub.
L'utilisateur délègue les décisions et demande une exécution autonome jusqu'à publication.

Architecture : moteur pur (grilles et recherches), Worker annulable, composants React (jeu, laboratoire, récursivité, exercices), stockage local versionné validé. Aucun service payant, compte élève ou traçage.

1. Moteur : tests des déplacements, parité, mélange soluble, Manhattan, BFS/A*/IDA*, limites. Implémenter puis valider avec Vitest.
2. Interface : plateau 3/4/5, clavier, annulation, timer, sauvegarde, solveur animé avec interruption. Vérifier avec Playwright desktop/mobile.
3. NSI : progression du PDF (aplatir, position_vide, bien_placees, est_resolu, voisins, recherche bornée, extraire_tuiles), pile interactive et exercices corrigés. Comparaison sur le même état avec mesures réelles.
4. Qualité : tests navigateurs des parcours, stockage corrompu, victoire, annulation, clavier et axe. Build strict et contrôle visuel.
5. Livraison : README, MIT, CI et déploiement gratuit Cloudflare Pages ou GitHub Pages ; vérifier URL réelle.

Contraintes : BFS uniquement 3×3, A* et IDA* bornés en nœuds/temps, aucun succès annoncé sur une recherche interrompue. Mélanges légaux sur toutes tailles. Directions du programme = mouvement du vide (comme PDF). Sauvegarde locale indisponible = jeu utilisable avec avertissement.

Risques à vérifier : état restauré invalide ; résultats de Worker périmés ; changement de taille pendant animation ; grilles 5×5 difficiles ; débordement mobile ; départ/arrêt timer et victoire unique.
