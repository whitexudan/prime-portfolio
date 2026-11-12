# Vérifications de livraison — 12 novembre 2026

## Réussites observées

- Compilation réelle **Next.js 15.5.9** en production, compilation Webpack/SWC, contrôle TypeScript, collecte des données de pages, génération et traces : code de sortie **0**. Le lint n’a pas été configuré ; `--no-lint` était utilisé.
- Contrôle `tsc --noEmit` : code de sortie **0**.
- Deux tests Node : hash scrypt/mot de passe correct et incorrect ; signature, altération et expiration de sessions : réussis.
- Validation Zod : données initiales valides. Sept altérations rejetées (URL dangereuse, pourcentage hors limites, date impossible, contraste insuffisant, classement sur un jalon, ID dupliqué, publication réelle sans source Medium).
- Stockage : 30 transactions concurrentes conservent les 30 incrémentations. Révisions de contenu différentes après modification ; brouillons filtrés par la fonction publique.
- 15 vérifications directes des **vrais Route Handlers** avec objets Request et NextResponse : écriture anonyme refusée ; lecture privée refusée ; origine étrangère refusée à la connexion et à l’écriture ; mot de passe invalide refusé ; cookie de session HttpOnly/Secure/SameSite strict ; mauvais CSRF refusé ; sauvegarde persistante ; membre masqué exclu de l’API publique ; conflit de révision 409 ; données invalides 400 ; visites origine étrangère refusées ; cinq répétitions d’une même session non recomptées ; session expirée refusée ; déconnexion Max-Age=0 ; limitation après cinq mots de passe incorrects.
- Navigateur Chromium, largeurs **1440 px** et **390 px**, composants React publics réels : aucun débordement horizontal, cinq opérateurs présents, accroche présente, polices locales chargées.
- Sur un jeu **de test uniquement** de 20 entrées explicitement DEMO : neuf cartes à la première page, passage page 2, recherche sans résultat et retour page 1, filtre podium vide, langue EN sans rechargement, terminal about : réussis sur desktop et mobile. La livraison ne contient que les trois DEMO du contenu initial, pas les 20 entrées de test.
- Revue visuelle des captures : hero desktop et mobile, roster desktop, statistiques desktop et début de bibliothèque mobile. Contraste lisible et aucun chevauchement indésirable constaté sur ces vues. Le bas de certaines sections est naturellement hors du viewport et n’est pas présenté comme entièrement capturé.
- Corrections après revue : retrait du décor orbital sur mobile, retour à la ligne du bandeau de domaines et retrait des coordonnées du bord du cadre. L’image Open Graph est fournie en PNG et SVG.

## Méthode et limites

Le sandbox n’avait ni npm ni serveur local utilisable. Les dépendances nécessaires aux contrôles ont été téléchargées comme tarballs publics npm puis installées manuellement dans un répertoire de test. Le vrai compilateur Next.js a ensuite été exécuté. Cette procédure ne remplace pas votre `npm install`, le lockfile et l’audit des dépendances au déploiement.

L’ouverture d’un serveur HTTP local était refusée par l’environnement. Les tests navigateur utilisent un harnais `file://` avec les composants réels, un adaptateur `next/dynamic` et une API de données simulée. Les tests de Route Handlers appellent séparément le code serveur réel et simulent **uniquement le contexte des cookies Next.js**, sans serveur HTTP. Ils ne constituent pas un test E2E réseau du navigateur à Next.js. Aucun test de charge ni audit de pénétration n’est revendiqué.

Les captures de section ont été réalisées en isolant la section en haut du viewport : un premier essai par défilement programmatique produisait des captures vides dues au rendu du navigateur de test. Les nouvelles captures contiennent les chiffres et les cartes et ont été revues.

La scène 3D est compilée dans un chunk différé. Le rendu logiciel WebGL, s’il peut être vérifié dans cet environnement, fait l’objet d’une note distincte ; ne pas déduire un test graphique complet du simple succès de compilation. Les captures publiques utilisent l’alternative statique sans WebGL. Les performances GPU des appareils réels restent à mesurer.

Restent à réaliser sur votre serveur : démarrage HTTP réel, parcours connexion/édition/déconnexion complet, vérification des cookies derrière votre proxy HTTPS, restauration d’une sauvegarde, contrôle clavier et lecteur d’écran exhaustif, audit WCAG AA complet, mesure Lighthouse et tests sur navigateurs/appareils réels. Le projet n’est pas publié en ligne par cette livraison.

## Contenu à renseigner

Les cinq profils sont PLACEHOLDER, les writeups DEMO et les outils proposés. Aucun nom réel, certification, compétition ou classement n’a été inventé. Vérifiez les liens réseaux fournis et remplacez notamment l’adresse Discord générique. Configurez le compte administrateur et le secret de session avant de vous connecter.

## Mise en production

Un seul serveur Node avec un disque persistant pour le stockage JSON. Pas de stockage éphémère serverless ni d’instances multiples sans remplacer la couche de persistance. Voir README pour la rétention des identifiants pseudonymes du compteur, les limites du throttling global, les sauvegardes, la CSP et la révocation des sessions.
