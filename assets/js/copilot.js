function createMessageBubble(text, isUser) {
    const wrapper = document.createElement('div');
    wrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;

    const bubble = document.createElement('div');
    bubble.className = isUser
        ? 'max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-brand-500/10 text-brand-400 border border-brand-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
        : 'max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-slate-800/50 text-slate-200 border border-white/5 leading-relaxed shadow-lg whitespace-pre-wrap';
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    return wrapper;
}

function streamText(container, text, onComplete) {
    const bubble = document.createElement('div');
    bubble.className = 'max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-slate-800/50 text-slate-200 border border-white/5 leading-relaxed shadow-lg whitespace-pre-wrap';

    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-start mb-4';
    wrapper.appendChild(bubble);
    container.appendChild(wrapper);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bubble.textContent = text;
        if (onComplete) onComplete();
        return;
    }

    let i = 0;
    const interval = setInterval(() => {
        bubble.textContent += text.charAt(i);
        i++;
        container.scrollTop = container.scrollHeight;
        if (i >= text.length) {
            clearInterval(interval);
            if (onComplete) onComplete();
        }
    }, 20);
}

function matchIntent(query, data) {
    const q = query.toLowerCase();

    if (/tesla|work|job|role|experience|program manager|corporate|financial/.test(q)) {
        const roles = data.experience.map(e =>
            `${e.title} at ${e.company} (${e.dates}):\n${e.bullets.map(b => '• ' + b).join('\n')}`
        ).join('\n\n');
        return `James's experience at Tesla spans three roles:\n\n${roles}`;
    }

    if (/project|lab|venture|demo|build|app|real estate|script|automation/.test(q)) {
        const projects = data.lab.map(p => {
            const status = p.status === 'live' ? `Live demo: ${p.href}` : 'Coming soon';
            return `• ${p.title} — ${p.description} (${status})`;
        }).join('\n');
        return `James's Lab / Ventures:\n\n${projects}\n\nTry the live Real Estate Script Generator at /lab/script-generator/`;
    }

    if (/stack|skill|tech|tool|python|gemini|ai|n8n|sql/.test(q)) {
        const skills = data.stack.map(s => s.label).join(', ');
        return `James's core stack includes: ${skills}.\n\nHe specializes in program execution, AI integration (Gemini API / Google AI Studio), automation (n8n), and full-stack building.`;
    }

    if (/contact|email|phone|reach|linkedin|hire|connect/.test(q)) {
        const c = data.contact;
        return `You can reach James at:\n\n• Email: ${c.email}\n• Phone: ${c.phone}\n• LinkedIn: ${c.linkedin}`;
    }

    if (/who|about|james|intro|background/.test(q)) {
        return `${data.hero.subheadline}\n\n${data.hero.description}\n\nBased in ${data.hero.location}. ${data.contact.education}. ${data.contact.certifications}.`;
    }

    return `I can help with questions about James's Tesla experience, Lab projects, tech stack, or contact info.\n\nTry asking:\n• "What does James do at Tesla?"\n• "Show me a project"\n• "How do I reach James?"\n\nOr explore the live demo at /lab/script-generator/`;
}

function renderSuggestedPrompts(container, prompts, onSelect) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-wrap gap-2 justify-center mt-6 px-4';
    wrapper.id = 'prompt-chips';

    prompts.forEach(prompt => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'prompt-chip';
        chip.textContent = prompt;
        chip.addEventListener('click', () => onSelect(prompt));
        wrapper.appendChild(chip);
    });

    container.appendChild(wrapper);
}

function initCopilot(data) {
    const aiSidebar = document.getElementById('ai-sidebar');
    const aiBtn = document.getElementById('ai-btn');
    const closeAi = document.getElementById('close-ai');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');

    if (!aiSidebar || !chatHistory) return;

    chatHistory.innerHTML = '';
    const intro = document.createElement('div');
    intro.className = 'text-center text-slate-500 text-sm mt-10 px-4';
    intro.textContent = 'Ask me about James\'s experience, projects, stack, or how to get in touch.';
    chatHistory.appendChild(intro);

    function handleQuery(query) {
        const chips = document.getElementById('prompt-chips');
        if (chips) chips.remove();

        chatHistory.appendChild(createMessageBubble(query, true));
        chatInput.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        const response = matchIntent(query, data);
        setTimeout(() => {
            streamText(chatHistory, response, () => {
                chatHistory.scrollTop = chatHistory.scrollHeight;
            });
        }, 300);
    }

    renderSuggestedPrompts(chatHistory, data.copilot.suggestedPrompts, handleQuery);

    aiBtn.addEventListener('click', (e) => {
        e.preventDefault();
        aiSidebar.classList.remove('translate-x-[120%]');
        chatInput.focus();
    });

    closeAi.addEventListener('click', () => {
        aiSidebar.classList.add('translate-x-[120%]');
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;
        handleQuery(query);
    });
}

window.initCopilot = initCopilot;
