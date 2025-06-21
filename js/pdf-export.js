/**
 * A centralized function to build the final proposal HTML from various sources.
 * This ensures that the preview, PDF, and HTML exports are all consistent.
 * @returns {DocumentFragment} - A DOM fragment containing the fully assembled proposal.
 */
function buildFinalProposalHTML() {
    // 1. Get all the data
    const clientName = document.getElementById('client-name').value;
    const projectTitle = document.getElementById('project-title').value;
    const totalAmount = document.getElementById('total-amount').value;
    const paymentLink = document.getElementById('payment-link').value;
    const editorContent = document.getElementById('editor').innerHTML;
    // signatureImage is a global variable from editor.js

    // 2. Clone the master template from index.html
    const template = document.getElementById('proposal-export-template');
    const proposalFragment = template.content.cloneNode(true);

    // 3. Get handles to the sections inside the template
    const headerInfoSection = proposalFragment.getElementById('template-header-info');
    const mainContentSection = proposalFragment.getElementById('template-main-content');
    const signatureSection = proposalFragment.getElementById('template-signature-section');

    // 4. Build and inject the header info if it exists
    if (clientName || projectTitle || totalAmount) {
        let headerHTML = `
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e5e5;">
                ${clientName ? `<p style="margin: 8px 0;"><strong>Client:</strong> ${clientName}</p>` : ''}
                ${projectTitle ? `<p style="margin: 8px 0;"><strong>Project:</strong> ${projectTitle}</p>` : ''}
                ${totalAmount ? `<p style="margin: 8px 0;"><strong>Total Investment:</strong> ${totalAmount}</p>` : ''}
                ${paymentLink ? `<p style="margin: 8px 0;"><strong>Payment Link:</strong> <a href="${paymentLink}" target="_blank">${paymentLink}</a></p>` : ''}
            </div>`;
        headerInfoSection.innerHTML = headerHTML;
    }

    // 5. Inject the main editor content
    mainContentSection.innerHTML = editorContent;

    // 6. Build and inject the signature if it exists
    if (window.signatureImage) {
        let signatureHTML = `
            <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: right;">
                <p style="margin-bottom: 10px;"><strong>Authorized Signature:</strong></p>
                <img src="${window.signatureImage}" style="max-width: 200px; max-height: 80px;">
            </div>`;
        signatureSection.innerHTML = signatureHTML;
    }

    return proposalFragment;
}

/**
 * Previews the assembled proposal in a new browser tab.
 */
window.previewProposal = function() {
    const proposalFragment = buildFinalProposalHTML();
    const projectTitle = document.getElementById('project-title').value;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';

    // The export container itself has the necessary styles, but we need body styles
    const finalHTML = new XMLSerializer().serializeToString(proposalFragment);
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Preview: ${projectTitle || 'Proposal'}</title>
            <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Open Sans', Arial, sans-serif; max-width: 700px; margin: 0 auto;
                    background: ${isDark ? '#000' : '#fff'}; color: ${isDark ? '#fff' : '#000'};
                }
                /* You can add more global preview styles here if needed */
            </style>
        </head>
        <body>${finalHTML}</body>
        </html>
    `);
    previewWindow.document.close();
};

/**
 * Exports the assembled proposal to a standalone HTML file.
 */
window.exportToHTML = function() {
    const proposalFragment = buildFinalProposalHTML();
    const projectTitle = document.getElementById('project-title').value;
    const finalHTML = new XMLSerializer().serializeToString(proposalFragment);
    
    const blob = new Blob([`<!DOCTYPE html><html><head><title>${projectTitle || 'Proposal'}</title><link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"></head><body>${finalHTML}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle ? projectTitle.replace(/\s+/g, '-').toLowerCase() : 'proposal'}.html`;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Exports the assembled proposal to a high-quality PDF file.
 */
window.exportToPDF = async function() {
    const button = document.getElementById('export-pdf-btn');
    const originalContent = button.innerHTML;
    
    try {
        button.innerHTML = '<i data-lucide="loader-2" class="generating"></i> PDF...';
        lucide.createIcons();

        const proposalElement = buildFinalProposalHTML().querySelector('.export-container');
        const projectTitle = document.getElementById('project-title').value;
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

        // Temporarily append to body to ensure all styles are computed
        document.body.appendChild(proposalElement);

        await pdf.html(proposalElement, {
            callback: function (doc) {
                const fileName = `${projectTitle ? projectTitle.replace(/\s+/g, '-').toLowerCase() : 'proposal'}.pdf`;
                doc.save(fileName);
                document.body.removeChild(proposalElement); // Clean up
            },
            margin: [15, 15, 15, 15],
            autoPaging: 'text',
            width: 180,
            windowWidth: proposalElement.offsetWidth,
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF.');
    } finally {
        button.innerHTML = originalContent;
        lucide.createIcons();
    }
};
