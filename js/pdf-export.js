/**
 * Exports the content of the editor to a high-quality PDF file.
 * Uses the jsPDF.html() method to create a professional document
 * with selectable text and clickable links.
 */
async function exportToPDF() {
    const button = document.getElementById('export-pdf-btn');
    const originalHTML = button.innerHTML;
    const editor = document.getElementById('editor');

    try {
        button.innerHTML = '<i data-lucide="loader-2"></i> Generating...';
        button.classList.add('generating');
        lucide.createIcons();
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        // This is a direct replacement for the old html2canvas method.
        // It renders HTML elements directly into the PDF, preserving text and links.
        await pdf.html(editor, {
            callback: function (doc) {
                const fileName = `proposal-${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
            },
            margin: [15, 15, 15, 15], // Top, Right, Bottom, Left
            autoPaging: 'text',
            x: 0,
            y: 0,
            width: 180, // (210mm A4 width - 15mm*2 margins)
            windowWidth: editor.scrollWidth,
            html2canvas: {
                // scale is important for performance and to avoid oversized images
                scale: 0.3, 
                useCORS: true,
                allowTaint: true
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF. Please check the console for details.');
    } finally {
        button.innerHTML = originalHTML;
        button.classList.remove('generating');
        lucide.createIcons();
    }
}

/**
 * Exports the content of the editor to a standalone HTML file,
 * preserving the current theme (light or dark).
 */
function exportToHTML() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';
    const editor = document.getElementById('editor');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposal Document</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Open Sans', Arial, sans-serif;
            line-height: 1.8;
            max-width: 700px;
            margin: 0 auto;
            padding: 50px 40px;
            background: ${isDark ? '#000000' : '#ffffff'};
            color: ${isDark ? '#ffffff' : '#000000'};
        }
        h1 { 
            font-size: 2.5em; 
            font-weight: 800;
            border-bottom: 3px solid ${isDark ? '#ffffff' : '#000000'};
            padding-bottom: 16px;
            margin-bottom: 32px;
        }
        h2 { font-size: 2em; font-weight: 700; margin: 48px 0 20px 0; }
        h3 { font-size: 1.5em; font-weight: 600; margin: 32px 0 20px 0; }
        h4 { font-size: 1.25em; font-weight: 600; margin: 32px 0 20px 0; }
        p { margin: 20px 0; font-weight: 400; }
        ul, ol { margin: 24px 0; padding-left: 32px; }
        li { margin: 12px 0; }
        strong { font-weight: 700; }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 32px 0;
            border: 2px solid ${isDark ? '#ffffff' : '#000000'};
        }
        td, th {
            border: 1px solid ${isDark ? '#333333' : '#e5e5e5'};
            padding: 16px 20px;
            background: ${isDark ? '#111111' : '#ffffff'};
        }
        th {
            background: ${isDark ? '#ffffff' : '#000000'};
            color: ${isDark ? '#000000' : '#ffffff'};
            font-weight: 700;
        }
        img {
            max-width: 100%;
            height: auto;
            margin: 32px 0;
        }
        a {
            color: ${isDark ? '#ffffff' : '#000000'};
            text-decoration: underline;
            font-weight: 500;
        }
        blockquote {
            border-left: 4px solid ${isDark ? '#ffffff' : '#000000'};
            padding: 20px 24px;
            margin: 32px 0;
            background: ${isDark ? '#1a1a1a' : '#f5f5f5'};
            font-style: italic;
        }
    </style>
</head>
<body>
    ${editor.innerHTML}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = `proposal-${new Date().toISOString().split('T')[0]}.html`;
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}