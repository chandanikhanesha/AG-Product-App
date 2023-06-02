const xmlBuilder = require('xmlbuilder');
const config = require('config').getConfig();
const { buildMonsantoRequest, buildXmlPayloadHeader, calculateSeedYear } = require('./common');

const buildproductMovementReportRequest = async (item) => {
  const { seedDealerMonsantoId, organizationName, monsantoUserData, isReturn, customerData } = item;
  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  let shipAgencyType = agencyType(customerData);
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'SCProductMovementReportWS',
    processStep: 'ProductMovementReport',
    partnerId: seedDealerMonsantoId.trim(),
    partnerType: 'GLN',
    useURN1: true,
    messageId: 'testgpos-8608-4e68-865b-6e3916a3286d',
    monsantoUserData,
  });
  xmlPayload
    .ele('ProductMovementReport', {
      Version: '5.0',
      'xmlns:ns': 'urn:cidx:names:specification:ces:schema:all:5:0',
      'xmlns:cidx': 'urn:cidx:names:specification:ces:schema:all:5:0',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      xmlns: 'urn:cidx:names:specification:ces:schema:all:5:0',
    })
    .importDocument(
      buildXmlPayloadHeader({
        // nameSpace: 'ns',
        params: {
          from: {
            inverse: true,
            agency: 'GLN',
            name: organizationName,
            identifier: seedDealerMonsantoId.trim(),
            seedYear: calculateSeedYear(),
            dataSource: 'WS-XML',
            softwareName: 'AgriDealer',
            softwareVersion: process.env.SOFTWARE_VERSION,
          },
          to: {
            agency: 'GLN',
            name: 'BAYER', // MONSANTO COMPANY
            identifier: MONSANTO_TECH_ID,
          },
        },
      }),
    )
    .importDocument(await buildproductMovementReportRequestBody(item));
  return xmlPayload.end({ pretty: true });
};

const buildproductMovementReportRequestBody = async ({
  organizationName,
  seedDealerMonsantoId,
  productTransactions,
  customerData,
  isReturn,
  invoiceDate,
}) => {
  const body = xmlBuilder.create('ProductMovementReportBody').ele('ProductMovementReportDetails');
  body.ele('ReportingEntity').ele({
    PartnerInformation: {
      PartnerName: organizationName,
      PartnerIdentifier: {
        '@Agency': 'GLN',
        '#text': seedDealerMonsantoId.trim(),
      },
    },
  });
  const productMovementTransactionsbody = body.ele('ProductMovementTransactions', {
    ProductMovementReportType: 'SalesReport',
  });
  productTransactions.forEach((item) => {
    productMovementTransactionsbody.importDocument(
      makeProductMovementTransaction(item, customerData, organizationName, seedDealerMonsantoId, isReturn, invoiceDate),
    );
  });
  return body;
};

const agencyType = (customerData) => {
  var agencyTypeData;
  if (customerData.glnId && customerData.monsantoTechnologyId) {
    return (agencyTypeData = 'AssignedBySeller');
  } else if (customerData.monsantoTechnologyId !== '') {
    return (agencyTypeData = 'AssignedBySeller');
  } else if (customerData.glnId !== null) {
    return (agencyTypeData = 'GLN');
  } else {
    agencyTypeData = 'GLN';
  }
  return agencyTypeData;
};

const makeProductMovementTransaction = (
  item,
  customerData,
  organizationName,
  seedDealerMonsantoId,
  isReturn,
  invoiceDate,
) => {
  let shipAgencyType = agencyType(customerData);
  console.log(shipAgencyType, 'shipAgencyType');

  return xmlBuilder.create('ProductMovementTransaction').ele({
    ProductMovementTransactionProperties: {
      '@ProductMovementType': isReturn ? 'Return' : 'StockSale', // if it is Return then 'Return' otherwise 'StockSale'
      '@SaleOrReturnType': 'EndUser',
      ReferenceInformation: {
        '@ReferenceType': 'InvoiceNumber',
        DocumentReference: {
          DocumentIdentifier: item.InvoiceNumber,
        },
      },

      EventDateTime: [
        {
          '@EventDateType': 'ShipDate',
          DateTime: {
            '@DateTimeQualifier': 'On',
            '#text': new Date().toISOString(),
          },
        },
        {
          '@EventDateType': 'InvoiceDate',
          DateTime: {
            '@DateTimeQualifier': 'On',
            '#text': new Date(invoiceDate).toISOString(),
          },
        },
      ],

      LanguageCode: { '@Domain': 'ISO-639-2T', '#text': 'eng' },
      CurrencyCode: { '@Domain': 'ISO-4217', '#text': 'USD' },
    },

    ProductMovementTransactionPartners: {
      ShipTo: {
        PartnerInformation: {
          PartnerName: customerData.name,
          PartnerIdentifier: {
            '@Agency': shipAgencyType,
            '#text':
              shipAgencyType === 'GLN'
                ? customerData.glnId.trim()
                : customerData.monsantoTechnologyId
                ? customerData.monsantoTechnologyId.trim()
                : customerData.glnId.trim(),
          },
          AddressInformation: {
            AddressLine: customerData.address ? customerData.address : 'Street Address' || 'Default Street',
            CityName: customerData.businessCity ? customerData.businessCity : 'Default City' || 'Default City',
            StateOrProvince: customerData.businessState ? customerData.businessState.slice(0, 2) : 'NE',
            PostalCode: customerData.businessZip || '99999',
            PostalCountry: 'US',
          },
        },
      },
      OtherPartner: {
        '@PartnerRole': 'ShipFrom',
        PartnerInformation: {
          PartnerName: organizationName,
          PartnerIdentifier: {
            '@Agency': 'GLN',
            '#text': seedDealerMonsantoId.trim(),
          },
          AddressInformation: {
            AddressLine: customerData.address ? customerData.address : 'Street Address' || 'Default Street',
            CityName: customerData.businessCity ? customerData.businessCity : 'Default City' || 'Default City',
            StateOrProvince: customerData.businessState ? customerData.businessState.slice(0, 2) : 'NE',

            PostalCode: customerData.businessZip || '99999',
            PostalCountry: 'US',
          },
        },
      },
    },
    ProductMovementTransactionDetails: {
      ProductMovementProductLineItem: buildProductMovementProductLineItem(item),
    },
  });
};

const buildProductMovementProductLineItem = ({ ProductLineItems }) => {
  return ProductLineItems.map((item, index) => ({
    LineNumber: item.LineNumber,
    ProductIdentification: {
      ProductIdentifier: { '@Agency': 'AGIIS-ProductID', '#text': item.productId },
      ProductName: item.ProductName,
    },
    ProductQuantity: {
      Measurement: {
        MeasurementValue: item.ProductQuantity.MeasurementValue,
        UnitOfMeasureCode: { '@Domain': item.ProductQuantity.Domain, '#text': item.ProductQuantity.text },
      },
    },
  }));
};

module.exports = {
  buildproductMovementReportRequest,
};
