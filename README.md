# Football Net Actu

Un site complet d'actualités sur le football avec un frontend statique et un backend serverless via Netlify Functions.

## Architecture

- **Frontend** : HTML5, CSS3, JavaScript Vanilla, Bootstrap 5.
- **Backend** : Netlify Functions (Node.js).
- **Base de données** : Fichier local `db.json` manipulé via le module `fs` (démonstration).

> ⚠️ **Note sur la persistance** : L'utilisation de `fs.writeFileSync` dans des fonctions serverless (comme sur AWS Lambda ou Netlify) ne permet pas une persistance de données réelle entre différentes requêtes en production, puisque le système de fichiers y est en lecture seule ou éphémère. Cette structure `db.json` est utilisée ici **à titre de démonstration** et fonctionne parfaitement en environnement de développement local (`netlify dev`). Pour une vraie mise en production, remplacez la logique `fs` par une base de données cloud (MongoDB, Supabase, Firebase).

## Démarrage rapide

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configuration** :
   Créez un fichier `.env` à la racine (ou copiez `.env.example`) :
   ```
   ADMIN_PASSWORD=admin123
   ```

3. **Tester en local (Netlify CLI)** :
   Si vous utilisez la CLI Netlify, lancez simplement :
   ```bash
   netlify dev
   ```
   *Alternative* : Dans cet environnement de test, un serveur Express léger simule le comportement de Netlify :
   ```bash
   npm run dev
   ```

4. **Déployer sur Netlify** :
   - Poussez ce code sur un dépôt GitHub.
   - Connectez votre dépôt à Netlify.
   - Netlify lira automatiquement le fichier `netlify.toml` et publiera le site.

## Espace Administration

- **URL** : `/admin/index.html` ou `/admin/dashboard.html`
- **Mot de passe par défaut** : `admin123` (configurable dans le fichier `.env`)

L'espace admin permet d'ajouter, éditer, et supprimer des articles.

## Mise à jour RSS

Le flux RSS de L'Équipe est récupéré automatiquement par le fichier `/netlify/functions/rss-update.js`. Vous pouvez déclencher une mise à jour manuellement via le bouton "Actualiser les flux RSS" présent sur le frontend.
