/* ============================================
   FREELANCE NEXUS — Main JavaScript
   ============================================ */

/* ---------- Config (replace with your real URLs) ---------- */
const CONFIG = {
    stripeLinks: {
        starter: 'https://buy.stripe.com/test_aFa6oAbak0Gj02rdsWf7i01',
        pro: 'https://buy.stripe.com/test_dRmdR2emwcp13eD0Gaf7i02',
        whitelabel: 'https://buy.stripe.com/test_aFa8wI0vG9cPdThcoSf7i03',
        enterprise: 'mailto:selyanpourqueyouhab@gmail.com'
    }
};

/* ---------- Navbar scroll effect ---------- */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

/* ---------- Mobile menu toggle ---------- */
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
}

/* ---------- Scroll animations (IntersectionObserver) ---------- */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger cards inside grids
                const siblings = entry.target.parentElement?.querySelectorAll('.animate-on-scroll') || [];
                let delay = 0;
                siblings.forEach((el, idx) => {
                    if (el === entry.target) delay = idx * 80;
                });
                setTimeout(() => entry.target.classList.add('visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ---------- Smooth scroll to signup ---------- */
function scrollToSignup() {
    const el = document.getElementById('signup') || document.getElementById('pricing');
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            const input = document.getElementById('signup-email');
            if (input) input.focus();
        }, 600);
    }
    return false;
}

/* ---------- Plan selection (Stripe redirect) ---------- */
function selectPlan(plan) {
    // Redirect to n8n dynamic checkout flow
    window.location.href = `https://n8n.morganjaouen.fr/webhook/buy?plan=${plan}`;
}

/* ---------- Success modal ---------- */
function showSuccessModal(email = '') {
    // Create if not exists
    let overlay = document.getElementById('success-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'success-modal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <span class="modal-icon">🚀</span>
        <h3 id="modal-title">Vous y êtes presque !</h3>
        <p>Redirection vers la page de paiement sécurisée...<br>
        <small style="color: var(--text-muted);">Vous recevrez vos premières missions dès demain matin à 7h00.</small></p>
        <button class="btn-modal-close" onclick="closeModal()">Continuer →</button>
      </div>`;
        document.body.appendChild(overlay);
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('success-modal');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* ---------- Animated counters ---------- */
function animateCounter(el, target, duration = 1500) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(target * ease);
        el.textContent = current.toLocaleString('fr-FR') + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.counter);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

/* ---------- Close modal on overlay click ---------- */
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('success-modal');
    if (overlay && e.target === overlay) closeModal();
});

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollAnimations();
    initCounters();
});