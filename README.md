# ΠΡΙΜΕ — portfolio officiel

Projet source Next.js App Router / TypeScript. Identité éditoriale claire et sombre, cinq palettes, FR/EN, scène React Three Fiber différée, GSAP, Zustand, administration serveur et stockage JSON atomique.

## Démarrer

Node **22.18+** et npm sont nécessaires sur votre machine.

```sh
npm install
cp .env.example .env.local
npm run hash-password
# Copier le hash généré dans ADMIN_PASSWORD_HASH de .env.local.
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
# Copier la sortie dans SESSION_SECRET.
npm run dev
```

Ouvrir `http://localhost:3000`, administration sur `/admin` (aucun lien public vers la connexion). Aucune inscription ni OAuth. L’entrée administration apparaît dans la navigation seulement après authentification. Aucun identifiant individuel pour les opérateurs.

Le fichier `.env.local` est interprété par Next.js : **entourer le hash scrypt de guillemets simples** et **échapper chaque dollar avec un antislash** pour éviter l’expansion dotenv (`scrypt\$…\$…`). Ne partagez ni hash ni secret. Aucun mot de passe préconfiguré. `SITE_URL` doit être exactement l’origine de votre site. En production : HTTPS obligatoire, cookie Secure.

## Vérifier et construire

```sh
npm run typecheck
npm test
npm run build
npm start
```

Exécuter ces commandes après installation avant mise en production. Un lockfile sera créé par `npm install` : le committer puis utiliser `npm ci` pour les déploiements reproductibles. Les versions de correctif sont volontairement résolues à l’installation ; vérifier les avis de sécurité et `npm audit` avant déploiement. Aucun `node_modules`, secret ou build machine-spécifique dans le ZIP.

## Contenu

- Source initiale : `data/defaultData.ts`. Les seules statistiques revendiquées sont celles du brief.
- Cinq profils `PLACEHOLDER`, aucune certification ou identité inventée.
- Trois writeups `DEMO` sans fausse URL de publication. Grille de neuf maximum par page ; ajouter des entrées depuis l’administration pour atteindre plusieurs pages. Aucun podium inventé. Les trois étapes sont des jalons sans date : aucun ordre chronologique fictif n’est revendiqué. Les entrées datées sont triées par date décroissante, puis les non datées dans leur ordre de saisie.
- Arsenal proposé, non confirmé, regroupé par libellé d’usage.
- Logos JPG originaux dans `public/logos/originals/`, SVG reconstruit dans `public/logos/` et composant `Logo`. Il s’agit d’une adaptation vectorielle manuelle proche des formes fournies, pas d’un tracé certifié identique au pixel. Le petit drapeau lime et le trait rouge sont conservés. La couleur principale suit le thème.
- Fonts locales : Barlow Condensed (titres) et DM Mono (texte technique), sous SIL OFL. Aucun appel Google Fonts au runtime. Les glyphes grecs du nom peuvent utiliser la police système de repli.
- L’accroche anglaise et le manifeste anglais sont délibérément identiques dans les deux langues, comme demandé ; le reste est traduit.
- Les liens réseaux sont ceux fournis, non des profils vérifiés. Discord est un lien générique à remplacer.

## Administration

L’éditeur JSON est **fonctionnel**, orienté administrateur technique : collections distinctes, création à partir de gabarits, suppression confirmée, publication/masquage, champs FR/EN, validation Zod serveur et rapport des chemins invalides. Enregistrer applique la collection entière. Modifier `published` masque une entrée ; elle n’est alors plus incluse dans l’API publique ni dans le rendu serveur public. Les données de type paramètres/textes sont éditées directement. Les liens HTTPS sont validés ; un writeup réel publié exige un lien Medium. Les dates sont validées. Les couleurs sont vérifiées pour le contraste des textes.

Les boutons Ajouter/Publier/Masquer/Supprimer modifient le brouillon de l’éditeur ; cliquer **Enregistrer** pour persister. Les gabarits sont explicitement temporaires. Les collections paramètres et textes ne sont pas des tableaux et n’ont pas de boutons de publication. Les détails techniques bruts sont laissés dans l’éditeur, l’interface et les retours sont FR/EN. Le jeton de révision évite d’écraser des modifications concurrentes.

Sessions HMAC signées, HttpOnly, SameSite Strict, 8 heures, cookies Secure en production. Mot de passe scrypt avec sel aléatoire, secret indépendant, contrôles serveur à chaque écriture, vérification Origin et jeton CSRF. Limite globale persistante de 5 tentatives de connexion par 15 minutes sans conserver d’IP. Cette limite peut être utilisée pour provoquer un déni d’accès à l’administrateur : ajouter une limitation au reverse proxy adaptée au déploiement. Déconnexion supprime le cookie courant ; un cookie volé reste valable jusqu’à expiration (pas de révocation centrale). Changez SESSION_SECRET pour révoquer toutes les sessions.

## Persistance et déploiement

`DATA_DIR` (par défaut `./var`) doit être sur **un disque persistant d’un seul serveur Node**. Les écritures passent par un verrou de fichier puis un renommage atomique, permissions privées. Ce stockage n’est **pas une base de données de production distribuée** et ne convient pas aux instances multiples, aux systèmes de fichiers réseau ou aux fonctions serverless éphémères. Pour ces environnements, remplacer `lib/database.ts` par une base partagée transactionnelle. Sauvegarder régulièrement `store.json`, hors du dossier public. Ne pas modifier le JSON pendant une écriture. Les verrous abandonnés expirent après 30 s ; les transactions sont conçues pour être très courtes.

Compteur : API dédiée, jeton aléatoire de session navigateur HttpOnly et déduplication persistante par empreinte SHA-256, garde sessionStorage côté onglet. Pas d’IP, user agent, géolocalisation ou fingerprinting. Les empreintes de session sont des identifiants techniques pseudonymes et non des identités : les traiter comme des données techniques dans votre politique de confidentialité. Elles sont conservées pour éviter tout recomptage d’une même session longue. Prévoir une politique de rétention adaptée en acceptant le compromis de déduplication. Un visiteur bloquant/supprimant les cookies ou un robot peut gonfler le compteur : ce n’est pas une mesure d’audience certifiée. Ajouter une limitation de débit au proxy si nécessaire.

## SEO

Métadonnées serveur selon cookie de langue, canonical si SITE_URL défini, description FR/EN, Open Graph, Twitter et favicon. Le commutateur de langue ne recharge pas la page, mémorise le choix et met à jour les métadonnées principales. La page initiale est rendue serveur et indexable sans WebGL. L’image Open Graph SVG fournie est remplacée dans le packaging par une PNG pour la compatibilité des plateformes. Pas d’URL de domaine inventée. Pas de formulaire de contact.

## Accessibilité et performance

Navigation sémantique, lien d’évitement, focus visible, menu mobile natif dans le flux (Échap ferme et restitue le focus), labels, filtres à boutons avec état, pagination avec aria-current et annonce de page, dialogue natif avec gestion du focus navigateur. WebGL désactivé sur mobile et si mouvement réduit, erreur capturée, alternative statique décorative. Aucune information uniquement 3D. Animations GSAP nettoyées et compteurs une fois par apparition initiale ; prefers-reduced-motion supprime les transitions. Scène démontée hors écran. Polices locales, DPR plafonné. La bibliothèque est chargée dans un chunk dynamique.

Les palettes par défaut ont été calculées pour les contrastes des accents sur leur fond. Une conformité WCAG AA globale nécessite encore un audit manuel et technologies d’assistance sur le site déployé. Le terminal n’exécute **aucune commande système** : seulement help/about/skills/clear en mémoire.

## Limites de sécurité à traiter au déploiement

La CSP fournie est compatible avec Next et R3F, mais autorise encore inline/eval : durcir via nonce à la requête après validation du build, et retirer unsafe-eval en production si compatible. Activer HSTS au proxy HTTPS. Aucun audit de pénétration n’est revendiqué. Mettre à jour les dépendances, vérifier les URLs, restaurer une sauvegarde en test et utiliser une protection d’accès additionnelle pour /admin si nécessaire.

## Référence artistique

La page publique codecraftai.org a été consultée au développement : navigation légère, grands titres et rythme éditorial. Aucun contenu ou média CodeCraft n’est embarqué. L’identité et le monogramme appartiennent aux visuels fournis par l’équipe.

## Gestion des membres et avatars

Dans `/admin`, la collection des membres dispose maintenant de deux modes synchronisables : **Formulaire** et **JSON**. Le bouton JSON exporte toute la liste du formulaire ; le bouton Formulaire importe la liste JSON après vérification de sa structure. Les autres collections conservent leur éditeur JSON.

Les avatars acceptent les formats **JPEG, PNG et WebP**, jusqu’à **3 Mio** par fichier. Les images sont conservées dans `DATA_DIR/avatars` et leur chemin est enregistré dans le JSON du membre. Le serveur vérifie la session admin, le jeton CSRF, la signature réelle du fichier et le nom aléatoire de l’image. En production, sauvegardez tout le répertoire `DATA_DIR` (données JSON et avatars) et utilisez un stockage persistant sur un serveur Node.

## Catégories et bande défilante

La bande du hero et le graphique « Performance by Category » utilisent les mêmes 14 catégories, avec les scores fournis. La bande défile de droite à gauche en continu ; si la préférence système réduit les animations, les catégories restent visibles en lignes statiques. Lors d’une mise à jour, seules les anciennes listes de démonstration intactes sont migrées automatiquement dans `DATA_DIR/store.json` ; les listes déjà personnalisées ne sont pas remplacées.


## Compteur de pages vues et compétitions

Le compteur affiché en bas de la page additionne les chargements de la page : chaque ouverture/actualisation envoie une requête d’incrémentation. Il s’agit d’un **nombre de pages vues**, pas d’un nombre fiable de personnes uniques; les robots et les rechargements peuvent donc aussi le faire monter. Le compteur ne lit ni ne crée d’identifiant visiteur, ne conserve pas d’adresse IP et ne tente pas de reconnaître les personnes. Une réponse retire aussi l’ancien cookie `signal_visit` s’il existe encore; l’ancien champ d’empreintes `visitSessions` est supprimé lors de la prochaine écriture du stockage, tandis que le total déjà présent est conservé. Les journaux techniques éventuels de l’hébergeur sont indépendants de ce compteur et dépendent de sa configuration.

En production, le total est stocké dans `DATA_DIR/store.json`. Il faut un serveur Node avec disque persistant et une seule instance partageant ce fichier; un stockage éphémère, serverless ou plusieurs instances sans base/stockage partagé ne garantit pas un total cohérent. Si l’installation possède déjà un ancien total, il est conservé, mais son historique provenait de l’ancien comptage par session et ne peut pas être reconverti rétroactivement en pages vues exactes.

Les 22 résultats fournis sont dans la collection `achievements` (menu « Parcours »). Ils sont affichés comme compétitions avec la place, le nombre total d’équipes, les points CTF et les rating points. Les valeurs de points sont conservées comme texte pour garder exactement les virgules fournies; aucune date n’a été inventée.

## Guide des champs JSON de l’administration

Les menus affichent un éditeur JSON pour toute la collection (tableau) ou pour l’objet unique (Textes et Settings); les membres disposent en plus d’un formulaire. Les clés ci-dessous sont en anglais dans le code. Respecter les noms, types et valeurs indiqués; chaque `id` doit être unique. Pour les champs `Localized`, saisir **les deux langues**, par exemple `{"fr":"Texte français","en":"English text"}`. Ne pas supprimer les champs obligatoires d’un objet; le bouton **Enregistrer** valide les données avant de les écrire.

### `texts` — textes du site

Objet unique (pas une liste) :
- `intro`, `signature`, `identity`, `hero`, `manifesto` : textes éditoriaux en français et en anglais (`{fr,en}`).
- `principles` : liste de textes `{fr,en}` affichés dans le manifeste.

### `members` — membres de l’équipe

Chaque objet membre :
- `id` : identifiant interne unique, lettres/chiffres/`_`/`-`.
- `handle` : pseudonyme affiché; `publicId` : identifiant public court du membre.
- `role`, `specialty` : rôle et spécialité, chacun au format `{fr,en}`.
- `categories` : liste des catégories de compétences associées au membre.
- `certifications` : liste de noms de certifications réellement obtenues.
- `avatar` : chemin d’avatar géré par l’administration; utiliser le formulaire de téléversement plutôt qu’une image encodée dans le JSON. `avatarUrl` est facultatif et réservé au chemin serveur `/api/prime/avatars/<uuid>.<jpg|png|webp>` généré par l’upload; ne pas y mettre une URL externe.
- `active` : membre actif dans la présentation de l’équipe; `order` : position numérique d’affichage (à partir de 0); `published` : visibilité publique.
- `links` : liste de liens `{label,url}` du membre; les URL doivent être HTTPS.

### `achievements` — parcours et compétitions

Chaque entrée :
- `id` : identifiant unique; `kind` : `"milestone"` pour une étape ou `"competition"` pour un résultat CTF.
- `title`, `context` : titre et contexte en `{fr,en}`; le contexte peut être vide.
- `location` : lieu; `date` : date au format `AAAA-MM-JJ` ou `null` si inconnue; `platform` : plateforme ou type d’événement.
- `rank` : place numérique (1 = première place) ou `null`; `totalTeams` : nombre total d’équipes ou `null` si inconnu.
- `score` : points CTF sous forme de texte; `ratingPoints` : rating sous forme de texte. Les laisser vides quand ils ne s’appliquent pas; conserver les séparateurs tels qu’affichés.
- `highlights`, `skills` : listes de chaînes de caractères; `published` : afficher ou masquer l’entrée.
- Pour `kind:"milestone"`, `rank` et `totalTeams` doivent être `null`, et `score` / `ratingPoints` vides. Pour une compétition, renseigner les chiffres disponibles; la date peut rester `null` si elle n’a pas été fournie.

### `writeups` — articles et writeups

Chaque objet : `id`, `title:{fr,en}`, `challenge` (nom du challenge), `ctf` (nom du CTF), `category` (une valeur parmi `WEB`, `CRYPTO`, `FORENSICS`, `OSINT`, `REVERSE`, `PWN`, `MISC`), `difficulty` (`EASY`, `MEDIUM`, `HARD`, `INSANE`), `author` (pseudonyme), `date` (date ou `null`), `excerpt:{fr,en}`, `tags` (liste), `url` (URL HTTPS ou chaîne vide), `demo` (vrai si c’est un exemple de présentation), `published` (visibilité), `content:{fr,en}` (contenu). Un writeup réel publié (`demo:false`) doit avoir une URL Medium valide.

### `tools` — arsenal / outils

Chaque objet : `id` (unique), `name` (nom), `group:{fr,en}` (famille), `description:{fr,en}` (description), `confirmed` (outil effectivement utilisé/vérifié par l’équipe), `published` (visibilité).

### `stats` — chiffres clés

Chaque objet : `id`, `value` (nombre, sans unité), `suffix` (unité ou suffixe affiché, éventuellement vide), `label:{fr,en}` (intitulé). Utiliser une valeur numérique, pas un texte contenant une unité.

### `categories` — Scores / performance par catégorie

Chaque objet contient `name` (nom de catégorie) et `value` (score numérique de 0 à 100). Ces catégories alimentent le graphique et la bande du site.

### `domains` — domaines de compétence

Liste de chaînes de caractères (pas des objets), par exemple `"WEB SECURITY"`. Ces noms servent aux options de catégories/compétences dans l’administration; garder les noms cohérents avec `categories` et les catégories des membres.

### `socials` — réseaux et liens publics

Chaque objet : `id`, `label` (nom affiché), `url` (URL HTTPS), `published` (afficher ou masquer le lien).

### `palettes` — thèmes de couleurs

Chaque objet : `id`, `name`, `dark`, `light`, `lightAccent`, `darkAccent`, `secondary`. Les cinq champs couleur doivent être des codes hexadécimaux `#RRGGBB`; garder le contraste requis par le validateur. `id` doit correspondre à `settings.defaultPalette` si cette palette est choisie par défaut.

### `settings` — paramètres du site

Objet unique : `defaultTheme` (`"light"` ou `"dark"`), `defaultPalette` (identifiant existant dans `palettes`), `defaultLanguage` (`"fr"` ou `"en"`) et `enable3d` (booléen `true`/`false`).

## Résumé pratique : que faire dans chaque menu

1. Ouvrir `/admin`, se connecter, puis choisir la collection dans le menu.
2. Pour **Textes**, modifier les valeurs `fr` et `en`. Pour **Membres**, choisir **Formulaire** ou **JSON**, puis **Ajouter**; renseigner le profil et l’avatar dans le formulaire si nécessaire.
3. Pour **Parcours**, choisir **Ajouter**, remplacer le modèle par les informations voulues, puis sélectionner `kind:"competition"` pour un CTF. Renseigner `title.fr`, `title.en`, `rank`, `totalTeams`, `score` et `ratingPoints`; garder `date:null` si la date est inconnue. Enregistrer puis publier l’entrée.
4. Pour **Writeups**, ajouter l’article, renseigner son challenge, son CTF, son auteur, son contenu et son URL; un vrai article publié doit pointer vers Medium. Pour **Arsenal**, saisir nom, famille, description et état `confirmed`.
5. Pour **Stats**, ajouter/modifier les nombres clés. Pour **Scores**, modifier les valeurs `name`/`value`; pour **Domains**, gérer la liste d’options et garder les libellés cohérents.
6. Pour **Réseaux sociaux**, ajouter le libellé et l’URL HTTPS. Pour **Palettes**, modifier les codes couleur en respectant le contraste et vérifier la palette par défaut dans **Settings**.
7. Dans **Settings**, choisir le thème, la langue et la palette existante. Dans tout menu avec un champ `published`, utiliser **Publier** ou **Masquer**. Enfin, cliquer **Enregistrer** et corriger les éventuelles erreurs de validation affichées.
