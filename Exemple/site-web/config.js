// Configuration Freelance Nexus
// ⚠️ NE PAS COMMITER CE FICHIER AVEC DES CLÉS RÉELLES

const CONFIG = {
  // URL de base du site
  BASE_URL: 'https://66c6a48a.freelance-2as.pages.dev',

  // URLs des APIs n8n (webhooks)
  // TODO: Remplacer par vos vraies URLs de webhooks n8n
  API: {
    // Authentification
    login: 'https://votre-instance-n8n.com/webhook/login',
    signup: 'https://votre-instance-n8n.com/webhook/signup',

    // Missions
    getMissions: 'https://votre-instance-n8n.com/webhook/get-missions',
    saveMission: 'https://votre-instance-n8n.com/webhook/save-mission',

    // Profil utilisateur
    getProfile: 'https://votre-instance-n8n.com/webhook/get-profile',
    updateProfile: 'https://votre-instance-n8n.com/webhook/update-profile',

    // Abonnement Stripe
    createCheckout: 'https://votre-instance-n8n.com/webhook/create-checkout',
    customerPortal: 'https://votre-instance-n8n.com/webhook/customer-portal',
    getSubscription: 'https://votre-instance-n8n.com/webhook/get-subscription',
    cancelSubscription: 'https://votre-instance-n8n.com/webhook/cancel-subscription'
  },

  // Stripe (clé publique uniquement)
  STRIPE: {
    publicKey: 'pk_test_VOTRE_CLE_PUBLIQUE_STRIPE' // TODO: Remplacer
  },

  // Plans d'abonnement (synchronized avec Stripe)
  PLANS: {
    starter: {
      priceId: 'price_STARTER_ID', // TODO: ID Stripe
      name: 'Starter',
      price: 29,
      features: [
        '50 missions/mois',
        'Alertes email quotidiennes',
        'Support standard'
      ]
    },
    pro: {
      priceId: 'price_PRO_ID', // TODO: ID Stripe
      name: 'Pro',
      price: 79,
      features: [
        '200 missions/mois',
        'Alertes temps réel',
        'Support prioritaire',
        'Filtres avancés',
        'Exports CSV'
      ]
    },
    enterprise: {
      priceId: 'price_ENTERPRISE_ID', // TODO: ID Stripe
      name: 'Enterprise',
      price: 199,
      features: [
        'Missions illimitées',
        'Alertes Telegram',
        'Support dédié 24/7',
        'API personnalisée',
        'Intégrations sur mesure',
        'Analyses avancées'
      ]
    }
  },

  // Configuration des missions
  MISSIONS: {
    refreshInterval: 300000, // 5 minutes (en ms)
    pageSize: 20,
    maxSavedMissions: 100
  },

  // Configuration locale
  STORAGE_KEYS: {
    authToken: 'freelance_nexus_token',
    userProfile: 'freelance_nexus_profile',
    savedMissions: 'freelance_nexus_saved_missions',
    filters: 'freelance_nexus_filters'
  },

  // Mode développement
  DEBUG: true // Mettre à false en production
};

// Export pour utilisation dans les autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

