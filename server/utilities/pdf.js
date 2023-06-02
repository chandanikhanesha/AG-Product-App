const fs = require('fs');

const PDFDocument = require('pdfkit');

const writePdf = (base64Data) => {
  return new Promise((resolve, reject) => {
    let doc = new PDFDocument();
    let writeStream = fs.createWriteStream('/fs/ok.pdf');
    writeStream.on('close', () => {
      resolve();
    });
    writeStream.on('error', (e) => {
      reject(e);
    });
    doc.pipe(writeStream);
    doc.image(new Buffer(base64Data.replace('data:image/png;base64,', ''), 'base64'), 100, 100);
    doc.end();
  });
};

module.exports = {
  writePdf: writePdf,
};
