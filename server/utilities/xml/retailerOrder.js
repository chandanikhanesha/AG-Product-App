const xmlBuilder = require('xmlbuilder');
const {
  buildMonsantoRequest,
  buildXmlPayloadHeader,
  getPartnerId,
  parseXmlStringPromise,
  calculateSeedYear,
} = require('./common');
const config = require('config').getConfig();
const { ApiSeedCompany, Organization } = require('models');
const bayerAPIDown = process.env.IS_BAYER_API_DOWN;
const fs = require('fs');
const path = require('path');

const buildRetailOrderSummaryRequest = async ({ user, seedDealerMonsantoId }) => {
  let currentOrganizationInfo;
  if (!seedDealerMonsantoId) {
    throw new Error('User must have a Bayer Id to perform this action');
  }
  currentOrganizationInfo = user && (await user.getOrganizationInfo());
  const organization = await Organization.findById(currentOrganizationInfo.id);
  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  const monsantoUserData = await ApiSeedCompany.findOne({ where: { organizationId: user.organizationId } });
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'RetailerOrderSummaryWS53',
    processStep: 'RetailerOrderSummaryRequest',
    partnerId: seedDealerMonsantoId.trim(),
    partnerType: 'AGIIS-EBID',
    monsantoUserData,
  });

  xmlPayload
    .ele('ns:RetailerOrderSummaryRequest', {
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
            name: currentOrganizationInfo.name,
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
      buildRetailOrderSummaryRequestBody({
        buyer: {
          agency: 'AGIIS-EBID',
          name: currentOrganizationInfo.name,
          identifier: seedDealerMonsantoId.trim(),
          AddressInformation: {
            AddressLine: organization.dataValues.address,
            CityName: organization.dataValues.businessCity,
            StateOrProvince: organization.dataValues.businessState,
            PostalCode: organization.dataValues.businessZip,
            PostalCountry: 'US',
          },
        },
        seller: {
          agency: 'AGIIS-EBID',
          name: 'Bayer Crop Science',
          identifier: MONSANTO_TECH_ID,
        },
      }),
    );

  return xmlPayload.end({ pretty: true });
};

const buildRetailOrderSummaryRequestBody = ({ buyer, seller }) => {
  const body = xmlBuilder.create('ns:RetailerOrderSummaryRequestBody');
  body.importDocument(buildRetailOrderSummaryRequestProperties());
  body.importDocument(buildRetailOrderSummaryRequestPartners({ buyer, seller }));
  body.importDocument(buildRetailOrderSummaryRequestDetails({ buyer, seller }));
  return body;
};

const buildRetailOrderSummaryRequestProperties = () => {
  return xmlBuilder.create('ns:RetailerOrderSummaryRequestProperties').ele({
    'ns:RetailerRequestAllType': {
      '#text': 0,
    },
  });
};

const buildRetailOrderSummaryRequestPartners = ({ buyer, seller }) => {
  return xmlBuilder
    .create('ns:RetailerOrderSummaryRequestPartners')
    .ele({
      'ns:Buyer': {
        'ns:PartnerInformation': {
          'ns:PartnerName': buyer.name,
          'ns:PartnerIdentifier': {
            '@Agency': 'AGIIS-EBID',
            '#text': buyer.identifier,
          },
          'ns:AddressInformation': {
            'ns:AddressLine': {
              '#text': buyer.AddressInformation.AddressLine || 'Default Street',
            },
            'ns:CityName': {
              '#text': buyer.AddressInformation.CityName || 'Default City',
            },
            'ns:StateOrProvince': {
              '#text': buyer.AddressInformation.StateOrProvince || 'NE',
            },
            'ns:PostalCode': {
              '#text': buyer.AddressInformation.PostalCode || '99999',
            },
            'ns:PostalCountry': {
              '#text': buyer.AddressInformation.PostalCountry || 'Default Country',
            },
          },
        },
      },
    })
    .insertAfter({
      'ns:Seller': {
        'ns:PartnerInformation': {
          'ns:PartnerName': seller.name,
          'ns:PartnerIdentifier': {
            '@Agency': 'AGIIS-EBID',
            '#text': seller.identifier,
          },
        },
      },
    });
};

const buildRetailOrderSummaryRequestDetails = ({}) => {
  return xmlBuilder.create('ns:RetailerOrderSummaryRequestDetails').ele({
    'ns:RetailerOrderSummaryProductLineItem': {
      'ns:LineNumber': {
        '#text': 99999,
      },
    },
  });
};

const parseRetailOrderSummaryResponse = async (rawResponse) => {
  const hardCodeXml = fs.readFileSync(path.join(__dirname, `../xmlResponse/RetailerOrderSummaryResponse.xml`), {
    encoding: 'utf8',
  });

  const hardCodeResponse = await parseXmlStringPromise(hardCodeXml);
  const rawResponseData = bayerAPIDown === 'true' ? hardCodeResponse : rawResponse;

  let envelope = rawResponseData['soapenv:Envelope'];

  if (envelope['S:Body']) {
    const errorMessage = envelope['S:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:reason'][0];
    if (errorMessage == 'No data found') {
      throw new Error(`No data found in retail order summary response`);
    }
  }
  if (envelope['S:Body']) {
    const errorMessage =
      envelope['S:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0]['S:Fault'][0]['faultstring'][0];
    throw new Error(errorMessage);
  }
  const payload = envelope['soapenv:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0];
  const $retailOrderSummary = payload['RetailerOrderSummaryReport'][0]['RetailerOrderSummaryReportBody'][0];
  const $retailOrderProperties = $retailOrderSummary['RetailerOrderSummaryReportProperties'][0];
  const $retailOrderPartners = $retailOrderSummary['RetailerOrderSummaryReportPartners'][0];
  const $retailOrderDetails = $retailOrderSummary['RetailerOrderSummaryReportDetails'][0];
  return {
    CurrencyCode: $retailOrderProperties['CurrencyCode'][0]['_'],
    LanguageCode: $retailOrderProperties['LanguageCode'][0]['_'],
    lastRequestDate: $retailOrderProperties['LastRequestDate'][0]['DateTime'][0]['_'],
    zoneId: $retailOrderProperties['ZoneId'] ? $retailOrderProperties['ZoneId'][0] : '',
    productClassification: $retailOrderProperties['ProductClassification'][0],
    buyerMonsantoId: getPartnerId($retailOrderPartners['Buyer'][0], null, true),
    sellerMonsantoId: getPartnerId($retailOrderPartners['Seller'][0], null, true), // Bayer ID

    OrderDetails: $retailOrderDetails['RetailerOrderSummaryReportProductLineItem'].map(parseOrderDetail),
  };
};

const getMeasurementData = (field) => {
  const measurement = field['Measurement'][0];
  return {
    measurementValue: measurement['MeasurementValue'][0],
    unitOfMeasureCode: measurement['UnitOfMeasureCode'][0]['_'],
  };
};

const parseOrderDetail = (detail) => {
  return {
    lineNumber: detail['LineNumber'],
    productIdentification: detail['ProductIdentification'][0]['ProductIdentifier'][0]['_'],
    totalRetailerProductQuantity: getMeasurementData(detail['TotalRetailerProductQuantity'][0]),
    shippedQuantity: getMeasurementData(detail['ShippedQuantity'][0]),
    scheduledToShipQuantity: getMeasurementData(detail['ScheduledToShipQuantity'][0]),
    balanceToShipQuantity: getMeasurementData(detail['BalanceToShipQuantity'][0]),
    positionQuantity: {
      measurement: getMeasurementData(detail['PositionQuantity'][0]),
      longShortPositionType: detail['PositionQuantity'][0]['LongShortPositionType'][0],
    },
    transfersInQuantity: getMeasurementData(detail['TransfersInQuantity'][0]),
    transfersOutQuantity: getMeasurementData(detail['TransfersOutQuantity'][0]),
    returnsQuantity: getMeasurementData(detail['ReturnsQuantity'][0]),
  };
};

module.exports = {
  buildRetailOrderSummaryRequest,
  parseRetailOrderSummaryResponse,
};
