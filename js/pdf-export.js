/**
 * Asynchronously fetches a CSS file and inlines it into a <style> tag.
 * @param {string} url - The URL of the CSS file to fetch.
 * @returns {HTMLStyleElement} A <style> element with the CSS content.
 */
async function inlineCSS(url) {
    const response = await fetch(url);
    const cssText = await response.text();
    const styleElement = document.createElement('style');
    styleElement.textContent = cssText;
    return styleElement;
}

/**
 * Assembles the final proposal HTML document for export.
 * @returns {Document} A complete, self-contained HTML document object.
 */
async function buildFinalProposalDocument() {
    // 1. Create a new document in memory
    const doc = document.implementation.createHTMLDocument('Proposal');

    // 2. Fetch and inline the dedicated PDF stylesheet
    const pdfStyles = await inlineCSS('css/pdf-export.css');
    doc.head.appendChild(pdfStyles);

    // 3. Gather all data from the UI
    const clientName = document.getElementById('client-name').value;
    const projectTitle = document.getElementById('project-title').value;
    const totalAmount = document.getElementById('total-amount').value;
    const paymentLink = document.getElementById('payment-link').value;
    const editorContent = document.getElementById('editor').innerHTML;
    // signatureImage is a global from editor.js

    // 4. Build the proposal details box (if any details are provided)
    let detailsHTML = '';
    if (clientName || projectTitle || totalAmount) {
        detailsHTML = `
            <div class="proposal-details-box">
                ${clientName ? `<p><strong>Client:</strong> ${clientName}</p>` : ''}
                ${projectTitle ? `<p><strong>Project:</strong> ${projectTitle}</p>` : ''}
                ${totalAmount ? `<p><strong>Investment:</strong> ${totalAmount}</p>` : ''}
                ${paymentLink ? `<p><strong>Payment:</strong> <a href="${paymentLink}">${paymentLink}</a></p>` : ''}
            </div>`;
    }

    // 5. Build the signature box (if a signature exists)
    let signatureHTML = '';
    if (window.signatureImage) {
        signatureHTML = `
            <div class="signature-box">
                <p><strong>Authorized Signature:</strong></p>
                <img src="${window.signatureImage}" style="max-height: 50px; width: auto;">
            </div>`;
    }
    
    // 6. Assemble the final body content
    doc.body.innerHTML = detailsHTML + editorContent + signatureHTML;

    return doc;
}

/**
 * Exports the final proposal document to a high-quality PDF.
 */
async function exportPDF() {
    const btn = document.getElementById('export-btn');
    const originalHTML = btn.innerHTML;
    
    try {
        btn.innerHTML = '<i data-lucide="loader-2"></i><span>Generating...</span>';
        btn.classList.add('generating');
        lucide.createIcons();

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
        // Build the final, styled document
        const finalDocument = await buildFinalProposalDocument();

        // Use the new document's body for rendering
        await pdf.html(finalDocument.body, {
            callback: (doc) => {
                const projectTitle = document.getElementById('project-title').value;
                const fileName = projectTitle ? `${projectTitle.replace(/\s+/g, '-')}-proposal.pdf` : 'proposal.pdf';
                doc.save(fileName);
            },
            margin: [15, 15, 15, 15], // Top, Right, Bottom, Left in mm
            autoPaging: 'text',
            html2canvas: {
                scale: 0.5, // Higher scale for better quality, adjust as needed
                useCORS: true,
                allowTaint: true,
                dpi: 300,
            },
            width: 180, // A4 width (210mm) - margins (15*2)
            windowWidth: 794 // Approx width of A4 in pixels at 96dpi
        });

    } catch (error) {
        console.error('PDF Export Error:', error);
        alert('Error generating PDF. See console for details.');
    } finally {
        btn.innerHTML = originalHTML;
        btn.classList.remove('generating');
        lucide.createIcons();
    }
}
