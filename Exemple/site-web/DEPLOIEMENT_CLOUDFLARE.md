# Déploiement Cloudflare Pages — Freelance Nexus

Suivez ces étapes pour déployer le site sur Cloudflare Pages :

1.  **Préparation du dossier build** :
    Assurez-vous que tous les fichiers sont dans le dossier `site-web/` :
    - `index.html` (Landing page)
    - `missions.html` (Dashboard)
    - `profil.html` (Profil utilisateur)
    - `abonnement.html` (Gestion abonnement)
    - `login.html` (Connexion)
    - `css/styles.css`
    - `js/main.js`
    - `js/api.js`
    - `_headers` (Configuration CORS/Security)
    - `_redirects` (Gestion des routes SPA si nécessaire)

2.  **Configuration Cloudflare** :
    - Allez dans votre dashboard Cloudflare > Workers & Pages.
    - Cliquez sur **Create application** > **Pages** > **Connect to Git** (ou Upload directement).
    - Sélectionnez votre dépôt.
    - **Build settings** :
        - FrameWork preset: `None`
        - Build command: `None` (fichiers statiques)
        - Build output directory: `site-web`

3.  **Configuration des Webhooks n8n** :
    Vérifiez que `js/api.js` et `js/main.js` utilisent les bonnes URLs de production de votre instance n8n.

4.  **Nom de domaine** :
    Configurez votre domaine personnalisé (ex: `freelance-nexus.com`) dans l'onglet "Custom domains" de votre projet Cloudflare Pages.