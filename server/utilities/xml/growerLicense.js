const xmlBuilder = require('xmlbuilder');
const { buildMonsantoRequest, buildXmlPayloadHeader, parseXmlStringPromise } = require('./common');
const config = require('config').getConfig();
const { monsantoTechnologyGln: MONSANTO_GLN, monsantoTechnologyId: MONSANTO_TECH_ID } = config;
const bayerAPIDown = process.env.IS_BAYER_API_DOWN;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const path = require('path');
const uuid = uuidv4();
const hardCodeXml = fs.readFileSync(
  path.join(__dirname, '../xmlResponse/AgreementStatusRequest(whenCreateCompany).xml'),
  {
    encoding: 'utf8',
  },
);

const buildGrowerLicenseRequest = async ({ technologyId = '', name, isGlnId, monsantoUserData, bayerGlnID }) => {
  const partnerID = bayerGlnID !== undefined ? bayerGlnID : technologyId;
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'LicenseStatus53WS',
    processStep: 'LicenseStatusRequest',
    partnerId: partnerID,
    partnerType: 'AGIIS-EBID',
    useURN1: true,
    messageId: '12345LicenseStatus53WS_001_EXAMPLE',
    monsantoUserData,
  });

  const growerLookup = monsantoUserData.growerLookup;
  const apiSeedCompany = monsantoUserData.apiseedcompany || {};
  xmlPayload
    .ele('urn1:AgreementStatusRequest')
    .importDocument(
      buildXmlPayloadHeader({
        nameSpace: 'urn1',
        params: {
          from: {
            inverse: true,
            agency: 'GLN',
            name: growerLookup ? apiSeedCompany.name : name,
            identifier: growerLookup ? apiSeedCompany.technologyId.trim() : technologyId.trim(),
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
      await buildGrowerLicenseRequestBody({
        partners: [
          {
            type: 'Buyer',
            name: growerLookup ? apiSeedCompany.name : name,
            identifier: growerLookup ? apiSeedCompany.technologyId.trim() : technologyId.trim(),
            agency: 'GLN',
          },
          {
            type: 'Seller',
            name: 'Bayer Crop Science',
            identifier: MONSANTO_TECH_ID,
            agency: 'GLN',
          },
          {
            type: 'ShipTo',
            name,
            identifier: technologyId.trim(),
            agency: isGlnId !== false ? 'GLN' : 'AssignedBySeller',
          },
        ],
      }),
    );
  return xmlPayload.end({ pretty: true });
};

const buildGrowerLicenseRequestBody = async ({ partners }) => {
  const body = xmlBuilder.create('urn1:AgreementStatusRequestBody');
  const partnersDoc = await buildGrowerLicenseRequestBodyPartners(partners);
  body.importDocument(partnersDoc);
  return body;
};

const buildGrowerLicenseRequestBodyPartners = async (partners) => {
  const partnersContainer = xmlBuilder.create('urn1:AgreementStatusRequestPartners');
  await partners.forEach((partner) => {
    partnersContainer.importDocument(buildGrowerLicenseRequestBodyPartner(partner));
  });
  return partnersContainer;
};

const buildGrowerLicenseRequestBodyPartner = ({ type, name, identifier, agency }) => {
  return xmlBuilder.create(`urn1:${type}`).ele({
    'urn1:PartnerInformation': {
      'urn1:PartnerName': name,
      'urn1:PartnerIdentifier': {
        '@Agency': agency,
        '#text': identifier,
      },
    },
  });
};
//add grower

const buildAddGrowerLicenseRequest = async ({ monsantoUserData, info }) => {
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'LicenseStatus53WS',
    processStep: 'LicenseStatusRequest',

    partnerType: 'AGIIS-EBID',
    useURN1: true,
    messageId: '12345LicenseStatus53WS_001_EXAMPLE',
    monsantoUserData,
  });

  const data = xmlPayload.ele('LicenseStatusIDRequest', {
    'xmlns:mon': 'urn:monsanto:uscomm:service:header',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    xmlns: 'Monsanto:Service:LicenseStatus',
    Version: '1.0',
  });

  data.importDocument(await buildAddGrowerLicenseRequestHeader(monsantoUserData));

  const body = data.ele('LicenseStatusIDRequestBody', { xmlns: 'Monsanto:Service:LicenseStatus' });
  const partnersContainer = xmlBuilder.create('DemographicIdentifiers');
  await ['Name', 'City', 'ContactFirstName', 'ContactLastName', 'Country', 'County', 'State', 'Street', 'Zip'].forEach(
    (partner) => {
      partnersContainer.ele({
        [partner]: info[partner],
      });
    },
  );
  body.importDocument(partnersContainer);

  return xmlPayload.end({ pretty: true });
};

const buildAddGrowerLicenseRequestHeader = async (monsantoUserData) => {
  const header = await xmlBuilder.create(`mon:Header`);
  await header.ele({
    'mon:DocumentIdentifier': uuid,
    'mon:DocumentDateTime': new Date().toISOString(),
  });
  await header.ele({
    'mon:From': {
      'mon:PartnerName': monsantoUserData.apiseedcompany.name,
      'mon:PartnerIdentifier': {
        '@type': 'GLN',
        '#text': monsantoUserData.apiseedcompany.technologyId,
      },
    },
  });
  header.ele({
    'mon:To': {
      'mon:PartnerName': 'Monsanto',
      'mon:PartnerIdentifier': {
        '@type': 'GLN',
        '#text': '1100016793329',
      },
    },
  });
  return header;
};

function getPartnerInfo(partner) {
  return {
    id: partner['_'],
    agency: partner['$']['Agency'],
  };
}

const parseAddGrowerLicenseResponse = async (rawResponse) => {
  console.log(rawResponse, 'rawResponse');

  const rawResponseData = rawResponse;
  const envelope = rawResponseData['soapenv:Envelope'];
  const payload = envelope['soapenv:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0];

  const uuid = payload['LicenseStatusResponse'][0]['ns2:Header'][0]['ns2:DocumentIdentifier'][0];
  const $growerLicences = payload['LicenseStatusResponse'][0]['LicenseStatusResponseBody'];

  const licences = $growerLicences[0]['LicenseStatusResponseDetails'].map(($growerLicence) => {
    const grower = $growerLicence['GrowerInformation'][0];
    const licenceDetail = $growerLicence['LicenseInformation'][0];

    const data = {
      uuid: uuid,
      PartnerName: grower['GrowerEntity'][0]['PartnerName'][0].trim(),
      PartnerTechId: grower['GrowerEntity'][0]['PartnerIdentifier'][0]['_'],
      ContactFirstName: grower['ContactFirstName'][0],
      ContactLastName: grower['ContactLastName'][0],
      Address: grower['AddressInformation'][0]['AddressLine'][0],
      City: grower['AddressInformation'][0]['CityName'][0],
      State: grower['AddressInformation'][0]['State'][0],
      Zip: grower['AddressInformation'][0]['PostalCode'][0],
      County: grower['AddressInformation'][0]['County'][0],
      PhoneNumber: grower['PhoneNumber'][0],
      LicenseStatus: licenceDetail['LicenseStatus'][0],
      RenewalStatus: licenceDetail['RenewalStatus'][0],
      LicenseNumber: licenceDetail['LicenseNumber'][0],
      ZoneInformation: licenceDetail['ZoneInformation'].map(($zone) => {
        return {
          AgreementName: $zone['AgreementName'][0],
          ProductCrop: $zone['ProductCrop'][0],
          ProductCropCode: $zone['ProductCropCode'][0],
          ZoneId: $zone['ZoneId'][0],
          ZoneType: $zone['ZoneType'][0],

          ZoneName: $zone['ZoneName'][0],
          ZoneYear: $zone['ZoneYear'][0],
        };
      }),
    };
    return data;
  });

  return {
    licences,
  };
};

const parseGrowerLicenseResponse = async (rawResponse) => {
  const hardCodeResponse = await parseXmlStringPromise(hardCodeXml);
  const rawResponseData = bayerAPIDown === 'true' ? hardCodeResponse : rawResponse;
  const envelope = rawResponseData['soapenv:Envelope'];
  const payload = envelope['soapenv:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0];

  const uuid = payload['AgreementStatusResponse'][0]['Header'][0]['ThisDocumentIdentifier'][0]['DocumentIdentifier'][0];
  const $growerLicences = payload['AgreementStatusResponse'][0]['AgreementStatusResponseBody'];
  const licences = $growerLicences.map(($growerLicence) => {
    const partners = $growerLicence['AgreementStatusResponsePartners'][0];
    const $buyer = partners['Buyer'][0]['PartnerInformation'][0];
    const $seller = partners['Buyer'][0]['PartnerInformation'][0];
    const $shipTo = partners['ShipTo'][0]['PartnerInformation'][0];
    const buyer = {
      name: $buyer['PartnerName'][0],
      identifiers: $buyer['PartnerIdentifier'].map(getPartnerInfo),
    };
    const seller = {
      name: $seller['PartnerName'][0],
      identifiers: $seller['PartnerIdentifier'].map(getPartnerInfo),
    };
    const shipTo = {
      name: $shipTo['PartnerName'][0],
      identifiers: $shipTo['PartnerIdentifier'].map(getPartnerInfo),
    };

    const properties = $growerLicence['AgreementStatusResponseProperties'][0];
    const statusDetails = properties['AgreementStatusList'].map((status) => {
      return {
        status: status['AgreementStatus'][0],
        // classification: status["Zone"][0]["ProductClassification"][0],
        classification: status['Zone'][0]['ProductDescription'][0],
        zoneId: status['Zone'][0]['ZoneID'][0],
        zoneType: status['Zone'][0]['ZoneType'][0],
      };
    });
    return {
      buyer,
      seller,
      shipTo,
      uuid,

      statusDetails: statusDetails.concat([
        {
          status: 'Licensed',
          classification: 'CANOLA',
          zoneId: '*',
          zoneType: 'Canola Pricing Zones',
        },
        {
          status: 'Licensed',
          classification: 'SORGHUM',
          zoneId: '*',
          zoneType: 'Sorghum Pricing Zones',
        },
      ]),
    };
  });

  return {
    licences,
  };
};

module.exports = {
  buildGrowerLicenseRequest,
  parseGrowerLicenseResponse,
  buildAddGrowerLicenseRequest,
  parseAddGrowerLicenseResponse,
};
