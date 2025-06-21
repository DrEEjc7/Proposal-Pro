document.addEventListener('DOMContentLoaded', () => {
    // === GLOBAL STATE & ELEMENTS ===
    const editor = document.getElementById('editor');
    window.signatureImage = null; // Stored as base64 string

    // === TEMPLATES ===
    const templates = {
        business: `<h1>Business Proposal</h1><h2>Executive Summary</h2><p>Provide a compelling overview of your business proposal...</p><h2>Company Overview</h2><p>Brief introduction to your company...</p><h2>Problem & Opportunity</h2><p>Clearly define the business challenges...</p><h2>Proposed Solution</h2><p>Detail your recommended approach...</p>`,
        project: `<h1>Project Proposal</h1><h2>Project Overview</h2><p>Comprehensive description of the project...</p><h2>Scope of Work</h2><p>Detailed breakdown of tasks...</p><h2>Methodology</h2><p>Explain your project execution approach...</p>`,
        service: `<h1>Service Proposal</h1><h2>Service Overview</h2><p>Description of services...</p><h2>Client Requirements</h2><p>Analysis of client needs...</p><h2>Service Offerings</h2><p>Detailed breakdown of services...</p>`,
        consulting: `<h1>Consulting Proposal</h1><h2>Engagement Overview</h2><p>Executive summary...</p><h2>Current State Analysis</h2><p>Assessment of the current situation...</p><h2>Recommended Approach</h2><p>Your consulting methodology...</p>`,
        blank: `<h1>Your Proposal Title</h1><p>Start writing your proposal here...</p>`
    };
    
    // === UI & EDITOR FUNCTIONS ===

    window.loadTemplate = (type) => {
        if (templates[type]) {
            editor.innerHTML = templates[type];
            editor.focus();
            updateProposalTitleFromEditor();
        }
    };

    const updateProposalTitleFromEditor = () => {
        const h1 = editor.querySelector('h1');
        if(h1) {
            document.getElementById('project-title').value = h1.textContent;
        }
    }
    
    const updateEditorTitleFromInput = () => {
        const projectTitle = document.getElementById('project-title').value;
        let h1 = editor.querySelector('h1');
        if (!h1) {
            const p = editor.querySelector('p');
            h1 = document.createElement('h1');
            if (p) {
                editor.insertBefore(h1, p);
            } else {
                editor.appendChild(h1);
            }
        }
        h1.textContent = projectTitle || 'Your Proposal Title';
    };

    window.toggleTheme = () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    };

    const updateThemeIcon = (theme) => {
        const themeIcon = document.getElementById('theme-icon');
        themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
        lucide.createIcons();
    };

    const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    };

    window.execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editor.focus();
        updateToolbarStates();
    };
    
    const updateToolbarStates = () => {
        ['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'insertUnorderedList', 'insertOrderedList'].forEach(cmd => {
            const btn = document.querySelector(`.toolbar-btn[onclick="execCommand('${cmd}')"]`);
            if (btn) {
                document.queryCommandState(cmd) ? btn.classList.add('active') : btn.classList.remove('active');
            }
        });
    };

    window.uploadSignature = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    window.signatureImage = e.target.result;
                    const signatureArea = document.getElementById('signature-area');
                    signatureArea.innerHTML = `<img src="${window.signatureImage}" class="signature-img" alt="Signature">`;
                    signatureArea.classList.add('has-signature');
                    autoSave(); // Save after signature is added
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };
    
    // Functions to insert content
    window.insertImage = () => execCommand('insertHTML', `<img src="${prompt('Enter image URL:')}" style="max-width: 100%; border-radius: 8px;">`);
    window.insertTable = () => execCommand('insertHTML', `<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></table>`);
    window.insertQuote = () => execCommand('insertHTML', `<blockquote>${window.getSelection().toString() || 'Quote...'}</blockquote><p></p>`);
    window.insertPaymentButton = () => {
        const paymentLink = document.getElementById('payment-link').value;
        const totalAmount = document.getElementById('total-amount').value;
        if (!paymentLink) {
            alert('Please enter a payment link in the Proposal Details first.');
            return;
        }
        const buttonText = totalAmount ? `Pay ${totalAmount}` : 'Pay Now';
        const buttonHTML = `<div style="text-align:center;margin:32px 0;"><a href="${paymentLink}" target="_blank" style="display:inline-block;background:#000;color:#fff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:700;">${buttonText}</a></div>`;
        execCommand('insertHTML', buttonHTML);
    };

    window.clearDocument = () => {
        if (confirm('Are you sure you want to clear the entire proposal?')) {
            localStorage.removeItem('proposalPro_autosave');
            location.reload();
        }
    };
    
    // === AUTOSAVE & LOAD ===
    
    const autoSave = () => {
        const data = {
            content: editor.innerHTML,
            clientName: document.getElementById('client-name').value,
            projectTitle: document.getElementById('project-title').value,
            totalAmount: document.getElementById('total-amount').value,
            paymentLink: document.getElementById('payment-link').value,
            signature: window.signatureImage,
        };
        localStorage.setItem('proposalPro_autosave', JSON.stringify(data));
    };

    const loadAutosavedData = () => {
        const savedData = localStorage.getItem('proposalPro_autosave');
        if (savedData) {
            if (confirm('Found autosaved content. Would you like to restore it?')) {
                const data = JSON.parse(savedData);
                editor.innerHTML = data.content || '';
                document.getElementById('client-name').value = data.clientName || '';
                document.getElementById('project-title').value = data.projectTitle || '';
                document.getElementById('total-amount').value = data.totalAmount || '';
                document.getElementById('payment-link').value = data.paymentLink || '';
                if (data.signature) {
                    window.signatureImage = data.signature;
                    const signatureArea = document.getElementById('signature-area');
                    signatureArea.innerHTML = `<img src="${window.signatureImage}" class="signature-img" alt="Signature">`;
                    signatureArea.classList.add('has-signature');
                }
            }
        }
        if (!editor.innerHTML.trim()) {
            loadTemplate('business');
        }
    };

    // === INITIALIZATION & EVENT LISTENERS ===
    
    // Initialize everything
    lucide.createIcons();
    loadTheme();
    loadAutosavedData();
    updateToolbarStates();
    editor.focus();
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Setup event listeners
    document.addEventListener('selectionchange', updateToolbarStates);
    document.getElementById('project-title').addEventListener('input', updateEditorTitleFromInput);
    
    // Debounced autosave for all inputs
    let saveTimeout;
    const allInputs = [editor, ...document.querySelectorAll('.detail-input')];
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(autoSave, 1000);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (['b', 'i', 'u', 's', 'd', 'p'].includes(key)) e.preventDefault();
            
            switch(key) {
                case 'b': execCommand('bold'); break;
                case 'i': execCommand('italic'); break;
                case 'u': execCommand('underline'); break;
                case 's': exportToHTML(); break;
                case 'd': toggleTheme(); break;
                case 'p': previewProposal(); break;
            }
        }
    });
});
