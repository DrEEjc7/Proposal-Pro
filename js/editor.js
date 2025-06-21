document.addEventListener('DOMContentLoaded', () => {
    // === GLOBAL STATE & ELEMENTS ===
    const editor = document.getElementById('editor');
    window.signatureImage = null; // Stored as base64

    // === TEMPLATES (shortened for brevity) ===
    const templates = {
        client: `<h1>Project Proposal</h1><h2>About the Client</h2><p>Describe the client...</p><h2>About Me</h2><p>Introduce yourself...</p>`,
        business: `<h1>Business Proposal</h1><h2>Executive Summary</h2><p>Provide a compelling overview...</p>`,
        project: `<h1>Project Proposal</h1><h2>Project Overview</h2><p>Comprehensive description...</p>`,
        blank: `<h1>Your Proposal Title</h1><p>Start writing here...</p>`
    };

    window.loadTemplate = (key) => {
        if (!templates[key]) return;
        editor.innerHTML = templates[key];
        editor.focus();
        updateTitleFromContent();
    };
    
    // === UI INTERACTIONS ===
    window.toggleDetails = () => {
        document.getElementById('details-panel').classList.toggle('active');
        document.getElementById('details-btn').classList.toggle('active');
    };

    window.toggleTheme = () => {
        const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('pp_theme', theme);
        updateThemeIcon(theme);
    };

    const updateThemeIcon = (theme) => {
        document.getElementById('theme-icon').dataset.lucide = theme === 'dark' ? 'moon' : 'sun';
        lucide.createIcons();
    };

    // === EDITOR COMMANDS ===
    window.cmd = (command, value = null) => {
        document.execCommand(command, false, value);
        editor.focus();
    };

    window.formatText = (tag) => {
        if (tag) cmd('formatBlock', `<${tag}>`);
        document.getElementById('format-select').selectedIndex = 0;
    };

    window.addLink = () => {
        const url = prompt('Enter URL:', 'https://');
        if (url) cmd('createLink', url);
    };
    
    window.addImage = () => {
        const url = prompt('Enter image URL:');
        if (url) cmd('insertHTML', `<img src="${url}" alt="Proposal Image">`);
    };

    window.addTable = () => {
        const tableHTML = '<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></table><p></p>';
        cmd('insertHTML', tableHTML);
    };

    window.addPaymentButton = () => {
        const link = document.getElementById('payment-link').value || '#';
        const text = document.getElementById('total-amount').value || 'Pay Now';
        const btnHTML = `<div class="text-center mt-4"><a href="${link}" class="payment-button" target="_blank">Pay ${text}</a></div>`;
        cmd('insertHTML', btnHTML);
    };
    
    window.addSignature = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    window.signatureImage = event.target.result;
                    document.getElementById('signature-placeholder').innerHTML = `<img src="${window.signatureImage}" style="max-height: 40px; width: auto;" alt="Signature">`;
                    autoSave();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    // === STATE MANAGEMENT ===
    const updateToolbarStates = () => {
        ['bold', 'italic', 'underline'].forEach(cmd => {
            const btn = document.getElementById(`${cmd}-btn`);
            if (btn) document.queryCommandState(cmd) ? btn.classList.add('active') : btn.classList.remove('active');
        });
    };
    
    const updateTitleFromContent = () => {
        const h1 = editor.querySelector('h1');
        document.getElementById('project-title').value = h1 ? h1.textContent : '';
    };

    const updateContentFromTitle = () => {
        const title = document.getElementById('project-title').value;
        const h1 = editor.querySelector('h1');
        if (h1) h1.textContent = title || 'Your Proposal Title';
    };

    // === AUTOSAVE SYSTEM ===
    let saveTimeout;
    const autoSave = () => {
        const data = {
            content: editor.innerHTML,
            clientName: document.getElementById('client-name').value,
            projectTitle: document.getElementById('project-title').value,
            totalAmount: document.getElementById('total-amount').value,
            paymentLink: document.getElementById('payment-link').value,
            signature: window.signatureImage,
        };
        localStorage.setItem('pp_autosave', JSON.stringify(data));
        console.log('Proposal autosaved.');
    };

    const loadAutoSave = () => {
        const saved = localStorage.getItem('pp_autosave');
        if (saved) {
            if (confirm('Found recent autosaved work. Restore it?')) {
                const data = JSON.parse(saved);
                editor.innerHTML = data.content || '';
                document.getElementById('client-name').value = data.clientName || '';
                document.getElementById('project-title').value = data.projectTitle || '';
                document.getElementById('total-amount').value = data.totalAmount || '';
                document.getElementById('payment-link').value = data.paymentLink || '';
                if (data.signature) {
                    window.signatureImage = data.signature;
                    document.getElementById('signature-placeholder').innerHTML = `<img src="${window.signatureImage}" style="max-height: 40px; width: auto;" alt="Signature">`;
                }
                return true;
            }
        }
        return false;
    };

    // === INITIALIZATION & EVENT LISTENERS ===
    function init() {
        lucide.createIcons();
        const savedTheme = localStorage.getItem('pp_theme') || 'light';
        document.documentElement.dataset.theme = savedTheme;
        updateThemeIcon(savedTheme);

        if (!loadAutoSave()) {
            loadTemplate('client');
        }
        
        editor.focus();
        updateToolbarStates();

        // Event Listeners
        document.addEventListener('selectionchange', updateToolbarStates);
        document.getElementById('project-title').addEventListener('input', updateContentFromTitle);
        editor.addEventListener('input', updateTitleFromContent);
        
        // Autosave listener for all inputs
        const inputsToSave = [...document.querySelectorAll('.detail-input'), editor];
        inputsToSave.forEach(el => el.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(autoSave, 1500);
        }));

        // Keyboard shortcuts
        document.addEventListener('keydown', e => {
            if (!(e.ctrlKey || e.metaKey)) return;
            const key = e.key.toLowerCase();
            if ('biukpls'.includes(key)) e.preventDefault();
            
            switch (key) {
                case 'b': cmd('bold'); break;
                case 'i': cmd('italic'); break;
                case 'u': cmd('underline'); break;
                case 'k': addLink(); break;
                case 'p': exportPDF(); break;
                case 'l': toggleTheme(); break;
                case 'd': toggleDetails(); break;
                case 's': autoSave(); alert('Saved!'); break;
            }
        });
    }

    init();
});
