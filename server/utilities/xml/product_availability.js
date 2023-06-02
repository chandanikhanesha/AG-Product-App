const xmlBuilder = require('xmlbuilder');
const config = require('config').getConfig();
const { buildMonsantoRequest, buildXmlPayloadHeader, calculateSeedYear } = require('./common');

const buildProductAvailabilityRequest = async ({
  seedDealerMonsantoId,
  organizationName,
  productList,
  monsantoUserData,
}) => {
  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'PriceAndAvailabilityWS53',
    processStep: 'PriceAndAvailabilityRequest53',
    partnerId: seedDealerMonsantoId.trim(),
    partnerType: 'AGIIS-EBID',
    isProcutBooking: true,
    useURN1: true,
    messageId: 'PriceAndAvailabilityWS53_001',
    monsantoUserData,
  });
  xmlPayload
    .ele('ns:PriceAndAvailabilityRequest', {
      Version: '5.3',
      'xmlns:ns': 'urn:cidx:names:specification:ces:schema:all:5:3',
    })
    .importDocument(
      buildXmlPayloadHeader({
        nameSpace: 'ns',
        params: {
          from: {
            inverse: true,
            agency: 'AGIIS-EBID',
            name: organizationName,
            identifier: seedDealerMonsantoId.trim(),
            seedYear: calculateSeedYear(),
            dataSource: 'WS-XML',
            softwareName: 'AgriDealer',
            SoftwareVersion: process.env.SOFTWARE_VERSION,
          },
          to: {
            agency: 'AGIIS-EBID',
            name: 'BAYER', // MONSANTO COMPANY
            identifier: MONSANTO_TECH_ID,
          },
        },
      }),
    )
    .importDocument(
      await buildProductAvailabilityRequestBody({
        productList: productList.filter((p) => p !== null),
        buyer: {
          name: organizationName,
          identifier: seedDealerMonsantoId,
        },
        seller: {
          name: 'BAYER', // MONSANTO COMPANY
          identifier: MONSANTO_TECH_ID,
        },
      }),
    );
  return xmlPayload.end({ pretty: true });
};

const buildProductAvailabilityRequestBody = async ({ productList, buyer, seller }) => {
  const body = xmlBuilder.create('ns:PriceAndAvailabilityRequestBody');
  body.importDocument(
    buildProductAvailabilityRequestProperties({
      requisitionNumber: `PAL${Date.now()}`,
    }),
  );
  body.importDocument(buildProductAvailabilityRequestPartners({ buyer, seller }));
  body.importDocument(await buildProductAvailabilityRequestDetails(productList));
  return body;
};

const buildProductAvailabilityRequestProperties = ({ requisitionNumber = 'PALREQUEST1234' }) => {
  return xmlBuilder
    .create('ns:PriceAndAvailabilityRequestProperties')
    .ele({
      'ns:RequisitionNumber': {
        'ns:DocumentIdentifier': {
          '#text': requisitionNumber,
        },
      },
    })
    .insertAfter({
      'ns:RequisitionTypeCode': {
        '@Domain': 'ANSI-ASC-X12-92',
        '#text': 'DEALRPAL',
      },
    })
    .insertAfter({
      'ns:LanguageCode': {
        '@Domain': 'ISO-639-2T',
        '#text': 'ENG',
      },
    })
    .insertAfter({
      'ns:CurrencyCode': {
        '@Domain': 'ISO-4217',
        '#text': 'USD',
      },
    });
};

const buildProductAvailabilityRequestPartners = ({ buyer, seller }) => {
  return xmlBuilder
    .create('ns:PriceAndAvailabilityRequestPartners')
    .importDocument(buildProductAvailabilityRequestPartner({ type: 'Buyer', ...buyer }))
    .importDocument(buildProductAvailabilityRequestPartner({ type: 'Seller', ...seller }))
    .importDocument(buildProductAvailabilityRequestPartner({ type: 'ShipTo', ...buyer }))
    .importDocument(buildProductAvailabilityRequestPartner({ type: 'Payer', ...buyer }));
};

const buildProductAvailabilityRequestPartner = ({ type, name, identifier }) => {
  return xmlBuilder.create(`ns:${type}`).ele({
    'ns:PartnerInformation': {
      'ns:PartnerName': name,
      'ns:PartnerIdentifier': {
        '@Agency': 'AGIIS-EBID',
        '#text': identifier,
      },
    },
  });
};

const buildProductAvailabilityRequestDetails = async (productList) => {
  const details = xmlBuilder.create('ns:PriceAndAvailabilityRequestDetails');

  await productList.forEach((product, index) => {
    details.importDocument(buildProductAvailabilityRequestProductLineItem(product, index + 1));
  });
  return details;
};

const buildProductAvailabilityRequestProductLineItem = (
  {
    crossReferenceId: crossReferenceProductId,
    classification: cropType,
    orderQty: quantity,
    LineItem,
    requestedDate = new Date().toISOString(),
  },
  index,
) => {
  let x = requestedDate.split('Z');
  let x1 = x[0].split('.');
  let x2 = x1[0] + '-05:00';
  let data = {};
  if (typeof LineItem.suggestedDealerMeasurementUnitCode == 'string') {
    const suggestedDealerMeasurementUnitCode = JSON.parse(LineItem.suggestedDealerMeasurementUnitCode);
    data = suggestedDealerMeasurementUnitCode;
  } else {
    data = LineItem.suggestedDealerMeasurementUnitCode;
  }

  const value = data && data.value;
  const domain = data && data.domain;

  return xmlBuilder.create('ns:PriceAndAvailabilityRequestProductLineItem').ele({
    'ns:LineNumber': index,
    'ns:RequisitionLineItemNumber': index,
    'ns:ProductIdentification': {
      'ns:ProductIdentifier': {
        '@Agency': 'AGIIS-ProductID',
        '#text': crossReferenceProductId,
      },
      'ns:ProductClassification': cropType,
    },
    'ns:ProductQuantity': {
      'ns:Measurement': {
        'ns:MeasurementValue': LineItem.suggestedDealerMeasurementValue,
        'ns:UnitOfMeasureCode': {
          '@Domain': domain || 'UN-Rec-20',
          '#text': value || 'UN',
        },
      },
    },
    'ns:ScheduleDateTimeInformation': {
      '@ScheduleType': 'RequestedDelivery',
      'ns:DateTimeInformation': {
        'ns:DateTime': {
          '@DateTimeQualifier': 'On',
          '#text': x2,
        },
      },
    },
  });
};

// PARSER:
const parseProductAvailabilityResponse = async (rawResponse) => {
  const envelope = rawResponse['soapenv:Envelope'];
  if (envelope['S:Body']) {
    const errorMessage =
      envelope['S:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0]['S:Fault'][0]['faultstring'][0];
    throw new Error(errorMessage);
  }
  const envBody = envelope['soapenv:Body'][0];
  const payload = envBody['ag:outboundData'][0]['ag:xmlPayload'][0];
  const priceAndAvailabilityResponse = payload['PriceAndAvailabilityResponse'][0];
  const priceAndAvailabilityBody = priceAndAvailabilityResponse['PriceAndAvailabilityResponseBody'][0];
  const priceAndAvailabilityProperties = priceAndAvailabilityBody['PriceAndAvailabilityResponseProperties'][0];
  const priceAndAvailabilityDetails = priceAndAvailabilityBody['PriceAndAvailabilityResponseDetails'][0];
  if (!priceAndAvailabilityDetails) return { availableProducts: [] };
  const priceAndAvailabilityProducts = priceAndAvailabilityDetails['PriceAndAvailabilityResponseProductLineItem'];

  return {
    availableProducts: await Promise.all(priceAndAvailabilityProducts.map(parsePriceAndAvailabilityProduct)),
  };
};

//parse quantity data to check if it is enough
const parsePriceAndAvailabilityProduct = async (product) => {
  const lineNumber = product['LineNumber'];
  const characteristics = {};
  await product['ProductCharacteristics'].forEach((characteristic) => {
    characteristics[characteristic['$']['Agency']] = characteristic['_'];
  });

  const identifications = {};
  await product['ProductIdentification'].forEach((identification) => {
    identifications[identification['ProductIdentifier'][0]['$']['Agency']] =
      identification['ProductIdentifier'][0]['_'];
  });

  const quantityObj = product['ProductQuantity'] && product['ProductQuantity'][0]['Measurement'][0];
  const quantity = {
    value: quantityObj['MeasurementValue'][0],
    unit: quantityObj['UnitOfMeasureCode'][0]['_'],
  };

  const quantityInformation = product['ProductQuantityInformation'] && product['ProductQuantityInformation'][0];
  const quantityInformationComment = quantityInformation['Comment'][0]['Content'][0];
  const requisitionLineNumber = product['RequisitionLineItemNumber'][0];
  const scheduleInformationObj = product['ScheduleDateTimeInformation'][0];
  const scheduleInformation = {
    type: scheduleInformationObj['$']['ScheduleType'],
    date: scheduleInformationObj['DateTimeInformation'][0]['DateTime'][0]['_'],
  };

  return {
    lineNumber,
    characteristics,
    identifications,
    quantity,
    quantityComment: quantityInformationComment,
    requisitionLineNumber,
    scheduleInformation,
  };
};

module.exports = {
  buildProductAvailabilityRequest,
  parseProductAvailabilityResponse,
};
