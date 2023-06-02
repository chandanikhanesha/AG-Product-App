const xmlBuilder = require('xmlbuilder');
const config = require('config').getConfig();
const { buildMonsantoRequest, buildXmlPayloadHeader, calculateSeedYear } = require('./common');

const buildOrderResponseLogRequest = async ({
  seedDealerMonsantoId,
  organizationName,
  from,
  to,
  productYear,
  monsantoUserData,
}) => {
  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  // console.log('order_response_log monsantoUserData: ', monsantoUserData);

  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'OrderResponseLogWS53',
    processStep: 'OrderResponseLogRequest',
    partnerId: seedDealerMonsantoId.trim(),
    partnerType: 'AGIIS-EBID',
    monsantoUserData,
  });

  xmlPayload
    .ele('n1:OrderResponseLogRequest', {
      Version: '5.3',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:n1': 'urn:cidx:names:specification:ces:schema:all:5:3',
    })
    .importDocument(
      buildXmlPayloadHeader({
        nameSpace: 'n1',
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
            name: 'BAYER COMPANY',
            identifier: MONSANTO_TECH_ID,
          },
        },
      }),
    )
    .importDocument(
      await buildOrderResponseLogRequestBody({
        from,
        to,
        productYear,
        buyer: {
          name: organizationName,
          identifier: seedDealerMonsantoId.trim(),
        },
        seller: {
          name: 'BAYER COMPANY',
          identifier: MONSANTO_TECH_ID,
        },
      }),
    );
  return xmlPayload.end({ pretty: true });
};

const buildOrderResponseLogRequestBody = async ({ from, to, productYear, buyer, seller }) => {
  const body = xmlBuilder.create('n1:OrderResponseLogRequestBody');
  body.importDocument(buildOrderResponseLogRequestProperties({ from, to, productYear }));
  body.importDocument(buildOrderResponseLogRequestPartners({ buyer, seller }));
  body.importDocument(buildOrderResponseLogRequestDetails());
  return body;
};

const buildOrderResponseLogRequestProperties = ({ from, to, productYear }) => {
  return xmlBuilder
    .create('n1:OrderResponseLogRequestProperties')
    .ele({
      'n1:ProductYear': productYear,
    })
    .insertAfter({
      'n1:DateTimeRange': {
        'n1:FromDateTime': from,
        'n1:ToDateTime': to,
      },
    });
};

const buildOrderResponseLogRequestPartners = ({ buyer, seller }) => {
  return xmlBuilder
    .create('n1:OrderResponseLogRequestPartners')
    .importDocument(buildOrderResponseLogRequestPartner({ type: 'Buyer', ...buyer }))
    .importDocument(buildOrderResponseLogRequestPartner({ type: 'Seller', ...seller }));
};

const buildOrderResponseLogRequestPartner = ({ type, name, identifier }) => {
  return xmlBuilder.create(`n1:${type}`).ele({
    'n1:PartnerInformation': {
      'n1:PartnerName': name,
      'n1:PartnerIdentifier': {
        '@Agency': 'AGIIS-EBID',
        '#text': identifier,
      },
    },
  });
};

const buildOrderResponseLogRequestDetails = () => {
  const details = xmlBuilder.create('n1:OrderResponseLogRequestDetails').ele({
    'n1:OrderResponseLogRequestProductLineItem': {
      'n1:LineNumber': '1',
    },
  });
  return details;
};

// PARSER:
const parseOrderResponseLogResponse = async (rawResponse) => {
  const envelope = rawResponse['soapenv:Envelope'];
  if (envelope['S:Body']) {
    const errorMessage =
      envelope['S:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0]['S:Fault'][0]['faultstring'][0];
    throw new Error(errorMessage);
  }
  const envBody = envelope['soapenv:Body'][0];
  const payload = envBody['ag:outboundData'][0]['ag:xmlPayload'][0];

  const orderResponseLogResponse = payload['OrderResponseLogResponse'][0];
  const orderResponseLog = orderResponseLogResponse['OrderResponseLogResponseBody'][0];

  // const orderResponseLogProperties = orderResponseLog['OrderResponseLogResponseProperties'][0];
  const orderResponseLogDetails = orderResponseLog['OrderResponseLogResponseDetails'];
  // const orderResponseLogProducts = orderResponseLogDetails['OrderResponseLogResponseProductLineItem'];

  return {
    products: await Promise.all(orderResponseLogDetails.map(orderResponseLogProduct)),
  };
};

const orderResponseLogProduct = async (product) => {
  const changeIndicatorObj = product['ns:ChangeIndicator'][0];
  const changeIndicator = {
    explanation: changeIndicatorObj['ns:ChangeExplantion'][0],
    indicatorType: changeIndicatorObj['ns:ChangeIndicatorType'][0],
    comments: changeIndicatorObj['ns:Comment'].map((comment) => comment['ns:Content'][0]),
  };

  const increaseOrDecreaseObj = product['IncreaseOrDecrease'][0];
  const quantityChangeObj = increaseOrDecreaseObj['ProductQuantityChange'][0]['Measurement'][0];

  const increaseOrDecrease = {
    type: increaseOrDecreaseObj['IncreaseOrDecreaseType'][0],
    quantityChange: {
      value: quantityChangeObj['MeasurementValue'][0],
      unit: quantityChangeObj['UnitOfMeasureCode'][0]['_'], //Check
    },
  };
  const increaseDecreaseDateTime = product['IncreaseOrDecreaseDateTime'][0]['DateTime'][0]['_'];
  const lineNumber = product['ns:LineNumber'][0]['_'];

  const identificationObj = product['ns:ProductInformation'][0]['ns:ProductIdentification'][0];
  const identification = {
    classification: identificationObj['ns:ProductClassification'][0],
    description: identificationObj['ns:ProductDescription'][0],
    gradeDescription: identificationObj['ns:ProductGradeDescription'][0],
    identifier: {
      id: identificationObj['ns:ProductIdentifier'][0]['_'],
      agency: identificationObj['ns:ProductIdentifier'][0]['$']['Agency'], //check
    },
    name: identificationObj['ns:ProductName'][0],
  };

  const soldToObj = product['ns:SoldTo'][0]['ns:PartnerInformation'][0];
  const soldTo = {
    identifier: {
      agency: soldToObj['ns:PartnerIdentifier'][0]['$']['Agency'],
      id: soldToObj['ns:PartnerIdentifier'][0]['_'],
    },
    name: soldToObj['ns:PartnerName'][0],
  };

  return {
    changeIndicator,
    increaseOrDecrease,
    increaseDecreaseDateTime,
    lineNumber,
    identification,
    soldTo,
  };
};

module.exports = {
  buildOrderResponseLogRequest,
  parseOrderResponseLogResponse,
};
