# 📋 Liste des URLs à Configurer

Après avoir déployé le site sur CloudFlare Pages, vous devrez mettre à jour les URLs suivantes.

## 🌐 URL du Site

**Votre URL CloudFlare Pages sera du type :**
- `https://freelance-nexus.pages.dev` (sous-domaine par défaut)
- `https://votre-domaine.com` (si vous configurez un domaine personnalisé)

---

## 📧 URLs dans les Emails (Workflow B)

Les emails contiennent actuellement des liens vers `https://votre-plateforme.com`. 

### Script de mise à jour automatique

Utilisez le script PowerShell fourni pour mettre à jour toutes les URLs en une seule commande :

```powershell
.\update-urls-workflows.ps1 -SiteUrl "https://votre-site-reel.pages.dev"
```

### Ou manuellement : URLs à remplacer

Dans **WORKFLOW B — Newsletter + Envoi + Stripe Webhooks.json**, recherchez et remplacez :

| Ancien | Nouveau |
|--------|---------|
| `https://votre-plateforme.com/missions` | `https://VOTRE-SITE.pages.dev/missions.html` |
| `https://votre-plateforme.com/profil` | `https://VOTRE-SITE.pages.dev/profil.html` |
| `https://votre-plateforme.com/abonnement` | `https://VOTRE-SITE.pages.dev/abonnement.html` |
| `https://votre-plateforme.com` | `https://VOTRE-SITE.pages.dev` |

### Emplacements spécifiques

1. **📧 Email Newsletter (node "Génère Email HTML Personnalisé")**
   - CTA principal : "ACCÉDER À MES MISSIONS"
   - Lien du logo "FREELANCE // NEXUS"

2. **📧 Email de Bienvenue (node "📧 Email de Bienvenue")**
   - CTA : "ACCÉDER À MON TABLEAU DE BORD"
   - Lien : "Configurer mes préférences"

3. **📧 Email de Rétention (node "📧 Email de Rétention")**
   - CTA : "GARDER MON ABONNEMENT"
   - Lien : "Partager mon feedback"

---

## ⚙️ URLs dans config.js

Dans `site-web/config.js` (à créer depuis `config.example.js`), configurez :

```javascript
const CONFIG = {
  // URL de votre site
  SITE_URL: 'https://VOTRE-SITE.pages.dev',
  
  // Webhooks n8n
  API: {
    SIGNUP: 'https://VOTRE-N8N.com/webhook/signup',
    LOGIN: 'https://VOTRE-N8N.com/webhook/login',
    GET_MISSIONS: 'https://VOTRE-N8N.com/webhook/get-missions',
    CREATE_CHECKOUT: 'https://VOTRE-N8N.com/webhook/create-checkout',
    MANAGE_SUBSCRIPTION: 'https://VOTRE-N8N.com/webhook/manage-subscription',
    UPDATE_PROFILE: 'https://VOTRE-N8N.com/webhook/update-profile',
    GET_PROFILE: 'https://VOTRE-N8N.com/webhook/get-profile',
  },
  
  // Stripe
  STRIPE: {
    PUBLIC_KEY: 'pk_live_...',  // Votre clé publique Stripe
  },
  
  // Plans
  PLANS: {
    STARTER: {
      priceId: 'price_...',  // ID de prix Stripe pour Starter
      name: 'Starter',
      price: 19,
    },
    PRO: {
      priceId: 'price_...',  // ID de prix Stripe pour Pro
      name: 'Pro',
      price: 39,
    },
  },
};
```

---

## 🔗 Webhooks n8n à Créer

Dans vos workflows n8n, créez les webhooks suivants :

| Webhook | Workflow | Description |
|---------|----------|-------------|
| `/webhook/signup` | Workflow B | Inscription nouvel utilisateur |
| `/webhook/login` | Workflow B | Connexion utilisateur |
| `/webhook/get-missions` | Workflow A | Récupération missions matchées |
| `/webhook/create-checkout` | Workflow D | Création session Stripe |
| `/webhook/manage-subscription` | Workflow D | Gestion abonnement |
| `/webhook/update-profile` | Workflow B | Mise à jour profil |
| `/webhook/get-profile` | Workflow B | Récupération profil |

---

## ✅ Checklist de Configuration

- [ ] Site déployé sur CloudFlare Pages
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] URL du site notée : `___________________`
- [ ] Script `update-urls-workflows.ps1` exécuté
- [ ] `config.js` créé et configuré
- [ ] Webhooks n8n créés et URLs notées
- [ ] Clés Stripe configurées (publique dans config.js)
- [ ] Plans Stripe créés et IDs notés
- [ ] Test complet effectué (signup → mission → abonnement)

---

## 🚀 Ordre de Configuration Recommandé

1. **Déployer le site sur CloudFlare Pages**
   - Récupérer l'URL finale

2. **Créer les webhooks dans n8n**
   - Activer les workflows A, B, C, D
   - Noter les URLs des webhooks

3. **Configurer config.js**
   - Copier `config.example.js` → `config.js`
   - Remplir toutes les URLs

4. **Mettre à jour les workflows**
   - Exécuter `update-urls-workflows.ps1`
   - Ou remplacer manuellement

5. **Re-déployer le site avec config.js**
   - Pousser les changements sur Git
   - CloudFlare déploiera automatiquement

6. **Tester le flux complet**
   - Inscription → Email → Missions → Abonnement

---

## 📝 Notes

- Les URLs avec `votre-plateforme.com` sont des placeholders
- Toutes les URLs doivent utiliser HTTPS
- Les webhooks n8n doivent être publics (non protégés par auth pour simplifier)
- Pour la sécurité, ajoutez une clé API secrète dans les headers si nécessaire

---

**Besoin d'aide ?** Consultez `DEPLOIEMENT_CLOUDFLARE.md` pour le guide complet.
