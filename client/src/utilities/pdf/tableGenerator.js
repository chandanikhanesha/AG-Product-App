import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import inventoryColumns from './inventory_columns';
import transferColumns from './transfer_report_columns';

function extractData(data, columns) {
  const tableData = data.map((item) =>
    columns.reduce((row, column) => {
      row[column.dataKey] = column.accessor ? column.accessor(item) : item[column.dataKey];
      return row;
    }, {}),
  );
  return tableData;
}

const isEmpty = (obj) => !Object.keys(obj).length;

const removeSnakeCase = (str) => str.split('_').join(' ');

// function loadImage(url) {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest()
//     xhr.open('get', url)
//     xhr.responseType = 'blob'
//     xhr.onload = () => {
//       console.log('xhr status: ', xhr.status)
//       if (xhr.status === 200) {
//         const fr = new FileReader()
//
//         fr.onload = function () {
//           console.log('File Reader result: ', fr.result)
//           resolve(fr.result.replace(/^data:application\/.+;base64,/, ''))
//         }
//         fr.readAsDataURL(xhr.response) // async call
//       } else {
//         reject(Error('Image didn\'t load successfully; error code:' + xhr.statusText))
//       }
//     }
//     xhr.onerror = () => {
//       reject(Error('There was a network error.'))
//     }
//     xhr.send()
//   })
// }

// report settings
const page = Object.freeze({ width: 297, height: 210 });
const padding = Object.freeze({ horizontal: 15, vertical: 15 });
const fonts = Object.freeze({ h1: 24, h2: 14, h3: 10, paragraph: 10 });

export async function createPDFTableLayout(ctx) {
  const {
    company = {},
    tableData = [],
    dynamicColumns = [],
    customerProducts = [],
    deliveryReceiptDetails = [],
    productType = '',
    organization = {},
    userFirstName = 'John',
    userLastName = 'Doe',
    pdfType = '',
  } = ctx;

  const doc = new jsPDF('landscape');
  doc.page = 1;
  const totalPagesExp = '{total_pages_count_string}';
  //const logo = await loadImage(`${process.env.REACT_APP_DO_BUCKET}/1552516714029.jpg`)

  // add company logo
  const header = (data) => {
    const doc = data.doc;

    //doc.addImage(logo, 'JPEG', padding.horizontal, 5, 55, 30)
    // render company name
    doc.setFontSize(fonts.h1);
    doc.text(removeSnakeCase(pdfType), page.width - padding.horizontal, padding.vertical + 10, {
      align: 'right',
    });
    doc.setFontSize(fonts.paragraph);
    doc.setLineCap('rounded');
    doc.setLineWidth(0.25);
    doc.setDrawColor(229, 229, 230);
    doc.line(padding.horizontal, 35, page.width - padding.horizontal, 35, 'S');

    doc.setFontSize(fonts.h2);
    doc.text(`${userFirstName} ${userLastName}`, padding.horizontal, padding.vertical + 30);

    if (!isEmpty(organization)) {
      doc.setFontSize(fonts.h3);

      doc.text(organization.address, padding.horizontal, padding.vertical + 36);
      doc.text(organization.phoneNumber, padding.horizontal, padding.vertical + 42);
    }

    if (!isEmpty(company)) {
      doc.setFontSize(fonts.h2);
      doc.text(company.name, page.width - padding.horizontal, padding.vertical + 30, {
        align: 'right',
      });
      doc.setFontSize(fonts.h3);
      doc.text(productType.toUpperCase(), page.width - padding.horizontal, padding.vertical + 36, {
        align: 'right',
      });
    }
  };

  // render table
  const columnTypes = {
    inventory: inventoryColumns(customerProducts, deliveryReceiptDetails, productType),
    transfers_report: transferColumns(),
  };

  /**
   * Assign columns based on the following criteria:
   * If dynamic columns and an imported set of columns exist, then filter the imported set of columns to only include those referened in the dynamic columns array.
   * If only dynamic columns then map the dynamic columns to create the requisite format for columns.
   * Else, if no dynamic columns use imported columns
   */
  const columns =
    dynamicColumns.length > 0 && !columnTypes[pdfType.toLowerCase()]
      ? dynamicColumns.map((col) => ({ header: col, dataKey: col }))
      : dynamicColumns.length > 0 && columnTypes[pdfType.toLowerCase()].length
      ? columnTypes[pdfType.toLowerCase()].filter((col) => dynamicColumns.includes(col.header))
      : columnTypes[pdfType.toLowerCase()];

  doc.autoTable({
    theme: 'plain',
    tableLineColor: [204, 204, 204],
    tableLineWidth: 0.25,
    styles: { halign: 'right', valign: 'middle' },
    headStyles: { textColor: [134, 134, 134], fontStyle: 'normal', overflow: 'linebreak', valign: 'top' },
    margin: { bottom: 20 },
    bodyStyles: { minCellWidth: 22 },
    columnStyles: columns.reduce((styles, column) => {
      styles[column.dataKey] = {
        cellWidth: column.width ? column.width : 'auto',
      };
      return styles;
    }, {}),
    startY: 75,
    columns,
    body: extractData(tableData, columns),
    didParseCell: (data) => {
      if (data.cell.section === 'body') {
        data.cell.styles.minCellHeight = 15;
      }
    },
    didDrawCell: (data) => {
      if (data.row.section === 'body') {
        data.doc.line(
          padding.horizontal - 1,
          data.cursor.y + data.row.height,
          page.width - padding.horizontal + 1,
          data.cursor.y + data.row.height,
        );
      }
      if (pdfType === 'Discount_Report') {
      }
    },
    didDrawPage: (data) => {
      // Header
      if (data.pageNumber === 1) {
        header(data);
      }
      // Footer
      let pageNum = 'Page ' + data.pageNumber;
      if (typeof doc.putTotalPages === 'function') {
        pageNum = pageNum + ' of ' + totalPagesExp;
      }
      doc.setFontSize(10);
      const pageSize = data.doc.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(pdfType, padding.horizontal, pageHeight - 8);
      doc.text(pageNum, pageWidth + 25, pageHeight - 8, { align: 'right' });
    },
  });

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  const pdfFileName = {
    Inventory: `.${company.name}.${productType}`,
    Transfers_Report: `.${company.name}.${productType}`,
    default: '',
  };

  const fileName = Object.keys(pdfFileName).includes(pdfType) ? pdfFileName[pdfType] : pdfFileName['default'];
  //doc.output('dataurlnewwindow')
  doc.save(`${pdfType}${fileName}.pdf`);
}
