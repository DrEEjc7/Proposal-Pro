// Initialize Lucide icons
lucide.createIcons();

// Get editor element
const editor = document.getElementById('editor');

// Proposal templates
const templates = {
    business: `
        <h1>Business Proposal</h1>
        
        <h2>Executive Summary</h2>
        <p>Provide a compelling overview of your business proposal that captures the client's attention and summarizes the key benefits and value proposition.</p>
        
        <h2>Company Overview</h2>
        <p>Brief introduction to your company, mission, and core competencies.</p>
        
        <h2>Problem Statement</h2>
        <p>Clearly define the business challenges or opportunities that your proposal addresses.</p>
        
        <h2>Proposed Solution</h2>
        <p>Detail your recommended business approach and strategy.</p>
        
        <h2>Implementation Plan</h2>
        <p>Outline the phases, timeline, and key milestones for implementation.</p>
        
        <h2>Investment & ROI</h2>
        <p>Present your pricing structure and demonstrate the return on investment.</p>
        
        <h2>Team & Qualifications</h2>
        <p>Introduce key team members and their relevant experience.</p>
        
        <h2>Next Steps</h2>
        <p>Clear call-to-action and contact information for follow-up.</p>
    `,
    project: `
        <h1>Project Proposal</h1>
        
        <h2>Project Overview</h2>
        <p>Comprehensive description of the proposed project and its objectives.</p>
        
        <h2>Scope of Work</h2>
        <p>Detailed breakdown of all tasks, activities, and deliverables included in the project.</p>
        
        <h2>Methodology</h2>
        <p>Explain your approach, processes, and best practices for project execution.</p>
        
        <h2>Timeline & Milestones</h2>
        <p>Project phases with specific dates, milestones, and deliverable schedules.</p>
        
        <h2>Resources & Team</h2>
        <p>Team structure, roles, responsibilities, and resource allocation.</p>
        
        <h2>Budget & Costs</h2>
        <p>Detailed cost breakdown including labor, materials, and overhead.</p>
        
        <h2>Risk Management</h2>
        <p>Identified risks and mitigation strategies.</p>
        
        <h2>Success Metrics</h2>
        <p>Key performance indicators and success criteria for the project.</p>
    `,
    service: `
        <h1>Service Proposal</h1>
        
        <h2>Service Overview</h2>
        <p>Comprehensive description of the services you're proposing to provide.</p>
        
        <h2>Client Needs Assessment</h2>
        <p>Analysis of the client's specific requirements and challenges.</p>
        
        <h2>Service Offerings</h2>
        <p>Detailed breakdown of all services included in your proposal.</p>
        
        <h2>Service Delivery</h2>
        <p>How services will be delivered, including methods, tools, and processes.</p>
        
        <h2>Service Level Agreement</h2>
        <p>Performance standards, response times, and quality commitments.</p>
        
        <h2>Pricing Structure</h2>
        <p>Transparent pricing for all services with flexible options.</p>
        
        <h2>Implementation</h2>
        <p>Onboarding process and timeline for service commencement.</p>
        
        <h2>Support & Maintenance</h2>
        <p>Ongoing support, maintenance, and continuous improvement processes.</p>
    `,
    consulting: `
        <h1>Consulting Proposal</h1>
        
        <h2>Engagement Overview</h2>
        <p>Executive summary of the consulting engagement and expected outcomes.</p>
        
        <h2>Current State Analysis</h2>
        <p>Assessment of the client's current situation and identified challenges.</p>
        
        <h2>Recommended Approach</h2>
        <p>Your consulting methodology and framework for addressing the challenges.</p>
        
        <h2>Consulting Services</h2>
        <p>Detailed description of consulting activities and deliverables.</p>
        
        <h2>Project Plan</h2>
        <p>Phase-by-phase breakdown with timelines and key milestones.</p>
        
        <h2>Consultant Qualifications</h2>
        <p>Your expertise, experience, and relevant case studies.</p>
        
        <h2>Investment</h2>
        <p>Consulting fees, expenses, and payment terms.</p>
        
        <h2>Expected Outcomes</h2>
        <p>Measurable benefits and value the client can expect to achieve.</p>
    `,
    blank: `
        <h1>Your Proposal Title</h1>
        <p>Start writing your proposal here...</p>
    `
};

function loadTemplate(type) {
    if (templates[type]) {
        editor.innerHTML = templates[type];
        editor.focus();
    }
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'moon' : 'sun');
    lucide.createIcons();
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.setAttribute('data-lucide', savedTheme === 'dark' ? 'moon' : 'sun');
    lucide.createIcons();
}

// Execute formatting commands
function execCommand(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
    updateToolbarStates();
}

// Update toolbar button states
function updateToolbarStates() {
    const commands = ['bold', 'italic', 'underline'];
    commands.forEach(command => {
        const btn = document.querySelector(`[onclick="execCommand('${command}')"]`);
        if (btn) {
            if (document.queryCommandState(command)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// Insert image
function insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 32px 0; box-shadow: var(--shadow-medium);">`;
                execCommand('insertHTML', img);
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Insert table
function insertTable() {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
        let table = '<table style="border-collapse: collapse; width: 100%; margin: 32px 0; border: 2px solid var(--accent-color); overflow: hidden; box-shadow: var(--shadow-medium);">';
        
        for (let i = 0; i < rows; i++) {
            table += '<tr>';
            for (let j = 0; j < cols; j++) {
                const isHeader = i === 0;
                const cellStyle = `border: 1px solid var(--border-color); padding: 16px 20px; background: ${isHeader ? 'var(--accent-color)' : 'var(--bg-primary)'}; color: ${isHeader ? 'var(--bg-primary)' : 'var(--text-primary)'}; font-weight: ${isHeader ? '700' : '400'};`;
                const cellTag = isHeader ? 'th' : 'td';
                table += `<${cellTag} style="${cellStyle}">${isHeader ? `Header ${j + 1}` : `Cell ${i}-${j + 1}`}</${cellTag}>`;
            }
            table += '</tr>';
        }
        
        table += '</table>';
        execCommand('insertHTML', table);
    }
}

// Insert quote
function insertQuote() {
    const quote = prompt('Enter your quote:', 'Your quote here...');
    if (quote) {
        const blockquote = `<blockquote style="border-left: 4px solid var(--accent-color); padding: 20px 24px; margin: 32px 0; background: var(--bg-secondary); font-style: italic; font-weight: 400;">${quote}</blockquote>`;
        execCommand('insertHTML', blockquote);
    }
}

// Clear document
function clearDocument() {
    if (confirm('Are you sure you want to clear the entire document?')) {
        editor.innerHTML = '<h1>Your Proposal Title</h1><p>Start writing your proposal here...</p>';
        editor.focus();
    }
}

// Update toolbar states on selection change
document.addEventListener('selectionchange', updateToolbarStates);

// Auto-save to localStorage
let saveTimeout;
editor.addEventListener('input', function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem('proposalPro_autosave', editor.innerHTML);
    }, 1000);
});

// Load autosaved content
window.addEventListener('load', function() {
    loadTheme();
    
    const autosaved = localStorage.getItem('proposalPro_autosave');
    if (autosaved && confirm('Found autosaved content. Would you like to restore it?')) {
        editor.innerHTML = autosaved;
    } else {
        // Load default template
        loadTemplate('business');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'b':
                e.preventDefault();
                execCommand('bold');
                break;
            case 'i':
                e.preventDefault();
                execCommand('italic');
                break;
            case 'u':
                e.preventDefault();
                execCommand('underline');
                break;
            case 's':
                e.preventDefault();
                exportToHTML();
                break;
            case 'd':
                e.preventDefault();
                toggleTheme();
                break;
        }
    }
});

// Initialize
editor.focus();
updateToolbarStates();
loadTheme();

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();