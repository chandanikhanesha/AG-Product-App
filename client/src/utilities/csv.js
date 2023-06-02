import { getStore } from '../store/configureStore';
import { createCustomersFromCsv, updateCustomer } from '../store/actions/customer';
import { listLicences } from '../store/actions';
import { createProduct } from '../store/actions/product';
import { createCustomProduct } from '../store/actions/custom_product';
import { createProductDealer, updateMonsantoProduct } from '../store/actions';

import { camelCase } from 'lodash/string';

// right now just looking for static headers, they need to be spelled out exactly as below
// const STATIC_CSV_HEADERS = [
//   "name",
//   "email",
//   "office phone number",
//   "cell phone number",
//   "delivery address",
//   "business street",
//   "business city",
//   "business state",
//   "business zip",
//   "notes",
//   "monsanto technology id"
// ];

const STATIC_CSV_HEADERS = [
  'name',
  'email',
  'officePhoneNumber',
  'cellPhoneNumber',
  'deliveryAddress',
  'businessStreet',
  'businessCity',
  'businessState',
  'businessZip',
  'monsantoTechnologyId',
  'glnId',
];

/**
 * Turns CSV data into arrays for each row.
 * Taken from here and modified to include option to pass delimiter: https://gist.github.com/Jezternz/c8e9fafc2c114e079829974e3764db75
 * @param {string} strData CSV data as a string
 * @param {string?} delimiter CSV delimiter, defaults to comma
 */
export const csvStringToArray = (strData, delimiter) => {
  delimiter = delimiter || ',';
  const objPattern = new RegExp(
    '(\\' + delimiter + '|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^\\' + delimiter + '\\r\\n]*))',
    'gi',
  );
  let arrMatches = null,
    arrData = [[]];
  while ((arrMatches = objPattern.exec(strData))) {
    if (arrMatches[1].length && arrMatches[1] !== ',') arrData.push([]);
    arrData[arrData.length - 1].push(arrMatches[2] ? arrMatches[2].replace(new RegExp('""', 'g'), '"') : arrMatches[3]);
  }
  return arrData;
};

export const createProductsFromCSV = (strData, companyId, seedCompanyId, productType) => {
  const data = csvStringToArray(strData);
  const store = getStore();
  const organizationId = store.getState().userReducer.organizationId;
  console.log(data);
  if (seedCompanyId) {
    let products = [];
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row.length || row.length !== headers.length) continue;
      let product = {
        seedCompanyId: seedCompanyId,
        seedType: productType.toUpperCase(),
        organizationId: parseInt(organizationId),
        modifiedLotRows: [],
        orderAmount: 0,
        brand: row[headers.indexOf('trait')],
        blend: row[headers.indexOf('variety')],
        rm: row[headers.indexOf('rm')]
          ? row[headers.indexOf('rm')].startsWith('$')
            ? row[headers.indexOf('rm')].split('$')[1]
            : row[headers.indexOf('rm')]
          : 0,
        treatment: row[headers.indexOf('treatment')],
        msrp: parseFloat(row[headers.indexOf('msrp')] || 0),
        seedSource: row[headers.indexOf('seedSource')],
        quantity: 0,
        deliveredAmount: 0,
      };
      products.push(product);
    }

    products.forEach((product) => {
      store.dispatch(createProduct(product));
    });
  }

  if (companyId) {
    let products = [];
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row.length || row.length !== headers.length) continue;
      let product = {
        companyId: companyId,
        organizationId: parseInt(organizationId),
        modifiedLotRows: [],
        name: row[headers.indexOf('name')],
        type: row[headers.indexOf('type')],
        description: row[headers.indexOf('description')],
        customId: row[headers.indexOf('customId')] || row[headers.indexOf('ID')],
        unit: row[headers.indexOf('unit')] || 0,
        costUnit: parseFloat(row[headers.indexOf('costUnit')].substring(1)),
        quantity: parseFloat(row[headers.indexOf('quantity')] || 0),
      };
      products.push(product);
    }
    products.forEach((product) => {
      store.dispatch(createCustomProduct(product));
    });
  }
};

export const createDealerFromCSV = async (strData, seedCompanyId, name) => {
  const data = csvStringToArray(strData);
  const store = getStore();
  const organizationId = store.getState().userReducer.organizationId;
  const organizationName = name;

  let dealers = [];
  let dealerTransfers = [];
  const headers = data[0];
  const error = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row.length || row.length !== headers.length) continue;

    const isMatch = organizationName === row[headers.indexOf('Sending Dealer Name')];

    let dealer = {
      address: `${row[headers.indexOf('SendingDealerStreet')]}-${row[headers.indexOf('SendingDealerCity')]}`,
      companyId: seedCompanyId,
      companyType: 'Monsanto Seed Company',
      email: null,
      name: row[headers.indexOf('SendingDealerName')],
      notes: null,
      phone: row[headers.indexOf('SendingDealerPhone')],
    };
    dealers.push(dealer);
    let dealerTransfer = {
      lotNumber: row[headers.indexOf('Lot Number')] !== '' ? row[headers.indexOf('Lot Number')] : null,
      // monsantoProductId: row[headers.indexOf('Product Id')],
      seedCompanyId: seedCompanyId,
      deliveryDate: new Date(),
      isAccepted: true,
      isReturn: null,
      netWeight: null,
      quantity: row[headers.indexOf('Product Quantity')],
      source: isMatch === true ? 'Transfer Out' : 'Transfer In',
      dealerName: row[headers.indexOf('Sending Dealer Name')],
      transferId: row[headers.indexOf('Transfer ID')],
      crossReferenceId: row[headers.indexOf('GTIN')],
      dealerAddress: `${row[headers.indexOf('Sending Dealer Street')]}-${row[headers.indexOf('Sending Dealer City')]}`,
    };
    dealerTransfers.push(dealerTransfer);
  }
  await dealerTransfers.map(async (dealerTransfer) => {
    await store
      .dispatch(updateMonsantoProduct(dealerTransfer))
      .then((r) => {
        console.log(r, 'rrrrrrr');
      })
      .catch((e) => {
        console.log(e, 'eeeeee');

        error.push(`error- ${e}`);
        // throw error;
      });
  });
  await [...new Map(dealers.map((item) => [item['name'], item])).values()].map(async (dealers) => {
    await store
      .dispatch(createProductDealer(dealers))
      .then((r) => {
        console.log(r, 'r');
      })
      .catch((e) => {
        error.push(`error- ${e}`);
        // throw error;
      });
  });

  return error;
};

/**
 * Create customers from a CSV file
 * @param {string} strData CSV data as a string
 */
export const createCustomersFromCSV = async (strData, bayerGlnID) => {
  const itemCf = [];
  // convert to array
  const data = csvStringToArray(strData);
  // determine at which index the headers are at
  const columnIndices = {};
  STATIC_CSV_HEADERS.forEach((header, idx) => {
    if (data[0].indexOf(header) > -1) columnIndices[camelCase(header)] = idx;
  });
  const store = getStore();
  const organizationId = store.getState().userReducer.organizationId;

  // skip first row (header row)
  let customers = [];
  for (let i = 1; i < data.length; i++) {
    let customer = {};
    let customerInfo = '';
    STATIC_CSV_HEADERS.forEach((header) => {
      const attr = camelCase(header);
      if (columnIndices[attr] !== undefined) {
        customer[attr] = data[i][columnIndices[attr]];
        if (data[i][columnIndices[attr]] && data[i][columnIndices[attr]] !== '')
          customerInfo = data[i][columnIndices[attr]];
      }
    });
    console.log(STATIC_CSV_HEADERS, customer.glnId, customer.monsantoTechnologyId);
    customerInfo &&
      customerInfo !== '' &&
      customers.push(
        Object.assign(
          {
            organizationId,
            notes: '',
            organizationName: '',
            email: '',
            officePhoneNumber: (customer.officePhoneNumber && customer.officePhoneNumber) || '',
            cellPhoneNumber: (customer.cellPhoneNumber && customer.cellPhoneNumber) || '',
            deliveryAddress: (customer.deliveryAddress && customer.deliveryAddress) || '',
            businessStreet: (customer.businessStreet && customer.businessStreet) || '',
            businessCity: (customer.businessCity && customer.businessCity) || '',
            businessState: (customer.businessState && customer.businessState) || '',
            businessZip: (customer.businessZip && customer.businessZip) || '',
            glnId: (customer.glnId && customer.glnId) || '',
            monsantoTechnologyId: (customer.monsantoTechnologyId && customer.monsantoTechnologyId) || '',
            PurchaseOrders: [],
            Quotes: [],
            Shareholders: [],
            willUseSeedDealerZones: false,
            zoneIds: '[{"classification":"","zoneId":""}]',
          },
          customer,
        ),
      );
  }
  const { payload } = await store.dispatch(createCustomersFromCsv(customers));
  let itemsProcessed = 0;

  await Promise.all(
    payload
      .filter((p) => p.monsantoTechnologyId !== '' || p.glnId !== '')
      .map(async ({ id, name, monsantoTechnologyId, glnId }) => {
        itemsProcessed++;
        const technologyId = monsantoTechnologyId === '' ? glnId : monsantoTechnologyId;
        const isGlnId = monsantoTechnologyId === '' ? true : false;
        try {
          const { data } = await store.dispatch(
            listLicences({
              technologyId,
              name,
              growerLookup: true,
              customerId: id,
              isGlnId,
              bayerGlnID,
            }),
          );
          let licences = [];
          data.licences[0].statusDetails
            .filter((d) => d.classification !== 'ALFALFA')
            .forEach(({ classification, zoneId }) => {
              licences.push({ classification, zoneId });
            });
          await store.dispatch(
            updateCustomer(id, { zoneIds: Array.isArray(licences) ? JSON.stringify(licences) : licences }),
          );
          // if (itemsProcessed === payload.length) {
          //   window.location.reload();
          // }
        } catch (error) {
          itemCf.push(name);
        }
      }),
  );
  return itemCf;
};

export const downloadCSV = (content, fileName) => {
  const a = document.createElement('a');
  const mimeType = 'text/csv;encoding:utf-8';

  if (navigator.msSaveBlob) {
    // IE10
    navigator.msSaveBlob(
      new Blob([content], {
        type: mimeType,
      }),
      'export.csv',
    );
  } else if (URL && 'download' in a) {
    //html5 A[download]
    a.href = URL.createObjectURL(
      new Blob([content], {
        type: mimeType,
      }),
    );
    a.setAttribute('download', fileName + '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    window.location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
  }
};
