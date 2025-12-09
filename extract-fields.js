
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function listFields(pdfFileName) {
    try {
        const pdfPath = path.join(__dirname, 'public', pdfFileName);
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        console.log(`\n=== ${pdfFileName.toUpperCase()} ===`);
        console.log('--- FORM FIELDS START ---');
        fields.forEach(field => {
            const type = field.constructor.name;
            const name = field.getName();
            console.log(`${name} (${type})`);
        });
        console.log('--- FORM FIELDS END ---');
        console.log(`Total fields: ${fields.length}\n`);
    } catch (err) {
        console.error(`Error extracting fields from ${pdfFileName}:`, err.message);
    }
}

// Extract fields from all 3 PDFs
(async () => {
    await listFields('thiqa-fillable.pdf');
    await listFields('daman-fillable.pdf');
    await listFields('nas-fillable.pdf');
})();
