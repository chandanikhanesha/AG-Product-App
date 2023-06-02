const request = require('request-promise');
const config = require('config').getConfig();
const {
  growerLicense: {
    buildGrowerLicenseRequest,
    parseGrowerLicenseResponse,
    parseAddGrowerLicenseResponse,
    buildAddGrowerLicenseRequest,
  },
  common: { parseXmlStringPromise, parseGrowerLicenseError },
} = require('utilities/xml');

const { create: monsantoReqLogCreator } = require('../middleware/monsantoReqLogCreator');
const { ApiSeedCompany, MonsantoLot, MonsantoProduct, Customer } = require('models');

module.exports.check = async (req, res) => {
  const { technologyId, username, password, name, customerId, isGlnId, bayerGlnID } = req.body;
  const growerLookup = req.body.growerLookup || false;
  //   let name = req.body.growerLookup ? '' : name;
  console.log(req.body, '-----licence get from check');

  let monsantoUserData = {
    dataValues: { username, password },
    growerLookup,
  };

  if (growerLookup) {
    const apiseedcompanyData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });
    if (apiseedcompanyData) {
      const payloadData = {
        technologyId: apiseedcompanyData.dataValues.technologyId,
        name: apiseedcompanyData.dataValues.name,
      };
      monsantoUserData['apiseedcompany'] = payloadData;
      monsantoUserData['dataValues'] = {
        username: apiseedcompanyData.dataValues.username,
        password: apiseedcompanyData.dataValues.password,
      };
    } else {
      return res.status(500).json({ error: 'No Bayer compnay found' });
    }
  }

  return buildGrowerLicenseRequest({ technologyId, bayerGlnID, isGlnId, name, monsantoUserData })
    .then((growerLicenseRequest) => {
      return request.post(config.monsantoEndPoint, {
        'content-type': 'text/plain',
        body: growerLicenseRequest,
      });
    })
    .then(parseXmlStringPromise)
    .then(parseGrowerLicenseResponse)
    .then((response) => {
      if (growerLookup) {
        Customer.findOne({ where: { id: customerId, isArchive: false } }).then(async (customer) => {
          await customer.update({
            monsantoTechnologyId: response.licences[0].shipTo.identifiers.find((p) => p.agency == 'AssignedBySeller')
              .id,
            glnId: response.licences[0].shipTo.identifiers.find((p) => p.agency == 'GLN').id,
          });
        });
      }

      monsantoReqLogCreator({
        req,
        userName: req.body.name,
        type: 'grower licence check',
        uuid: response.licences[0].uuid,
      });
      res.json(response);
    })
    .catch(async (error) => {
      if (error.response) {
        const errorXmL = await parseXmlStringPromise(error.response.body);
        const data = parseGrowerLicenseError(errorXmL);
        res.status(500).json({ error: data });
      } else {
        console.log('error in checkInOrder.....: ', error);
        res.status(500).json({ error: 'Something went wrong!' });
      }
    });

  //   const content = `<?xml version="1.0" encoding="UTF-8"?>
  //        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  //           <soapenv:Header/>
  //           <soapenv:Body>
  //              <ag:outboundData xmlns:ag="urn:aggateway:names:ws:docexchange">
  //                 <ag:processStep>AgreementStatusRequest-API</ag:processStep>
  //                 <ag:messageId>d97d3a48-51f4-4829-a44f-abc5b7c390be</ag:messageId>
  //                 <ag:xmlPayload>
  //                    <AgreementStatusResponse xmlns="urn:cidx:names:specification:ces:schema:all:5:3">
  //                       <Header>
  //                          <ThisDocumentIdentifier>
  //                             <DocumentIdentifier>014fafec-fb18-478f-aaf4-ba3351b6e03b</DocumentIdentifier>
  //                          </ThisDocumentIdentifier>
  //                          <ThisDocumentDateTime>
  //                             <DateTime DateTimeQualifier="On">2021-09-15T05:03:01-05:00</DateTime>
  //                          </ThisDocumentDateTime>
  //                          <From>
  //                             <PartnerInformation>
  //                                <PartnerName>MONSANTO AGRICULTURAL CO</PartnerName>
  //                                <PartnerIdentifier Agency="GLN">1100027565809</PartnerIdentifier>
  //                                <PartnerIdentifier Agency="AssignedBySeller">482544</PartnerIdentifier>
  //                             </PartnerInformation>
  //                          </From>
  //                          <To>
  //                             <PartnerInformation>
  //                                <PartnerName>Sourabh Chakraborty</PartnerName>
  //                                <PartnerIdentifier Agency="GLN">1100032937530</PartnerIdentifier>
  //                                <PartnerIdentifier Agency="AssignedBySeller">50835965</PartnerIdentifier>
  //                                <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
  //                             </PartnerInformation>
  //                          </To>
  //                       </Header>
  //                       <AgreementStatusResponseBody>
  //                          <AgreementStatusResponsePartners>
  //                             <Buyer>
  //                                <PartnerInformation>
  //                                   <PartnerName>Sourabh Chakraborty</PartnerName>
  //                                   <PartnerIdentifier Agency="GLN">1100032937530</PartnerIdentifier>
  //                                   <PartnerIdentifier Agency="AssignedBySeller">50835965</PartnerIdentifier>
  //                                   <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
  //                                </PartnerInformation>
  //                             </Buyer>
  //                             <Seller>
  //                                <PartnerInformation>
  //                                   <PartnerName>MONSANTO AGRICULTURAL CO</PartnerName>
  //                                   <PartnerIdentifier Agency="GLN">1100027565809</PartnerIdentifier>
  //                                   <PartnerIdentifier Agency="AssignedBySeller">482544</PartnerIdentifier>
  //                                </PartnerInformation>
  //                             </Seller>
  //                             <ShipTo>
  //                                <PartnerInformation>
  //                                   <PartnerName>Sourabh Chakraborty</PartnerName>
  //                                   <PartnerIdentifier Agency="GLN">1100032937530</PartnerIdentifier>
  //                                   <PartnerIdentifier Agency="AssignedBySeller">50835965</PartnerIdentifier>
  //                                   <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
  //                                </PartnerInformation>
  //                             </ShipTo>
  //                          </AgreementStatusResponsePartners>
  //                          <AgreementStatusResponseProperties>

  //                             <AgreementStatusList>
  //                                <LicenseNumber>50835965</LicenseNumber>
  //                                <AgreementName>MTA2</AgreementName>
  //                                <AgreementStatus>Licensed</AgreementStatus>
  //                                <Zone>
  //                                   <ProductClassification>GLN</ProductClassification>
  //                                   <ProductDescription>SOYBEAN</ProductDescription>
  //                                   <ZoneID>S2</ZoneID>
  //                                   <ZoneType>Soybean Pricing Zones</ZoneType>
  //                                   <ZoneName>No Zone</ZoneName>
  //                                </Zone>
  //                             </AgreementStatusList>
  //                             <AgreementStatusList>
  //                                <LicenseNumber>50835965</LicenseNumber>
  //                                <AgreementName>MTA2</AgreementName>
  //                                <AgreementStatus>Licensed</AgreementStatus>
  //                                <Zone>
  //                                   <ProductClassification>GLN</ProductClassification>
  //                                   <ProductDescription>ALFALFA</ProductDescription>
  //                                   <ZoneID>AE</ZoneID>
  //                                   <ZoneType>Roundup Ready Alfalfa Pricing Zones 2016,2017,2018,2019,2020,2021 and 2022</ZoneType>
  //                                   <ZoneName>East</ZoneName>
  //                                </Zone>
  //                             </AgreementStatusList>
  //                             <AgreementStatusList>
  //                                <LicenseNumber>50835965</LicenseNumber>
  //                                <AgreementName>MTA2</AgreementName>
  //                                <AgreementStatus>Licensed</AgreementStatus>
  //                                <Zone>
  //                                   <ProductClassification>IC</ProductClassification>
  //                                   <ProductDescription>CORN</ProductDescription>
  //                                   <ZoneID>AB</ZoneID>
  //                                   <ZoneType>Corn Rootworm Zones 2014, 2015, 2016, and 2017</ZoneType>
  //                                   <ZoneName>Zone 12</ZoneName>
  //                                </Zone>
  //                             </AgreementStatusList>

  //                          </AgreementStatusResponseProperties>
  //                       </AgreementStatusResponseBody>
  //                    </AgreementStatusResponse>
  //                 </ag:xmlPayload>
  //              </ag:outboundData>
  //           </soapenv:Body>
  //        </soapenv:Envelope>`;

  //   const parsedXML = await parseXmlStringPromise(content);
  //   const jsonResponse = await parseGrowerLicenseResponse(parsedXML);
  //   return res.json(jsonResponse);
};

module.exports.addGrower = async (req, res) => {
  console.log(req.body, '-----licence get');
  let monsantoUserData = {
    dataValues: { username: '', password: '' },
    growerLookup: true,
  };
  if (true) {
    const apiseedcompanyData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });
    if (apiseedcompanyData) {
      const payloadData = {
        technologyId: apiseedcompanyData.dataValues.technologyId,
        name: apiseedcompanyData.dataValues.name,
      };
      monsantoUserData['apiseedcompany'] = payloadData;
      monsantoUserData['dataValues'] = {
        username: apiseedcompanyData.dataValues.username,
        password: apiseedcompanyData.dataValues.password,
      };
    } else {
      return res.status(500).json({ error: 'No Bayer compnay found' });
    }
  }
  const info = req.body;
  return buildAddGrowerLicenseRequest({ monsantoUserData, info })
    .then((growerLicenseRequest) => {
      return request.post(config.monsantoEndPoint, {
        'content-type': 'text/plain',
        body: growerLicenseRequest,
      });
    })
    .then(parseXmlStringPromise)
    .then(parseAddGrowerLicenseResponse)
    .then((response) => {
      res.json(response);
    })
    .catch(async (error) => {
      if (error.response) {
        const errorXmL = await parseXmlStringPromise(error.response.body);
        const data = parseGrowerLicenseError(errorXmL);
        res.status(500).json({ error: data });
      } else {
        console.log('error in checkInOrder.....: ', error);
        res.status(500).json({ error: 'Something went wrong!' });
      }
    });
};
