const ICONS = {
    building: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>',
    terminal: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
    zap: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>',
    video: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>'
};

function createIcon(iconName) {
    const path = ICONS[iconName] || ICONS.terminal;
    return `<svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">${path}</svg>`;
}

function renderHero(hero) {
    const el = document.getElementById('hero-section');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-4xl mx-auto text-center reveal">
            <div class="inline-block mb-4 px-4 py-1 rounded-full glass-card text-brand-400 text-xs font-semibold tracking-widest uppercase border-brand-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                ${hero.location}
            </div>
            <h1 class="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight leading-tight">
                ${hero.headline} <br/><span class="text-brand-400 text-glow">${hero.headlineAccent}</span>
            </h1>
            <p class="text-xl md:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto font-light">
                ${hero.subheadline}
            </p>
            <p class="text-base text-slate-500 max-w-xl mx-auto mb-10">
                ${hero.description}
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="${hero.primaryCta.href}" class="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-lg bg-brand-500 text-slate-950 hover:bg-brand-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                    ${hero.primaryCta.label}
                </a>
                <a href="${hero.secondaryCta.href}" class="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-lg glass-card text-brand-400 border-brand-500/30 hover:border-brand-500/50">
                    ${hero.secondaryCta.label}
                </a>
            </div>
        </div>`;
}

function renderExperience(experience) {
    const el = document.getElementById('experience-list');
    if (!el) return;

    el.innerHTML = experience.map((job, i) => {
        const delay = i === 1 ? ' delay-100' : i === 2 ? ' delay-200' : '';
        const bullets = job.bullets.map(b => `<li>${b}</li>`).join('');
        return `
            <div class="glass-card p-8 rounded-2xl reveal${delay}">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-white">${job.title}</h3>
                        <p class="text-brand-400 font-medium">${job.company}</p>
                    </div>
                    <span class="text-slate-500 text-sm mt-2 md:mt-0 font-mono">${job.dates}</span>
                </div>
                <ul class="space-y-3 text-slate-400 text-sm list-disc list-inside">${bullets}</ul>
            </div>`;
    }).join('');
}

function renderLab(lab) {
    const el = document.getElementById('lab-grid');
    if (!el) return;

    el.innerHTML = lab.map((project, i) => {
        const delay = i % 2 === 1 ? ' delay-100' : '';
        const isLive = project.status === 'live' && project.href;
        const badgeClass = isLive ? 'status-badge--live' : 'status-badge--soon';
        const badgeText = isLive ? 'Live Demo' : 'Coming Soon';
        const cardClass = isLive ? 'lab-card lab-card--live' : 'lab-card';
        const tag = isLive ? 'a' : 'div';
        const hrefAttr = isLive ? ` href="${project.href}"` : '';

        return `
            <${tag}${hrefAttr} class="glass-card p-8 rounded-2xl reveal${delay} flex flex-col justify-between ${cardClass} no-underline text-inherit">
                <div>
                    <div class="flex items-center justify-between mb-6">
                        <div class="h-10 w-10 rounded-full bg-brand-500/10 flex items-center justify-center">
                            ${createIcon(project.icon)}
                        </div>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">${project.title}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">${project.description}</p>
                    ${isLive ? '<p class="lab-card-link text-brand-400 text-sm mt-4 font-medium transition-colors">Open demo →</p>' : ''}
                </div>
            </${tag}>`;
    }).join('');
}

function renderStack(stack) {
    const el = document.getElementById('stack-tags');
    if (!el) return;

    el.innerHTML = stack.map(item => {
        const highlight = item.highlight
            ? ' text-brand-400 border-brand-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
            : ' text-slate-300 border-brand-500/30';
        return `<span class="px-4 py-2 rounded-full glass-card text-sm${highlight} hover:!translate-y-0">${item.label}</span>`;
    }).join('');
}

function renderContact(contact) {
    const el = document.getElementById('contact-section');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div>
                <h3 class="text-xl font-display font-bold text-white mb-2">${contact.name}</h3>
                <p class="text-sm text-slate-500 mb-1">${contact.education}</p>
                <p class="text-sm text-slate-500">${contact.certifications}</p>
            </div>
            <div class="flex flex-col gap-2 text-sm">
                <a href="mailto:${contact.email}" class="text-slate-400 hover:text-brand-400 transition-colors">${contact.email}</a>
                <a href="${contact.phoneHref}" class="text-slate-400 hover:text-brand-400 transition-colors">${contact.phone}</a>
                <a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-brand-400 transition-colors">${contact.linkedinLabel}</a>
            </div>
        </div>
        <div class="max-w-4xl mx-auto mt-12 text-center pb-8 md:pb-0">
            <p class="text-xs text-slate-700">${contact.offScreen}</p>
        </div>`;
}

function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
}

function initMobileNav() {
    const btn = document.getElementById('mobile-menu-btn');
    const panel = document.getElementById('mobile-nav-panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
        const isOpen = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    });

    panel.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            panel.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
}

function initDock() {
    const dockItems = document.querySelectorAll('.dock-item');
    const dockContainer = document.querySelector('.dock-container');
    if (!dockContainer) return;

    dockContainer.addEventListener('mousemove', (e) => {
        dockItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const distance = Math.abs(e.clientX - x);
            const scale = 1 + Math.max(0, 1 - distance / 80) * 0.4;
            item.style.transform = `scale(${scale}) translateY(-${(scale - 1) * 15}px)`;
        });
    });

    dockContainer.addEventListener('mouseleave', () => {
        dockItems.forEach(item => {
            item.style.transform = 'scale(1) translateY(0)';
        });
    });
}

async function loadPortfolio() {
    const res = await fetch('/assets/data/portfolio.json');
    if (!res.ok) throw new Error('Failed to load portfolio data');
    return res.json();
}

async function init() {
    try {
        const data = await loadPortfolio();
        window.__portfolioData = data;

        renderHero(data.hero);
        renderExperience(data.experience);
        renderLab(data.lab);
        renderStack(data.stack);
        renderContact(data.contact);

        initScrollReveal();
        initMobileNav();
        initDock();

        if (window.initCopilot) window.initCopilot(data);
    } catch (err) {
        console.error('Portfolio init failed:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
