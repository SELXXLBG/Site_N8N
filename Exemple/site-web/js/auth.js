/**
 * Auth Manager — Freelance Nexus
 * Gère la session utilisateur et la protection des routes
 * v3 — stockage profil complet, logout propre, nav dynamique, getPlanLabel
 */

const Auth = {
    SESSION_KEY: 'fn_user_session',

    /**
     * Initialise la protection des pages privées
     */
    init() {
        const path = window.location.pathname.toLowerCase();
        const isLoginPage = path.includes('login.html') || path.endsWith('login');
        const isPublicPage =
            path.endsWith('index.html') ||
            path.endsWith('/') ||
            isLoginPage ||
            path.includes('missions.html'); // missions est semi-public (affiche accès restreint si non connecté)

        const session = this.getSession();

        if (!session && !isPublicPage) {
            window.location.href = 'login.html';
            return;
        }

        if (session && isLoginPage) {
            window.location.href = 'missions.html';
            return;
        }

        this.updateNav();
    },

    /**
     * Connexion via n8n — stocke email + données profil complètes si disponibles
     */
    async login(email, password) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);

            const response = await fetch('https://n8n.morganjaouen.fr/webhook/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            }).finally(() => clearTimeout(timer));

            const result = await response.json();

            if (result.success) {
                // On stocke l'objet user retourné par n8n (email + plan + prenom + etc.)
                const userData = result.user || {};
                // S'assurer qu'on a toujours l'email
                if (!userData.email) userData.email = email;
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Identifiants incorrects' };
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return { success: false, message: 'Délai de connexion dépassé. Réessaye.' };
            }
            console.error('Login error:', error);
            return { success: false, message: 'Erreur de connexion au serveur' };
        }
    },

    /**
     * Déconnexion propre — vide session + cache API
     */
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        // Invalider le cache profil s'il existe
        localStorage.removeItem('fn_profile_cache');
        window.location.href = 'index.html';
    },

    /**
     * Récupère la session courante
     */
    getSession() {
        try {
            const raw = localStorage.getItem(this.SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    /**
     * Met à jour la session avec de nouvelles données de profil
     * (appelé après une sauvegarde de profil réussie)
     */
    updateSession(newData) {
        try {
            const current = this.getSession() || {};
            localStorage.setItem(this.SESSION_KEY, JSON.stringify({ ...current, ...newData }));
        } catch {
            /* ignore */
        }
    },

    /**
     * Retourne le libellé lisible et le prix d'un plan
     */
    getPlanLabel(plan) {
        const plans = {
            'standard': { label: 'Standard', price: '19€ / mois' },
            'pro':      { label: 'Pro',      price: '39€ / mois' },
            'whitelabel': { label: 'White Label', price: '199€ / mois' },
            'white_label': { label: 'White Label', price: '199€ / mois' },
            'premium':  { label: 'Pro',      price: '39€ / mois' }, // alias legacy
        };
        const key = (plan || '').toLowerCase().trim();
        return plans[key] || { label: plan || 'Standard', price: '19€ / mois' };
    },

    /**
     * Vérifie si le profil est suffisamment rempli pour le matching
     */
    isProfileComplete(session) {
        return !!(session && session.categories && session.stack);
    },

    /**
     * Met à jour la navigation selon l'état de connexion
     */
    updateNav() {
        const session = this.getSession();

        // Boutons nav génériques
        const authLink = document.getElementById('nav-auth-link');
        const actionBtn = document.getElementById('nav-action-btn');

        // Liens déconnexion inline (attribut data-logout sur n'importe quel élément)
        document.querySelectorAll('[data-logout]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        if (!session) return;

        if (authLink) {
            authLink.textContent = 'Déconnexion';
            authLink.href = '#';
            authLink.addEventListener('click', (e) => { e.preventDefault(); this.logout(); });
        }
        if (actionBtn) {
            actionBtn.textContent = 'Mon Dashboard';
            actionBtn.href = 'missions.html';
        }

        // Affiche le prénom dans les éléments [data-user-name]
        const displayName = session.prenom || session.email || '';
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = displayName;
        });

        // Affiche le plan dans les éléments [data-user-plan]
        if (session.plan) {
            const { label } = this.getPlanLabel(session.plan);
            document.querySelectorAll('[data-user-plan]').forEach(el => {
                el.textContent = label;
            });
        }
    }
};

// Auto-init
Auth.init();
window.FreelanceAuth = Auth;
