/**
 * API Helper for Freelance Nexus
 * Handles communications with n8n webhooks
 * v2 — timeout, localStorage cache, error resilience
 */

const API_CONFIG = {
    webhookUrl: 'https://n8n.morganjaouen.fr/webhook',
    testWebhookUrl: 'https://n8n.morganjaouen.fr/webhook-test',
    timeout: 8000,          // 8 secondes max par requête
    cacheKey: 'fn_profile_cache',
    cacheTTL: 5 * 60 * 1000 // 5 minutes
};

/**
 * fetch avec timeout garanti
 */
function fetchWithTimeout(url, options = {}, ms = API_CONFIG.timeout) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
}

const API = {

    /**
     * Lit le profil — d'abord le cache localStorage, puis l'API
     * Le cache est invalidé si les données sont > cacheTTL
     */
    async getProfile(email) {
        // 1. Essai cache
        const cached = this._readCache(email);
        if (cached) return this.normalizeProfile(cached);

        // 2. Appel API
        try {
            const response = await fetchWithTimeout(
                `${API_CONFIG.webhookUrl}/get-profile?email=${encodeURIComponent(email)}`
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const profile = Array.isArray(data) ? data[0] : data;
            const normalized = this.normalizeProfile(profile);
            if (normalized) this._writeCache(email, normalized);
            return normalized || null;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('API getProfile: timeout');
            } else {
                console.error('API getProfile error:', error);
            }
            // Retourne quand même le cache périmé s'il existe
            return this.normalizeProfile(this._readCache(email, true)) || null;
        }
    },

    /**
     * Met à jour le profil et invalide le cache
     */
    async updateProfile(data) {
        try {
            const response = await fetchWithTimeout(
                `${API_CONFIG.webhookUrl}/update-profile`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            // Mise à jour du cache UNIQUEMENT si le serveur confirme le succès
            if (!result.error) {
                const existing = this._readCache(data.email, true) || {};
                this._writeCache(data.email, { ...existing, ...data });
            }
            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('API updateProfile: timeout');
                return { error: true, message: 'Délai dépassé. Vérifie ta connexion.' };
            }
            console.error('API updateProfile error:', error);
            return { error: true, message: error.message };
        }
    },

    /**
     * Normalise un profil reçu de l'API pour s'assurer que
     * les champs ont toujours les bons types (categories en string CSV, etc.)
     */
    normalizeProfile(profile) {
        if (!profile) return null;
        const p = { ...profile };
        // categories : toujours une string CSV pour l'affichage dans les checkboxes
        if (Array.isArray(p.categories)) {
            p.categories = p.categories.join(', ');
        }
        // budget_min / tjm : accepter les deux noms
        if (p.tjm !== undefined && p.budget_min === undefined) p.budget_min = p.tjm;
        // rayon : s'assurer que c'est une string pour le select
        if (p.rayon !== undefined) p.rayon = String(p.rayon);
        // score_qualite_min : idem
        if (p.score_qualite_min !== undefined) p.score_qualite_min = String(p.score_qualite_min);
        // stack : accepter Array ou string
        if (Array.isArray(p.stack)) p.stack = p.stack.join(', ');
        if (Array.isArray(p.competences) && !p.stack) p.stack = p.competences.join(', ');
        return p;
    },

    /**
     * Récupère les missions — avec timeout et fallback vide
     */
    async getMissions(email) {
        try {
            const response = await fetchWithTimeout(
                `${API_CONFIG.webhookUrl}/get-missions?email=${encodeURIComponent(email)}`
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('API getMissions: timeout');
                return { timeout: true };
            }
            console.error('API getMissions error:', error);
            return { error: true };
        }
    },

    /* ---- Cache helpers ---- */

    _readCache(email, ignoreExpiry = false) {
        try {
            const raw = localStorage.getItem(API_CONFIG.cacheKey);
            if (!raw) return null;
            const { data, ts, forEmail } = JSON.parse(raw);
            if (forEmail !== email) return null;
            if (!ignoreExpiry && Date.now() - ts > API_CONFIG.cacheTTL) return null;
            return data;
        } catch {
            return null;
        }
    },

    _writeCache(email, data) {
        try {
            localStorage.setItem(API_CONFIG.cacheKey, JSON.stringify({
                forEmail: email,
                ts: Date.now(),
                data
            }));
        } catch {
            /* storage plein — on ignore */
        }
    },

    invalidateCache() {
        localStorage.removeItem(API_CONFIG.cacheKey);
    }
};

window.NexusAPI = API;
