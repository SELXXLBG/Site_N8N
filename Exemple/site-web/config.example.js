// ⚙️ CONFIGURATION DU SITE FREELANCE NEXUS
// Dupliquez ce fichier en "config.js" et remplissez vos valeurs

const CONFIG = {
  // URL de votre site (à mettre à jour après déploiement CloudFlare)
  SITE_URL: 'https://votre-site.pages.dev',
  
  // Webhooks n8n (à créer dans vos workflows)
  API: {
    // Workflow B - Newsletter
    SIGNUP: 'https://votre-n8n.com/webhook/signup',
    LOGIN: 'https://votre-n8n.com/webhook/login',
    
    // Workflow A - Récupération des missions
    GET_MISSIONS: 'https://votre-n8n.com/webhook/get-missions',
    
    // Workflow D - Stripe
    CREATE_CHECKOUT: 'https://votre-n8n.com/webhook/create-checkout',
    MANAGE_SUBSCRIPTION: 'https://votre-n8n.com/webhook/manage-subscription',
    
    // Profil utilisateur
    UPDATE_PROFILE: 'https://votre-n8n.com/webhook/update-profile',
    GET_PROFILE: 'https://votre-n8n.com/webhook/get-profile',
  },
  
  // Stripe (clés publiques uniquement)
  STRIPE: {
    PUBLIC_KEY: 'pk_test_...',  // Votre clé publique Stripe
  },
  
  // Plans d'abonnement (prix Stripe)
  PLANS: {
    STARTER: {
      priceId: 'price_starter_monthly',
      name: 'Starter',
      price: 19,
    },
    PRO: {
      priceId: 'price_pro_monthly',
      name: 'Pro',
      price: 39,
    },
  },
  
  // Google Sheets ID (pour les données publiques si besoin)
  GSHEET_ID: 'votre-google-sheet-id',
  
  // Telegram (pour les alertes si activées)
  TELEGRAM: {
    BOT_USERNAME: '@FreelanceNexusBot',
  },
};

// Export pour utilisation dans les autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
