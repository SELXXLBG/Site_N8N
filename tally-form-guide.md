# Guide complet du formulaire Tally — Qualification de leads e-commerce IA n8n

---

## 1. Objectifs du formulaire

### 1.1 Qualifier les prospects
Le formulaire a pour but d'identifier les e-commerçants ayant un besoin réel et un potentiel commercial suffisant pour bénéficier d'automatisations IA via n8n. Chaque champ est conçu pour collecter une information stratégique permettant de scorer le lead.

### 1.2 Filtrer les non-sérieux
- Demander l'URL du site e-commerce permet de vérifier l'existence d'une activité réelle.
- Le champ "Budget estimé" agit comme filtre naturel — un prospect indiquant "< 500€" est automatiquement de moindre priorité.
- Le champ "Urgence" permet d'identifier les prospects chauds à traiter en priorité.

### 1.3 Maximiser le taux de complétion
- Formulaire découpé en étapes (multi-step) pour ne pas décourager.
- Barre de progression visible à chaque étape.
- Moins de 3 minutes pour compléter l'ensemble.
- Promesse de valeur claire dès la page d'accueil (mini-guide offert).
- Texte du bouton final engageant : **"Obtenir mon audit gratuit →"**

---

## 2. Configuration Tally (étape par étape)

### 2.1 Créer un compte sur tally.so
1. Rendez-vous sur [https://tally.so](https://tally.so).
2. Cliquez sur **"Get started for free"**.
3. Inscrivez-vous avec votre adresse email professionnelle ou via Google.
4. Confirmez votre email si demandé.

### 2.2 Créer un nouveau formulaire
1. Dans le tableau de bord Tally, cliquez sur **"New form"**.
2. Choisissez **"Start from scratch"** (ou utilisez un template et adaptez-le).
3. Donnez un titre interne au formulaire : `Qualification Leads IA n8n - E-commerce`.
4. Activez le mode **multi-step** (recommandé) en cliquant sur l'icône de mise en page et en sélectionnant "Multi-page".

### 2.3 Configurer le webhook vers n8n
1. Dans votre formulaire, allez dans **Settings** (icône engrenage) → **Integrations**.
2. Cliquez sur **"Webhooks"**.
3. Cliquez sur **"Add webhook"**.
4. Renseignez les champs :
   - **URL** : `https://VOTRE_N8N_DOMAIN/webhook/tally-leads`
   - **Method** : `POST`
   - **Events** : cochez `Form submission`
5. (Optionnel mais recommandé) Activez le **Signing secret** : copiez la clé générée et ajoutez-la dans n8n pour valider l'authenticité des requêtes.
6. Cliquez sur **"Save"**.
7. Utilisez le bouton **"Send test"** pour vérifier que n8n reçoit bien les données.

### 2.4 Paramètres de confidentialité et RGPD
1. Dans **Settings** → **General** :
   - Activez **"Show GDPR-compliant consent checkbox"** si vous ciblez des utilisateurs en Europe.
   - Texte de consentement recommandé : *"J'accepte que mes données soient utilisées pour me recontacter dans le cadre de ma demande d'audit. Aucune donnée ne sera revendue à des tiers."*
2. Dans **Settings** → **Privacy** :
   - Désactivez le tracking analytique Tally si vous préférez ne pas partager les données de navigation.
   - Ajoutez un lien vers votre politique de confidentialité.
3. Ajoutez une mention légale en bas du formulaire : *"Vos données sont traitées conformément au RGPD. Vous disposez d'un droit d'accès, de rectification et de suppression."*

---

## 3. Champs du formulaire (liste complète)

### Champ 1 — Prénom et Nom
| Propriété | Valeur |
|---|---|
| **Type Tally** | `INPUT_TEXT` |
| **Label** | Prénom et Nom |
| **Placeholder** | Jean Dupont |
| **Obligatoire** | ✅ Oui |
| **Logique conditionnelle** | Aucune |

> **Conseil** : Utiliser un seul champ "Prénom et Nom" plutôt que deux champs séparés réduit la friction et améliore le taux de complétion.

---

### Champ 2 — Email professionnel
| Propriété | Valeur |
|---|---|
| **Type Tally** | `INPUT_EMAIL` |
| **Label** | Email professionnel |
| **Placeholder** | jean@votre-boutique.com |
| **Obligatoire** | ✅ Oui |
| **Validation** | Format email automatique (Tally valide nativement) |
| **Logique conditionnelle** | Aucune |

> **Conseil** : Préciser "professionnel" décourage les adresses jetables et améliore la qualité des leads.

---

### Champ 3 — Site e-commerce (URL)
| Propriété | Valeur |
|---|---|
| **Type Tally** | `INPUT_TEXT` |
| **Label** | URL de votre boutique en ligne |
| **Placeholder** | https://votre-boutique.com |
| **Obligatoire** | ✅ Oui |
| **Description** | Nous analyserons votre site avant notre échange pour vous apporter des recommandations personnalisées. |
| **Logique conditionnelle** | Aucune |

---

### Champ 4 — Plateforme utilisée
| Propriété | Valeur |
|---|---|
| **Type Tally** | `MULTIPLE_CHOICE` (choix unique) |
| **Label** | Quelle plateforme e-commerce utilisez-vous ? |
| **Obligatoire** | ✅ Oui |
| **Options** | Shopify / WooCommerce / PrestaShop / Magento / Autre |
| **Logique conditionnelle** | Si "Autre" → afficher un champ texte libre "Précisez votre plateforme" |

---

### Champ 5 — Taille de la boutique
| Propriété | Valeur |
|---|---|
| **Type Tally** | `MULTIPLE_CHOICE` (choix unique) |
| **Label** | Quel est le chiffre d'affaires mensuel de votre boutique ? |
| **Obligatoire** | ✅ Oui |
| **Options** | Moins de 1 000 €/mois / 1 000 – 10 000 €/mois / 10 000 – 50 000 €/mois / Plus de 50 000 €/mois |
| **Logique conditionnelle** | Aucune (toutes les tranches sont acceptées, mais les leads +10k sont prioritaires) |

---

### Champ 6 — Problème principal
| Propriété | Valeur |
|---|---|
| **Type Tally** | `TEXTAREA` |
| **Label** | Quel est votre principal problème ou défi opérationnel aujourd'hui ? |
| **Placeholder** | Ex : Je passe 3h par jour à relancer manuellement les paniers abandonnés, je n'ai pas de visibilité sur mes stocks en temps réel… |
| **Obligatoire** | ✅ Oui |
| **Description** | Soyez précis — cela nous permet de préparer des solutions concrètes pour votre audit. |
| **Logique conditionnelle** | Aucune |

---

### Champ 7 — Automatisations déjà en place
| Propriété | Valeur |
|---|---|
| **Type Tally** | `MULTIPLE_CHOICE` (cases à cocher — choix multiple) |
| **Label** | Quelles automatisations avez-vous déjà en place ? |
| **Obligatoire** | ❌ Non |
| **Options** | Aucune / Email marketing automatisé / CRM connecté / Gestion des stocks automatisée / Reporting automatique / Autre |
| **Logique conditionnelle** | Aucune |

---

### Champ 8 — Objectif business principal
| Propriété | Valeur |
|---|---|
| **Type Tally** | `MULTIPLE_CHOICE` (choix unique) |
| **Label** | Quel est votre objectif principal pour les 6 prochains mois ? |
| **Obligatoire** | ✅ Oui |
| **Options** | Gagner du temps sur les tâches répétitives / Augmenter mon chiffre d'affaires / Réduire les erreurs humaines / Améliorer mon service client / Scaler sans recruter |
| **Logique conditionnelle** | Aucune |

---

### Champ 9 — Budget estimé
| Propriété | Valeur |
|---|---|
| **Type Tally** | `MULTIPLE_CHOICE` (choix unique) |
| **Label** | Quel budget envisagez-vous pour mettre en place ces automatisations ? |
| **Obligatoire** | ✅ Oui |
| **Options** | Moins de 500 € / 500 – 1 500 € / 1 500 – 5 000 € / Plus de 5 000 € / Je ne sais pas encore |
| **Logique conditionnelle** | Aucune |

> **Note scoring** : Les prospects indiquant "1 500 – 5 000 €" ou "+ 5 000 €" sont des leads chauds à traiter en priorité dans n8n.

---

### Champ 10 — Urgence
| Propriété | Valeur |
|---|---|
| **Type Tally** | `MULTIPLE_CHOICE` (choix unique) |
| **Label** | Dans quel délai souhaitez-vous démarrer ? |
| **Obligatoire** | ✅ Oui |
| **Options** | Urgent — cette semaine / Dans le mois / Dans 3 mois / J'explore les options pour l'instant |
| **Logique conditionnelle** | Aucune |

---

### Champ 11 — Source de découverte
| Propriété | Valeur |
|---|---|
| **Type Tally** | `MULTIPLE_CHOICE` (choix unique) |
| **Label** | Comment avez-vous découvert ce service ? |
| **Obligatoire** | ❌ Non |
| **Options** | LinkedIn / Twitter/X / Recommandation d'un proche / Recherche Google / Autre |
| **Logique conditionnelle** | Aucune |

---

## 4. Optimisations conversion

### 4.1 Page de bienvenue avec promesse de valeur
Configurez une **page d'accueil** dans Tally (premier bloc avant les champs) avec le texte suivant :

```
🚀 Obtenez votre audit gratuit d'automatisation IA

En moins de 3 minutes, découvrez quelles automatisations pourraient
faire économiser 10+ heures par semaine à votre équipe e-commerce.

✅ Analyse personnalisée de votre boutique
✅ Recommandations concrètes adaptées à votre plateforme
✅ Mini-guide offert : "5 Automatisations IA pour E-commerçants en 2025"

👇 Commencez maintenant — c'est gratuit
```

### 4.2 Barre de progression visible
- Dans Tally, allez dans **Settings** → **Appearance**.
- Activez **"Show progress bar"**.
- Choisissez le style **"Bar"** (barre horizontale) plutôt que le style "Steps" pour un rendu plus fluide.
- La barre de progression rassure le prospect et réduit l'abandon en cours de formulaire.

### 4.3 Message de confirmation personnalisé après soumission
Dans **Settings** → **Submission** → **Thank you page** :

- Sélectionnez **"Custom message"**.
- Rédigez le message suivant :

```
🎉 Merci [Prénom] — votre demande a bien été reçue !

Voici votre mini-guide offert :
👉 [Télécharger "5 Automatisations IA pour E-commerçants en 2025"]

Nous analyserons votre boutique et vous recontacterons sous 24 à 48h
pour planifier votre audit gratuit.

En attendant, vous pouvez consulter nos études de cas sur [lien].
```

> **Astuce** : Utilisez la personnalisation Tally avec `{{field:prenom}}` pour insérer le prénom dynamiquement.

### 4.4 Remise du mini-guide
- Hébergez le mini-guide au format PDF sur Google Drive, Notion ou votre propre serveur.
- Copiez le lien de partage public et intégrez-le dans le message de confirmation.
- Alternative : configurez n8n pour envoyer un email automatique avec le PDF en pièce jointe dès réception de la soumission.

### 4.5 Texte du bouton final
Dans **Settings** → **Submission** :
- Remplacez le texte par défaut du bouton par : **`Obtenir mon audit gratuit →`**

---

## 5. Mini-guide à remettre après soumission

---

# 5 Automatisations IA que tout E-commerçant devrait avoir en 2025

*Votre guide pratique pour automatiser votre boutique en ligne et récupérer 10+ heures par semaine*

---

### Automatisation #1 — Récupération de paniers abandonnés

**Description**
En moyenne, 70% des paniers e-commerce sont abandonnés avant le paiement. Une séquence automatisée de récupération, déclenchée dès qu'un visiteur quitte sans acheter, peut convertir 5 à 15% de ces paniers perdus en commandes réelles.

Le workflow n8n se connecte à votre CMS (Shopify, WooCommerce, etc.), détecte les abandons en temps réel et déclenche une séquence multicanal :
- **Email 1** (30 min après abandon) : rappel du panier + photo des produits.
- **Email 2** (24h après) : témoignages clients + réassurance.
- **SMS** (48h après, si activé) : offre de réduction limitée dans le temps.
- **Email 3** (72h après) : dernière chance + support disponible.

**Bénéfice chiffré**
+8 à 15% de CA récupéré sur les paniers abandonnés. Pour une boutique à 20 000 €/mois de CA, cela représente jusqu'à **3 000 €/mois supplémentaires**.

**Outils**
- n8n (orchestration du workflow)
- Klaviyo ou Mailchimp (envoi emails)
- Twilio (envoi SMS)
- API Shopify / WooCommerce (déclencheur)

**Temps d'implémentation** : 4 à 8 heures

---

### Automatisation #2 — Suivi commande automatisé (notifications multicanal)

**Description**
Les clients posent en moyenne 3 questions sur le statut de leur commande. Un système de notifications automatiques à chaque étape du parcours (confirmation, expédition, livraison, avis post-achat) réduit drastiquement la charge du SAV.

Le workflow n8n écoute les événements de votre transporteur (Colissimo, DHL, UPS…) et déclenche automatiquement :
- **Email de confirmation** immédiatement après commande.
- **Email d'expédition** + lien de tracking en temps réel.
- **SMS de livraison** le jour J.
- **Email d'avis** 5 jours après livraison (intégration Trustpilot / Avis Vérifiés).

**Bénéfice chiffré**
-40% de tickets SAV liés au suivi commande. Satisfaction client +20% (NPS amélioré).

**Outils**
- n8n (orchestration)
- Sendgrid ou Brevo (emails transactionnels)
- Twilio (SMS)
- API transporteur (Colissimo, DHL, etc.)
- Trustpilot / Avis Vérifiés (collecte d'avis)

**Temps d'implémentation** : 3 à 6 heures

---

### Automatisation #3 — Gestion intelligente des stocks

**Description**
Rupture de stock = vente perdue + client déçu. Surstock = capital immobilisé. Un système d'alertes intelligent surveille vos niveaux de stock en temps réel et déclenche des actions automatiques : alerte sur Telegram/Slack, création de bon de commande fournisseur, désactivation automatique du produit en rupture sur le site.

**Bénéfice chiffré**
-30% de ruptures de stock non anticipées. Réduction du capital immobilisé en surstock de 15 à 25%.

**Outils**
- n8n (orchestration)
- API Shopify / WooCommerce / PrestaShop (lecture des stocks)
- Telegram ou Slack (alertes en temps réel)
- Google Sheets ou Airtable (tableau de bord stock)
- Email fournisseur (bon de commande auto)

**Temps d'implémentation** : 5 à 10 heures

---

### Automatisation #4 — SAV automatisé avec IA

**Description**
80% des questions SAV sont des variantes de 20 questions récurrentes (suivi commande, retours, délais, disponibilité produit…). Un agent IA connecté à votre base de connaissances répond instantanément 24h/24, escalade vers un humain uniquement pour les cas complexes.

Le workflow n8n reçoit les messages entrants (email, formulaire de contact, chat), les transmet à un LLM (GPT-4 ou Claude) avec votre contexte métier, génère une réponse personnalisée et la renvoie au client. Si le LLM détecte un cas délicat (remboursement contesté, litige…), il crée automatiquement un ticket prioritaire dans votre outil de support.

**Bénéfice chiffré**
-60% de temps passé sur le SAV. Temps de réponse moyen passé de 4h à moins de 2 minutes.

**Outils**
- n8n (orchestration)
- OpenAI API ou Anthropic Claude (génération de réponses IA)
- Zendesk, Freshdesk ou Intercom (gestion des tickets)
- Gmail ou Outlook (emails entrants/sortants)

**Temps d'implémentation** : 8 à 15 heures

---

### Automatisation #5 — Reporting business automatique

**Description**
Combien de temps passez-vous chaque semaine à consolider vos données de vente, marketing et SAV pour produire un rapport ? Un workflow n8n récupère automatiquement vos KPIs depuis toutes vos sources (boutique, Google Analytics, Meta Ads, Google Ads…), consolide les données et vous envoie chaque lundi matin un rapport complet sur Telegram, par email, ou dans un Google Sheet partagé.

Données incluses : CA de la semaine, nombre de commandes, panier moyen, taux de conversion, coût d'acquisition, retours, satisfaction client, alertes d'anomalies.

**Bénéfice chiffré**
2 à 4 heures économisées par semaine sur le reporting. Décisions basées sur des données fraîches en temps réel plutôt que des exports manuels.

**Outils**
- n8n (orchestration)
- API Shopify / WooCommerce (données ventes)
- Google Analytics API (trafic)
- Meta Ads API / Google Ads API (performance pub)
- Google Sheets ou Notion (dashboard consolidé)
- Telegram ou Email (diffusion du rapport)

**Temps d'implémentation** : 6 à 12 heures

---

*Ce guide vous a été remis suite à votre demande d'audit. Notre équipe vous contactera sous 24 à 48h pour planifier votre session gratuite et identifier les automatisations les plus adaptées à votre situation.*

---

## 6. Configuration webhook Tally → n8n

### 6.1 Paramètres du webhook

| Paramètre | Valeur |
|---|---|
| **URL** | `https://VOTRE_N8N_DOMAIN/webhook/tally-leads` |
| **Méthode HTTP** | `POST` |
| **Content-Type** | `application/json` |
| **Events** | Form submission |
| **Signing secret** | Recommandé (voir ci-dessous) |

### 6.2 Activer la signature du webhook (sécurité)
1. Dans Tally → **Settings** → **Integrations** → **Webhooks** → votre webhook.
2. Activez **"Signing secret"**.
3. Copiez la clé générée (ex : `whsec_xxxxxxxxxxxxxxxxxx`).
4. Dans n8n, dans le nœud **Webhook**, ajoutez un nœud de validation de signature en utilisant la clé secrète.
5. Cette étape garantit que seules les requêtes légitimes de Tally sont traitées.

### 6.3 Structure du payload JSON envoyé par Tally

```json
{
  "eventId": "xxx",
  "eventType": "FORM_RESPONSE",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "data": {
    "responseId": "yyy",
    "submittedAt": "2025-01-15T10:30:00.000Z",
    "fields": [
      {
        "key": "question_abc123",
        "label": "Prénom et Nom",
        "type": "INPUT_TEXT",
        "value": "Jean Dupont"
      },
      {
        "key": "question_def456",
        "label": "Email professionnel",
        "type": "INPUT_EMAIL",
        "value": "jean@boutique.com"
      }
    ]
  }
}
```

### 6.4 Mapping des champs dans n8n
Dans le nœud n8n qui reçoit le webhook, utilisez des expressions JavaScript pour extraire les valeurs :

```javascript
// Récupérer le nom
{{ $json.data.fields.find(f => f.label === "Prénom et Nom").value }}

// Récupérer l'email
{{ $json.data.fields.find(f => f.label === "Email professionnel").value }}

// Récupérer la plateforme
{{ $json.data.fields.find(f => f.label === "Quelle plateforme e-commerce utilisez-vous ?").value }}
```

### 6.5 Test du webhook
1. Activez temporairement le workflow n8n (mode "Test").
2. Ouvrez un onglet de votre formulaire Tally en mode prévisualisation.
3. Soumettez le formulaire avec des données de test.
4. Vérifiez dans n8n que le payload est bien reçu.
5. Vérifiez que le message Telegram est bien envoyé.
6. Une fois validé, basculez le workflow en mode **Production**.
