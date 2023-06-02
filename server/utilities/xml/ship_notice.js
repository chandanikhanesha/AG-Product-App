const xmlBuilder = require('xmlbuilder');
const { buildMonsantoRequest, buildXmlPayloadHeader, calculateSeedYear, parseXmlStringPromise } = require('./common');
const config = require('config').getConfig();
const { monsantoTechnologyGln: MONSANTO_GLN, monsantoTechnologyId: MONSANTO_TECH_ID } = config;
const bayerAPIDown = process.env.IS_BAYER_API_DOWN;
const fs = require('fs');
const path = require('path');
const hardCodeXml = fs.readFileSync(path.join(__dirname, '../xmlResponse/shipNoticeResponse.xml'), {
  encoding: 'utf8',
});
const buildShipNoticeListRequest = async ({ technologyId = '', name, monsantoUserData }) => {
  console.log(technologyId, 'technologyId');
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'SCShipNoticeWS52',
    processStep: 'ShipNoticeListRequest',
    partnerId: technologyId.trim(),
    partnerType: 'AGIIS-EBID',
    useURN1: true,
    messageId: 'agridealertestmessageid1_111120211025am',
    monsantoUserData,
  });
  const apiSeedCompany = monsantoUserData.apiseedcompany || {};
  const growerLookup = false;
  xmlPayload
    .ele('ShipNoticeListRequest', {
      Version: '5.2',
      xmlns: 'urn:cidx:names:specification:ces:schema:all:5:2',
    })
    .importDocument(
      buildXmlPayloadHeader({
        // nameSpace: 'urn',
        params: {
          from: {
            inverse: true,
            agency: 'GLN',
            name: growerLookup ? apiSeedCompany.name : name,
            identifier: growerLookup ? apiSeedCompany.technologyId.trim() : technologyId.trim(),
            dataSource: 'WS-XML',
            seedYear: calculateSeedYear(),
            softwareName: 'AgriDealer',
            SoftwareVersion: '1.1.1',
          },
          to: {
            agency: 'GLN',
            name: 'Bayer Crop Science',
            identifier: MONSANTO_TECH_ID,
          },
        },
      }),
    )
    .importDocument(
      await buildShipNoticeListRequestBody({
        partners: [
          {
            type: 'Seller',
            name: 'Bayer Crop Science',
            identifier: MONSANTO_TECH_ID,
          },
        ],
      }),
    );
  return xmlPayload.end({ pretty: true });
};

const buildShipNoticeListRequestBody = async ({ partners }) => {
  const body = xmlBuilder.create('ShipNoticeListRequestBody');
  const propertiesDoc = xmlBuilder.create('ShipNoticeListRequestProperties');
  const detailsDoc = xmlBuilder.create('ShipNoticeListRequestDetails');
  const partnersDoc = await buildShipNoticeListRequestPartners(partners);
  body.importDocument(propertiesDoc);
  body.importDocument(partnersDoc);
  body.importDocument(detailsDoc);
  return body;
};

const buildShipNoticeListRequestPartners = async (partners) => {
  const partnersContainer = xmlBuilder.create('ShipNoticeListRequestPartners');
  await partners.forEach((partner) => {
    partnersContainer.importDocument(buildShipNoticeListRequestBodyPartner(partner));
  });
  return partnersContainer;
};

const buildShipNoticeListRequestBodyPartner = ({ type, name, identifier }) => {
  return xmlBuilder.create(`${type}`).ele({
    PartnerInformation: {
      PartnerName: name,
      PartnerIdentifier: {
        '@Agency': 'GLN',
        '#text': identifier,
      },
    },
  });
};

const parseShipNoticeListResponse = async (rawResponse1) => {
  const hardCodeResponse = await parseXmlStringPromise(hardCodeXml);
  const rawResponse = bayerAPIDown === 'true' ? hardCodeResponse : rawResponse1;
  const envelope = rawResponse['soapenv:Envelope'];
  const payload = envelope['soapenv:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0];
  const uuid = payload['ShipNoticeList'][0]['Header'][0]['ThisDocumentIdentifier'][0]['DocumentIdentifier'][0];
  const shipNoticeListBody = payload['ShipNoticeList'][0]['ShipNoticeListBody'][0];
  const shipNoticeListDetails = shipNoticeListBody['ShipNoticeListDetails'][0]['ShipNoticeBody'];
  let shipNoticeList = [];
  if (
    shipNoticeListBody['ShipNoticeListDetails'][0] &&
    shipNoticeListBody['ShipNoticeListDetails'][0]['ShipNoticeBody'].length > 0
  ) {
    await Promise.all(
      shipNoticeListDetails.map(async (item, index) => {
        const shipNoticeProperties = await parseShipNoticeProperties(item);
        const ShipNoticePartners = await parseShipNoticePartners(item);
        const shipNoticeDetails = await parseShipNoticeDetails(item);
        shipNoticeList.push({ shipNoticeProperties, ShipNoticePartners, shipNoticeDetails });
      }),
    );
  }

  return shipNoticeList;
};

const parseShipNoticeDetails = (shipNoticeDetails) => {
  const propertiesObj = shipNoticeDetails['ShipNoticeDetails'][0];
  let shipNoticeProducts = propertiesObj['ShipNoticeProductLineItem'];
  shipNoticeProducts = shipNoticeProducts.map((item) => {
    const productIdentification = item['ProductIdentification'].find(
      (a) => a['ProductIdentifier'][0]['$']['Agency'] == 'AGIIS-ProductID',
    );

    return {
      lineNumber: item['LineNumber'][0],
      product: {
        productId: productIdentification['ProductIdentifier'][0]['_'],
        productName: productIdentification['ProductName'][0],
        productDesc: productIdentification['ProductDescription'][0],
      },
      shippedQuantity: {
        value: item['ShippedQuantity'][0]['Measurement'][0]['MeasurementValue'][0],
        unitOfMeasureCode: item['ShippedQuantity'][0]['Measurement'][0]['UnitOfMeasureCode'][0]['_'],
      },
      productSubLineItems: {
        SubLineItemNumber: item['ProductSubLineItems'][0]['SubLineItemNumber'][0],
        lotNumber: item['ProductSubLineItems'][0]['ManufacturingIdentificationDetails']
          ? item['ProductSubLineItems'][0]['ManufacturingIdentificationDetails'][0][
              'ManufacturingIdentificationNumber'
            ][0]
          : null,
        grossVolume: {
          value: item['ProductSubLineItems'][0]['GrossVolume']
            ? item['ProductSubLineItems'][0]['GrossVolume'][0]['SpecifiedMeasurement'][0]['Measurement'][0][
                'MeasurementValue'
              ][0]
            : null,
          unitOfMeasureCode: item['ProductSubLineItems'][0]['GrossVolume']
            ? item['ProductSubLineItems'][0]['GrossVolume'][0]['SpecifiedMeasurement'][0]['Measurement'][0][
                'UnitOfMeasureCode'
              ][0]['_']
            : null,
        },
        netWeight: {
          value: item['ProductSubLineItems'][0]['NetWeight']
            ? item['ProductSubLineItems'][0]['NetWeight'][0]['SpecifiedMeasurement'][0]['Measurement'][0][
                'MeasurementValue'
              ][0]
            : null,
          unitOfMeasureCode: item['ProductSubLineItems'][0]['NetWeight']
            ? item['ProductSubLineItems'][0]['NetWeight'][0]['SpecifiedMeasurement'][0]['Measurement'][0][
                'UnitOfMeasureCode'
              ][0]['_']
            : null,
        },
      },
    };
  });
  return shipNoticeProducts;
};

const parseShipNoticePartners = (shipNoticePartners) => {
  const propertiesObj = shipNoticePartners['ShipNoticePartners'][0];
  let otherPartner = propertiesObj['OtherPartner'];
  otherPartner = otherPartner.map((item) => {
    return {
      [item['$']['PartnerRole']]: {
        name: item['PartnerInformation'][0]['PartnerName'][0],
        identifier: item['PartnerInformation'][0]['PartnerIdentifier'][0]['_'],
      },
    };
  });

  return {
    buyer: {
      name: propertiesObj['Buyer'][0]['PartnerInformation'][0]['PartnerName'][0],
      identifier: propertiesObj['Buyer'][0]['PartnerInformation'][0]['PartnerIdentifier'][0]['_'],
    },
    seller: {
      name: propertiesObj['Seller'][0]['PartnerInformation'][0]['PartnerName'][0],
      identifier: propertiesObj['Seller'][0]['PartnerInformation'][0]['PartnerIdentifier'][0]['_'],
    },
    otherPartner,
  };
};

const parseShipNoticeProperties = (shipNoticeProperties) => {
  const propertiesObj = shipNoticeProperties['ShipNoticeProperties'][0];
  let referenceInformation = propertiesObj['ReferenceInformation'];

  referenceInformation = referenceInformation.map((item) => {
    return {
      [item['$']['ReferenceType']]: item['DocumentReference'][0]['DocumentIdentifier'][0],
    };
  });
  return {
    shipmentIdentification: propertiesObj['ShipmentIdentification'][0]['DocumentReference'][0]['DocumentIdentifier'][0],
    shipDate: propertiesObj['ShipDate'][0]['DateTime'][0]['_'],
    purchaseOrderInformation: {
      documentIdentifier: propertiesObj['PurchaseOrderInformation'][0]['DocumentReference'][0]['DocumentIdentifier'][0],
      referenceItem: propertiesObj['PurchaseOrderInformation'][0]['DocumentReference'][0]['ReferenceItem'][0],
    },
    transportMethodCode: propertiesObj['TransportMethodCode'][0]['_'],
    referenceInformation,
    deliveryDate:
      propertiesObj['ConveyanceInformation'][0]['EstimatedTimeOfArrivalDate'][0]['DateTimeInformation'][0][
        'DateTime'
      ][0]._,
    ShipNoticeDate: propertiesObj['ShipNoticeDate'][0]['DateTime'][0]['_'],
  };
};

module.exports = {
  buildShipNoticeListRequest,
  parseShipNoticeListResponse,
};
