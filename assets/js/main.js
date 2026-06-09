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
        <div class="relative max-w-6xl mx-auto">
            <div class="hero-glow top-0 right-0 md:right-20 -translate-y-1/4"></div>
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                <div class="lg:col-span-3 text-center lg:text-left reveal">
                    <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                        <span class="px-3 py-1 rounded-full text-brand-400 text-xs font-semibold tracking-widest uppercase border border-brand-500/30 bg-brand-500/5">
                            ${hero.location}
                        </span>
                        ${hero.status ? `<span class="px-3 py-1 rounded-full text-emerald-400 text-xs font-medium border border-emerald-500/20 bg-emerald-500/5">${hero.status}</span>` : ''}
                    </div>
                    <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight leading-[1.05]">
                        ${hero.headline}
                        <span class="block text-brand-400 text-glow mt-1">${hero.headlineAccent}</span>
                    </h1>
                    <p class="text-lg md:text-xl text-slate-400 mb-4 font-light">${hero.subheadline}</p>
                    <p class="text-base text-slate-500 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">${hero.description}</p>
                    <div class="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                        <a href="${hero.primaryCta.href}" class="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-xl bg-brand-500 text-slate-950 hover:bg-brand-400 transition-all shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:shadow-[0_0_36px_rgba(6,182,212,0.5)]">
                            ${hero.primaryCta.label}
                        </a>
                        <a href="${hero.secondaryCta.href}" class="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium rounded-xl border border-white/10 bg-white/5 text-brand-400 hover:bg-white/10 hover:border-brand-500/30 transition-all">
                            ${hero.secondaryCta.label} →
                        </a>
                    </div>
                </div>
                <div class="lg:col-span-2 reveal delay-100">
                    <div class="gradient-border rounded-2xl p-6 md:p-8">
                        <p class="section-label">At a Glance</p>
                        <div id="stats-grid" class="grid grid-cols-2 gap-3"></div>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderStats(stats) {
    const el = document.getElementById('stats-grid');
    if (!el || !stats) return;

    el.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

function renderExperience(experience) {
    const el = document.getElementById('experience-list');
    if (!el) return;

    el.innerHTML = `<div class="timeline">${experience.map((job, i) => {
        const delay = i === 1 ? ' delay-100' : i === 2 ? ' delay-200' : '';
        const bullets = job.bullets.map(b => `<li class="leading-relaxed">${b}</li>`).join('');
        return `
            <div class="timeline-item reveal${delay}">
                <div class="glass-card p-6 md:p-8 rounded-2xl ml-2">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                        <div>
                            <h3 class="text-lg md:text-xl font-bold text-white">${job.title}</h3>
                            <p class="text-brand-400 font-medium text-sm mt-1">${job.company}</p>
                        </div>
                        <span class="text-slate-500 text-xs md:text-sm font-mono px-3 py-1 rounded-full bg-white/5 border border-white/5">${job.dates}</span>
                    </div>
                    <ul class="space-y-2.5 text-slate-400 text-sm list-disc list-outside ml-4">${bullets}</ul>
                </div>
            </div>`;
    }).join('')}</div>`;
}

function renderLab(lab) {
    const el = document.getElementById('lab-grid');
    if (!el) return;

    const sorted = [...lab].sort((a, b) => {
        if (a.status === 'live') return -1;
        if (b.status === 'live') return 1;
        return 0;
    });

    el.innerHTML = `<div class="bento-grid">${sorted.map((project, i) => {
        const delay = i === 1 ? ' delay-100' : i === 2 ? ' delay-200' : i === 3 ? ' delay-300' : '';
        const isLive = project.status === 'live' && project.href;
        const isFeatured = isLive;
        const badgeClass = isLive ? 'status-badge--live' : 'status-badge--soon';
        const badgeText = isLive ? 'Live Demo' : 'Coming Soon';
        const cardClass = isLive ? 'lab-card lab-card--live' : 'lab-card';
        const featuredClass = isFeatured ? ' bento-featured lab-card-featured' : '';
        const tag = isLive ? 'a' : 'div';
        const hrefAttr = isLive ? ` href="${project.href}"` : '';

        return `
            <${tag}${hrefAttr} class="glass-card p-6 md:p-8 rounded-2xl reveal${delay} flex flex-col justify-between ${cardClass}${featuredClass} no-underline text-inherit">
                <div>
                    <div class="flex items-center justify-between mb-5">
                        <div class="h-11 w-11 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                            ${createIcon(project.icon)}
                        </div>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <h3 class="text-lg md:text-xl font-bold text-white mb-2">${project.title}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">${project.description}</p>
                    ${isLive ? '<p class="lab-card-link text-brand-400 text-sm mt-5 font-semibold transition-colors inline-flex items-center gap-1">Launch demo <span aria-hidden="true">→</span></p>' : ''}
                </div>
            </${tag}>`;
    }).join('')}</div>`;
}

function renderStack(stack) {
    const el = document.getElementById('stack-tags');
    if (!el) return;

    el.innerHTML = stack.map(item => {
        const highlight = item.highlight
            ? ' text-brand-400 border-brand-500/50 shadow-[0_0_12px_rgba(34,211,238,0.15)] bg-brand-500/5'
            : ' text-slate-300 border-white/10 bg-white/5';
        return `<span class="stack-pill px-4 py-2 rounded-full text-sm border${highlight}">${item.label}</span>`;
    }).join('');
}

function renderContact(contact) {
    const el = document.getElementById('contact-section');
    if (!el) return;

    el.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="gradient-border rounded-2xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div>
                    <p class="section-label">Get in Touch</p>
                    <h3 class="text-2xl font-display font-bold text-white mb-2">${contact.name}</h3>
                    <p class="text-sm text-slate-500 mb-1">${contact.education}</p>
                    <p class="text-sm text-slate-500">${contact.certifications}</p>
                </div>
                <div class="flex flex-col gap-3 text-sm">
                    <a href="mailto:${contact.email}" class="inline-flex items-center gap-2 text-slate-300 hover:text-brand-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5">${contact.email}</a>
                    <a href="${contact.phoneHref}" class="inline-flex items-center gap-2 text-slate-300 hover:text-brand-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5">${contact.phone}</a>
                    <a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors px-4 py-2 rounded-lg border border-brand-500/20 hover:border-brand-500/40">${contact.linkedinLabel}</a>
                </div>
            </div>
            <p class="text-xs text-slate-700 text-center mt-8 pb-8 md:pb-0">${contact.offScreen}</p>
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

function initNavScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        nav.classList.toggle('nav-scrolled', window.scrollY > 40);
    }, { passive: true });
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
        renderStats(data.stats);
        renderExperience(data.experience);
        renderLab(data.lab);
        renderStack(data.stack);
        renderContact(data.contact);

        initScrollReveal();
        initNavScroll();
        initMobileNav();
        initDock();

        if (window.initCopilot) window.initCopilot(data);
    } catch (err) {
        console.error('Portfolio init failed:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
