# Guide de mise en production — Écosystème Tally + n8n + Telegram

---

## 1. Architecture globale

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Visiteur  │────▶│ Cloudflare  │────▶│  Site HTML       │
└─────────────┘     │  (CDN/WAF)  │     │ (Cloudflare      │
                    └─────────────┘     │  Pages)          │
                                        └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │   Tally Form     │
                                        │  (tally.so)      │
                                        └────────┬─────────┘
                                                 │ POST webhook
                                                 ▼
                                        ┌──────────────────┐
                                        │   n8n Webhook    │
                                        │  (Hostinger VPS) │
                                        └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │  Telegram Bot    │
                                        │  (notification   │
                                        │   lead qualifié) │
                                        └──────────────────┘
```

**Flux complet :**
1. Le visiteur arrive sur le site via Cloudflare (CDN + protection DDoS).
2. Il clique sur le CTA et est redirigé vers le formulaire Tally.
3. Il soumet le formulaire → Tally envoie un webhook POST vers n8n.
4. n8n traite les données, score le lead et envoie une notification Telegram formatée.
5. Vous recevez l'alerte en temps réel sur votre téléphone.

---

## 2. Prérequis

### Comptes et accès nécessaires

| Service | Plan | Usage | Lien |
|---|---|---|---|
| **Cloudflare** | Gratuit | CDN, DNS, WAF, Pages | https://cloudflare.com |
| **Hostinger VPS** | VPS 2 (min.) | Hébergement n8n | https://hostinger.com |
| **Tally.so** | Gratuit ou Pro | Formulaire de qualification | https://tally.so |
| **Telegram** | Gratuit | Notifications leads | https://telegram.org |
| **Domaine personnalisé** | ~10–15 €/an | Ex: votre-agence.com | OVH, Namecheap, Cloudflare |

### Configuration minimale recommandée — Hostinger VPS
- **OS** : Ubuntu 22.04 LTS
- **RAM** : 2 Go minimum (4 Go recommandé)
- **CPU** : 2 vCPU
- **Stockage** : 20 Go SSD
- **Accès SSH** : obligatoire

### Logiciels requis sur le VPS
- Docker 24+
- Docker Compose v2+
- NGINX
- Certbot (Let's Encrypt)

---

## 3. Déploiement n8n sur Hostinger

### 3.1 Accès SSH Hostinger
```bash
ssh root@VOTRE_IP_HOSTINGER
# Ou avec une clé SSH :
ssh -i ~/.ssh/ma_cle root@VOTRE_IP_HOSTINGER
```

Si c'est votre première connexion, acceptez l'empreinte du serveur en tapant `yes`.

### 3.2 Mise à jour du système
```bash
apt update && apt upgrade -y
apt install -y curl git ufw
```

### 3.3 Installation Docker
```bash
# Installer Docker via le script officiel
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Vérifier l'installation
docker --version

# Installer Docker Compose plugin
apt install -y docker-compose-plugin

# Vérifier
docker compose version
```

### 3.4 Créer la structure de répertoires
```bash
mkdir -p /opt/n8n
cd /opt/n8n
```

### 3.5 Fichier docker-compose.yml complet

Créez le fichier :
```bash
nano /opt/n8n/docker-compose.yml
```

Collez le contenu suivant :

```yaml
version: "3.8"

services:
  n8n:
    image: n8nio/n8n:2.8.3
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      # Hôte et URL
      - N8N_HOST=n8n.votre-domaine.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.votre-domaine.com/
      - N8N_EDITOR_BASE_URL=https://n8n.votre-domaine.com/

      # Base de données (SQLite par défaut)
      - DB_TYPE=sqlite
      - DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite

      # Sécurité
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE

      # Timezone
      - GENERIC_TIMEZONE=Europe/Paris
      - TZ=Europe/Paris

      # Logs
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console

      # Exécutions
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
      - EXECUTIONS_DATA_MAX_AGE=720

    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_network

volumes:
  n8n_data:
    driver: local

networks:
  n8n_network:
    driver: bridge
```

> ⚠️ **Important** : Remplacez `n8n.votre-domaine.com` par votre vrai sous-domaine et `CHANGEZ_CE_MOT_DE_PASSE` par un mot de passe fort.

### 3.6 Démarrer n8n
```bash
cd /opt/n8n
docker compose up -d

# Vérifier que le conteneur tourne
docker ps

# Voir les logs en temps réel
docker logs -f n8n
```

### 3.7 Configuration NGINX comme reverse proxy

Installer NGINX :
```bash
apt install -y nginx
```

Créer la configuration du site :
```bash
nano /etc/nginx/sites-available/n8n
```

Collez :
```nginx
server {
    listen 80;
    server_name n8n.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
        client_max_body_size 50m;
    }
}
```

Activer le site :
```bash
ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 3.8 SSL avec Let's Encrypt (Certbot)
```bash
apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
certbot --nginx -d n8n.votre-domaine.com

# Suivre les instructions interactives :
# - Entrez votre email
# - Acceptez les CGU (A)
# - Choisissez de rediriger HTTP vers HTTPS (2)

# Vérifier le renouvellement automatique
certbot renew --dry-run
```

### 3.9 Configurer le pare-feu UFW
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

### 3.10 Vérifier que n8n tourne en 24/7
```bash
# Vérifier le statut du conteneur
docker ps -a

# Vérifier que la politique restart=always est active
docker inspect n8n | grep RestartPolicy -A 3

# Tester l'accès
curl -I https://n8n.votre-domaine.com
```

n8n redémarrera automatiquement en cas de reboot du VPS grâce à la directive `restart: always`.

---

## 4. Configuration Cloudflare

### 4.1 Ajouter votre domaine à Cloudflare
1. Connectez-vous sur [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. Cliquez sur **"Add a site"**.
3. Entrez votre nom de domaine (ex : `votre-agence.com`).
4. Choisissez le plan **Free**.
5. Cloudflare détecte vos DNS existants — vérifiez-les et validez.
6. Mettez à jour les nameservers chez votre registrar avec ceux fournis par Cloudflare.
7. Attendez la propagation DNS (5 à 30 minutes).

### 4.2 DNS records pour le site (Cloudflare Pages)

| Type | Nom | Valeur | Proxy |
|---|---|---|---|
| `CNAME` | `@` (ou `www`) | `votre-projet.pages.dev` | ✅ Proxied |
| `CNAME` | `www` | `votre-projet.pages.dev` | ✅ Proxied |

### 4.3 DNS records pour n8n (Hostinger VPS)

| Type | Nom | Valeur | Proxy |
|---|---|---|---|
| `A` | `n8n` | `VOTRE_IP_HOSTINGER` | ✅ Proxied |

> ⚠️ Le proxy Cloudflare sur le sous-domaine n8n masque l'IP réelle de votre VPS et ajoute une couche de protection.

### 4.4 Activation HTTPS automatique
1. Dans Cloudflare → votre domaine → **SSL/TLS**.
2. Sélectionnez le mode **"Full (strict)"** (recommandé si Let's Encrypt est installé sur le VPS).
3. Activez **"Always Use HTTPS"** dans **SSL/TLS** → **Edge Certificates**.
4. Activez **"HSTS"** (optionnel, pour les sites matures).

### 4.5 Cache rules pour le site statique
1. Dans **Caching** → **Cache Rules** → **Create rule**.
2. Règle 1 — Cache agressif pour les assets :
   - Condition : `URI path ends with .css OR .js OR .png OR .jpg OR .svg OR .woff2`
   - Action : Cache level = **Cache Everything**, Edge TTL = **1 month**
3. Règle 2 — Cache HTML standard :
   - Condition : `URI path equals /`
   - Action : Cache level = **Standard**, Browser TTL = **4 hours**

### 4.6 Firewall rules de base
Dans **Security** → **WAF** → **Custom rules** :

**Règle 1 — Bloquer les pays à risque élevé (optionnel)**
```
(ip.geoip.country in {"CN" "RU" "KP" "IR"}) → Block
```

**Règle 2 — Rate limiting sur le webhook n8n**
```
(http.request.uri.path contains "/webhook/") → Rate limit: 10 req/min par IP
```

**Règle 3 — Bloquer les bots malveillants**
```
(cf.threat_score gt 30) → Block
```

---

## 5. Déploiement du site sur Cloudflare Pages

### 5.1 Upload via l'interface Cloudflare Pages
1. Dans Cloudflare → **Workers & Pages** → **Create application** → **Pages**.
2. Cliquez sur **"Upload assets"** (pour un site statique sans build).
3. Glissez-déposez votre fichier `index.html` (et les assets associés si applicable).
4. Donnez un nom au projet : `votre-agence-lead-gen`.
5. Cliquez sur **"Deploy site"**.
6. Cloudflare Pages génère une URL de prévisualisation : `votre-agence-lead-gen.pages.dev`.

### 5.2 Configuration du domaine personnalisé
1. Dans votre projet Pages → **Custom domains** → **Set up a custom domain**.
2. Entrez `votre-agence.com` (ou `www.votre-agence.com`).
3. Cloudflare configure automatiquement les DNS si votre domaine est déjà sur Cloudflare.
4. Le SSL est automatiquement provisionné.

### 5.3 Déploiements suivants
Pour mettre à jour le site, re-uploadez simplement le fichier `index.html` via l'interface Pages. Cloudflare invalide automatiquement le cache.

---

## 6. Configuration du bot Telegram

### 6.1 Créer le bot via @BotFather
Ouvrez Telegram et recherchez `@BotFather`, puis envoyez ces commandes dans l'ordre :

```
/start
/newbot
```

BotFather vous demandera :
1. **Nom du bot** (nom affiché) : `Leads IA E-commerce`
2. **Username du bot** (doit se terminer par `bot`) : `leads_ia_ecommerce_bot`

BotFather vous répondra avec :
```
Done! Congratulations on your new bot.
Use this token to access the HTTP API:
1234567890:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 🔑 **Copiez et conservez ce token** — c'est votre clé d'accès à l'API Telegram.

### 6.2 Autres commandes utiles BotFather
```
/setdescription  → Ajouter une description au bot
/setuserpic      → Ajouter une photo de profil
/setcommands     → Définir des commandes disponibles
```

### 6.3 Récupérer l'ID de votre chat Telegram
1. Ouvrez votre bot dans Telegram et envoyez n'importe quel message (ex : `hello`).
2. Ouvrez dans un navigateur :
   ```
   https://api.telegram.org/botVOTRE_TOKEN/getUpdates
   ```
3. Dans la réponse JSON, trouvez :
   ```json
   "chat": {
     "id": 123456789,
     "type": "private"
   }
   ```
4. Le nombre `123456789` est votre **Chat ID**.

**Alternative** : Recherchez `@userinfobot` dans Telegram, envoyez `/start` — il vous répond directement avec votre ID.

**Pour un groupe Telegram** :
1. Ajoutez votre bot dans le groupe.
2. Envoyez un message dans le groupe.
3. Appelez `getUpdates` — le Chat ID du groupe sera un nombre **négatif** (ex : `-987654321`).

### 6.4 Configuration dans n8n
1. Dans n8n → **Credentials** → **Add credential** → cherchez **"Telegram"**.
2. Renseignez :
   - **Access Token** : votre token BotFather
3. Cliquez sur **"Save"** puis **"Test"** pour valider la connexion.

---

## 7. Import et configuration du workflow n8n

### 7.1 Import du fichier JSON
1. Dans n8n → **Workflows** → **Import from file**.
2. Sélectionnez votre fichier `workflow-tally-telegram.json`.
3. Le workflow s'ouvre dans l'éditeur.

### 7.2 Configuration des credentials Telegram
1. Cliquez sur le nœud **Telegram** dans le workflow.
2. Dans le champ **"Credential"**, sélectionnez la credential créée à l'étape 6.4.
3. Répétez pour tous les nœuds Telegram du workflow.

### 7.3 Mise à jour du Chat ID
1. Cliquez sur le nœud **Telegram** qui envoie le message.
2. Dans le champ **"Chat ID"**, entrez votre Chat ID récupéré à l'étape 6.3.
3. Exemple : `123456789` (privé) ou `-987654321` (groupe).

### 7.4 Test du webhook en mode développement
1. Cliquez sur le nœud **Webhook** (premier nœud du workflow).
2. Copiez l'URL affichée sous **"Test URL"** (format : `https://n8n.votre-domaine.com/webhook-test/tally-leads`).
3. Cliquez sur **"Listen for test event"**.
4. Dans un autre onglet, soumettez votre formulaire Tally avec des données fictives.
5. n8n reçoit le payload et vous pouvez inspecter les données à chaque nœud.
6. Vérifiez que le message Telegram est bien reçu.

### 7.5 Activation du workflow en production
1. Une fois les tests validés, cliquez sur le bouton **"Activate"** (toggle en haut à droite).
2. Le workflow passe en mode **Production**.
3. L'URL de production est : `https://n8n.votre-domaine.com/webhook/tally-leads`

### 7.6 URL du webhook à copier dans Tally
```
https://n8n.votre-domaine.com/webhook/tally-leads
```

Copiez cette URL et collez-la dans **Tally** → **Settings** → **Integrations** → **Webhooks** (voir section 2.3 du guide Tally).

---

## 8. Tests end-to-end

### 8.1 Test de soumission Tally
1. Ouvrez votre formulaire Tally en mode prévisualisation (lien de partage).
2. Remplissez tous les champs avec des données réalistes de test.
3. Soumettez le formulaire.
4. Vérifiez :
   - ✅ Page de confirmation Tally s'affiche.
   - ✅ n8n reçoit le webhook (vérifier dans **Executions**).
   - ✅ Message Telegram reçu dans les 5 secondes.

### 8.2 Vérification réception Telegram
Le message Telegram doit ressembler à :

```
🔔 NOUVEAU LEAD QUALIFIÉ

👤 Jean Dupont
📧 jean@boutique.com
🌐 https://boutique.com
🛒 Plateforme : Shopify
💰 CA mensuel : 10 000 – 50 000 €/mois

🎯 Objectif : Gagner du temps sur les tâches répétitives
🔥 Urgence : Urgent — cette semaine
💶 Budget : 1 500 – 5 000 €

📝 Problème :
Je passe 3h par jour à relancer les paniers abandonnés...

📊 Score lead : ⭐⭐⭐⭐ (Chaud)
📅 Soumis le : 15/01/2025 à 10:30
```

### 8.3 Test de détection de langue du site
Si votre workflow n8n inclut une logique de détection de langue (basée sur l'URL du site) :
1. Soumettez un formulaire avec une URL `.fr` et vérifiez que la notification est en français.
2. Soumettez avec une URL `.com` et vérifiez le comportement attendu.

### 8.4 Checklist complète avant mise en ligne

**Infrastructure**
- [ ] VPS Hostinger accessible via SSH
- [ ] Docker et Docker Compose installés
- [ ] n8n démarré et accessible via HTTPS
- [ ] NGINX configuré et actif
- [ ] SSL Let's Encrypt valide (cadenas vert)
- [ ] UFW activé avec les bons ports ouverts

**Cloudflare**
- [ ] Domaine ajouté et nameservers mis à jour
- [ ] DNS records configurés (site + n8n)
- [ ] Mode SSL "Full (strict)" activé
- [ ] "Always Use HTTPS" activé
- [ ] Cloudflare Pages déployé avec le bon fichier HTML
- [ ] Domaine personnalisé configuré sur Pages

**Tally**
- [ ] Formulaire créé avec tous les champs
- [ ] Webhook configuré vers l'URL n8n de production
- [ ] Message de confirmation personnalisé
- [ ] RGPD/consentement activé

**n8n & Telegram**
- [ ] Bot Telegram créé et token récupéré
- [ ] Chat ID récupéré
- [ ] Credentials Telegram configurés dans n8n
- [ ] Workflow importé et activé
- [ ] Test end-to-end validé

---

## 9. Monitoring et maintenance

### 9.1 Vérifier les logs n8n
```bash
# Logs en temps réel
docker logs -f n8n

# Dernières 100 lignes
docker logs --tail 100 n8n

# Logs entre deux dates
docker logs --since "2025-01-15T10:00:00" --until "2025-01-15T11:00:00" n8n
```

### 9.2 Surveiller les exécutions dans l'interface n8n
1. Dans n8n → **Executions** (menu gauche).
2. Filtrez par statut : **Success**, **Error**, **Waiting**.
3. Cliquez sur une exécution pour inspecter les données à chaque nœud.

### 9.3 Configurer les alertes n8n
1. Dans n8n → **Settings** → **Log streaming** (fonctionnalité Enterprise).
2. Alternative gratuite : créez un workflow n8n de monitoring qui vérifie toutes les heures que le webhook principal répond, et vous alerte sur Telegram si ce n'est pas le cas.

Exemple de workflow de monitoring :
- **Schedule Trigger** (toutes les heures) → **HTTP Request** (ping du webhook) → Si erreur → **Telegram** (alerte)

### 9.4 Backup de la configuration n8n
```bash
# Créer un backup du volume n8n
docker run --rm \
  -v n8n_n8n_data:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/n8n-backup-$(date +%Y%m%d).tar.gz -C /source .

# Vérifier le backup
ls -lh n8n-backup-*.tar.gz
```

Planifier un backup automatique via cron :
```bash
crontab -e
# Ajouter :
0 3 * * * docker run --rm -v n8n_n8n_data:/source -v /opt/n8n/backups:/backup alpine tar czf /backup/n8n-backup-$(date +\%Y\%m\%d).tar.gz -C /source . 2>/dev/null
```

### 9.5 Mise à jour n8n
```bash
cd /opt/n8n

# 1. Arrêter n8n
docker compose down

# 2. Modifier la version dans docker-compose.yml
# Remplacer n8nio/n8n:2.8.3 par n8nio/n8n:NOUVELLE_VERSION

# 3. Tirer la nouvelle image
docker compose pull

# 4. Redémarrer
docker compose up -d

# 5. Vérifier les logs
docker logs -f n8n
```

> ⚠️ **Toujours consulter les release notes n8n avant une mise à jour majeure** : [https://github.com/n8n-io/n8n/releases](https://github.com/n8n-io/n8n/releases)

---

## 10. Troubleshooting

### Problème 1 — Le webhook ne reçoit pas les données Tally

**Symptômes** : Tally indique que le webhook a été envoyé, mais aucune exécution n'apparaît dans n8n.

**Vérifications :**

```bash
# 1. Vérifier que n8n tourne
docker ps | grep n8n

# 2. Vérifier que NGINX redirige bien vers n8n
curl -I https://n8n.votre-domaine.com

# 3. Tester le webhook directement
curl -X POST https://n8n.votre-domaine.com/webhook/tally-leads \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Causes fréquentes :**
- Le workflow n8n n'est pas **activé** (toggle sur "Active").
- L'URL du webhook dans Tally pointe vers l'URL de **test** (`/webhook-test/`) au lieu de production (`/webhook/`).
- Le DNS du sous-domaine n8n n'a pas encore propagé.
- Le firewall bloque le port 443 → vérifier `ufw status`.

---

### Problème 2 — Message Telegram non reçu

**Symptômes** : n8n exécute le workflow sans erreur, mais aucun message n'arrive dans Telegram.

**Vérifications :**
1. Dans n8n → **Executions** → cliquez sur l'exécution → inspectez le nœud Telegram.
2. Vérifiez le **Chat ID** : un mauvais ID (ex : oublier le `-` pour un groupe) silencieusement échoue.
3. Vérifiez que le bot a été **ajouté au groupe** si vous utilisez un chat de groupe.
4. Testez directement l'API Telegram :
   ```bash
   curl "https://api.telegram.org/botVOTRE_TOKEN/sendMessage" \
     -d "chat_id=VOTRE_CHAT_ID&text=Test depuis terminal"
   ```

**Causes fréquentes :**
- Token bot invalide ou révoqué.
- Chat ID incorrect ou manque du signe `-` pour les groupes.
- Le bot a été bloqué par l'utilisateur.
- Credential Telegram non sauvegardée correctement dans n8n.

---

### Problème 3 — n8n ne démarre pas

**Symptômes** : `docker ps` ne montre pas le conteneur n8n, ou il redémarre en boucle.

**Diagnostic :**
```bash
# Voir les logs d'erreur
docker logs n8n

# Voir le statut détaillé
docker inspect n8n | grep -A 10 "State"

# Vérifier les erreurs de configuration
docker compose config
```

**Causes fréquentes et solutions :**

| Cause | Solution |
|---|---|
| Port 5678 déjà utilisé | `lsof -i :5678` → tuer le processus ou changer le port |
| Variable d'environnement manquante | Vérifier le `docker-compose.yml` |
| Volume corrompu | `docker volume rm n8n_n8n_data` (⚠️ perte de données) |
| Permissions sur le volume | `docker exec -it n8n chown -R node:node /home/node/.n8n` |
| Mémoire insuffisante | Vérifier `free -h` sur le VPS |

---

### Problème 4 — Problèmes SSL

**Symptômes** : `ERR_SSL_PROTOCOL_ERROR`, certificat expiré, ou HTTPS ne fonctionne pas.

**Diagnostic :**
```bash
# Vérifier la validité du certificat
certbot certificates

# Tester manuellement le renouvellement
certbot renew --dry-run

# Vérifier la configuration NGINX
nginx -t
systemctl status nginx
```

**Causes fréquentes et solutions :**

| Cause | Solution |
|---|---|
| Certificat expiré | `certbot renew --force-renewal` |
| NGINX mal configuré | Vérifier `/etc/nginx/sites-available/n8n` |
| Le port 80 est bloqué (nécessaire pour ACME) | `ufw allow 80` |
| Mode SSL Cloudflare incompatible | Passer en mode "Full (strict)" dans Cloudflare |
| DNS non propagé | Attendre et vérifier avec `dig n8n.votre-domaine.com` |

**Renouvellement manuel forcé :**
```bash
certbot certonly --nginx -d n8n.votre-domaine.com --force-renewal
systemctl reload nginx
```
