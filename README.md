# legos.fredf.fr

Site statique (HTML/CSS/JS, aucune dépendance, aucun build) qui liste ma collection LEGO.

## Ajouter un set

Modifier uniquement `sets.js` : copier une ligne, changer `num`, `name`, `theme`
(et `notices` si besoin, l'identifiant du PDF de notice). Mettre à jour `updated`.
L'image est récupérée automatiquement depuis le numéro (Rebrickable, sinon Brickset).

Pour un nouveau thème, ajouter sa couleur dans `THEMES` en haut de `app.js`
(sinon il apparaît en gris, en fin de liste).

## Lien direct de vérification

`https://legos.fredf.fr/?q=10318` ouvre la page avec la recherche déjà faite.

## Mise en ligne

Copier les fichiers `index.html`, `styles.css`, `app.js`, `sets.js` (et `CNAME` pour GitHub Pages)
à la racine de l'hébergement, puis faire pointer le sous-domaine :

- **GitHub Pages** : pousser le dossier dans un dépôt, activer Pages ; DNS : `CNAME legos → <utilisateur>.github.io`
- **Netlify / Cloudflare Pages** : glisser-déposer le dossier, ajouter le domaine personnalisé
- **Hébergement classique (OVH…)** : envoyer les fichiers par FTP dans le dossier du sous-domaine
