const xmlBuilder = require('xmlbuilder');
const config = require('config').getConfig();
const { parseString } = require('xml2js');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const _ = require('lodash');

const parseXmlStringPromise = (xmlString) =>
  new Promise((resolve, reject) => {
    return parseString(xmlString, function (err, result) {
      if (err) return reject(err);
      resolve(result);
    });
  });

const parseRetailOrderSummaryError = (errorResponse) => {
  const envelope = errorResponse['soapenv:Envelope'];
  if (envelope['soapenv:Body']) {
    const errorMessage = envelope['soapenv:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:reason'][0];
    if (errorMessage === 'No data found') {
      return `No data found`;
    }
  }
};

const parseMainProductBookingError = (errorResponse) => {
  const envelope = errorResponse['soapenv:Envelope'];
  let errorMessage = '';
  if (envelope['soapenv:Body']) {
    if (
      envelope['soapenv:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:details'] &&
      envelope['soapenv:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:details'][0][
        'err:WebServiceSecurityFault'
      ]
    ) {
      errorMessage =
        envelope['soapenv:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:details'][0][
          'err:WebServiceSecurityFault'
        ][0]['err:faultstring'][0];
    } else {
      errorMessage = envelope['soapenv:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:reason'][0];
    }
    return errorMessage;
  }
};

const parseShipNoticeError = (errorResponse) => {
  const envelope = errorResponse['soapenv:Envelope'];
  let errorMessage = '';
  if (envelope['soapenv:Body']) {
    if (envelope['soapenv:Body'][0]['soapenv:Fault'][0]['faultstring'][0]) {
      errorMessage = envelope['soapenv:Body'][0]['soapenv:Fault'][0]['faultstring'][0];
    } else {
      errorMessage = envelope['soapenv:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:reason'][0];
    }
    return errorMessage;
  }
};

const parseGrowerLicenseError = (errorResponse) => {
  const envelope = errorResponse['soapenv:Envelope'];
  let errorMessage = '';
  if (envelope['soapenv:Body']) {
    errorMessage = envelope['soapenv:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0];
  }
  return errorMessage;
};

const normalizeNodeNamespace = (nodeName, nameSpace) => {
  if (!nameSpace) return nodeName;
  return `${nameSpace}:${nodeName}`;
};

const buildXMLRequestHeader = (isProcutBooking, monsantoUserData) => {
  const header = xmlBuilder.create('soapenv:Header');
  if (isProcutBooking) {
    header
      .ele('wsse:Security', {
        'xmlns:wsse': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
      })
      .ele('wsse:UsernameToken', {
        'xmlns:wsu': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd',
        'wsu:Id': 'UsernameToken-BAFF8E68A8D786C41314389777816581', // TODO: ADD real token here
      })
      .ele({ 'wsse:Username': { '#text': monsantoUserData.dataValues.username } })
      .insertAfter('wsse:Password', {
        Type: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText',
      })
      .raw(monsantoUserData.dataValues.password);
  } else {
    header
      .ele('wsse:Security', {
        'soapenv:mustUnderstand': 1,
        'xmlns:wsse': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
        'xmlns:wsu': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd',
      })
      .ele('wsse:UsernameToken', {
        'wsu:Id': 'UsernameToken-3', // TODO: ADD real token here
      })
      .ele({
        'wsse:Username': {
          '#text':
            Object.keys(monsantoUserData).length > 0 ? monsantoUserData.dataValues.username : config.monsantoUser,
        },
      })
      .insertAfter('wsse:Password', {
        type: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText',
      })
      .raw(Object.keys(monsantoUserData).length > 0 ? monsantoUserData.dataValues.password : config.monsantoPassword);
  }
  return header;
};

const buildXMLRequestEnvelope = async (rootAttributes, useURN1, isProcutBooking, monsantoUserData, isDealerUpdate) => {
  const root = xmlBuilder.create('soapenv:Envelope', {
    version: '1.0',
    encoding: 'UTF-8',
  });
  Object.keys(rootAttributes).forEach((key) => root.att(key, rootAttributes[key]));

  if (isDealerUpdate) {
    root.att('xmlns:soapenv', 'http://schemas.xmlsoap.org/soap/envelope/');
  } else {
    if (useURN1) {
      root.att('xmlns:urn1', 'urn:cidx:names:specification:ces:schema:all:5:3'); // seemsonly for productbooking)
    }

    root.att('xmlns:urn', 'urn:aggateway:names:ws:docexchange');
    root.att('xmlns:soapenv', 'http://schemas.xmlsoap.org/soap/envelope/');
  }

  root.importDocument(buildXMLRequestHeader(isProcutBooking, monsantoUserData));

  return isDealerUpdate
    ? root.ele('soapenv:Body').ele('inboundData', {
        xmlns: 'urn:aggateway:names:ws:docexchange',
      })
    : root.ele('soapenv:Body').ele('urn:inboundData');
};

const buildMonsantoRequest = async (params) => {
  const {
    rootAttributes = {},
    businessProcess,
    processStep,
    partnerId,
    partnerType,
    messageId,
    conversationId,
    monsantoUserData,
    isDealerUpdate,
  } = params;
  const body = await buildXMLRequestEnvelope(
    rootAttributes,
    params.useURN1,
    params.isProcutBooking,
    monsantoUserData,
    isDealerUpdate,
  );
  const bodyMetadata = isDealerUpdate
    ? await body.ele({
        businessProcess: businessProcess,
        processStep: processStep,
        partnerId: partnerId,
        partnerType: partnerType,
        conversationId: conversationId,
        messageId: messageId,
      })
    : await body.ele({
        'urn:businessProcess': businessProcess,
        'urn:processStep': processStep,
        'urn:partnerId': partnerId,
        'urn:partnerType': partnerType,
        'urn:conversationId': conversationId,
        // "urn:messageId": messageId
      });
  const xmlPayload = (await isDealerUpdate)
    ? bodyMetadata.insertBefore('xmlPayload')
    : bodyMetadata.insertBefore('urn:xmlPayload');
  return {
    xmlPayload,
    body,
  };

  // .end({pretty: true});
};

const buildContactInformation = ({ nameSpace, name = '', description = '' }) => {
  const _normalizeNodeNamespace = (node) => normalizeNodeNamespace(node, nameSpace);
  const contactInformationNode = xmlBuilder.create(_normalizeNodeNamespace('ContactInformation'));

  contactInformationNode
    .ele(normalizeNodeNamespace('ContactName', nameSpace))
    .raw(name)
    .insertAfter(normalizeNodeNamespace('ContactDescription', nameSpace))
    .raw(description);

  return contactInformationNode;
};

const buildPartnerInformation = ({ nameSpace, partnerInformation = {} }) => {
  const _normalizeNodeNamespace = (node) => normalizeNodeNamespace(node, nameSpace);
  const {
    name = '',
    identifier,
    agency,
    seedYear,
    dataSource,
    softwareName,
    softwareVersion,
    inverse,
  } = partnerInformation;
  const partnerInformationNode = xmlBuilder.create(_normalizeNodeNamespace('PartnerInformation'));

  partnerInformationNode
    .ele(_normalizeNodeNamespace('PartnerName'))
    .raw(name)
    .insertAfter(_normalizeNodeNamespace('PartnerIdentifier'), {
      Agency: agency,
    })
    .raw(identifier);

  // some requests invert name and description for some reason (Retail order summaro for example)

  if (seedYear) {
    const name = inverse ? seedYear : '2021';
    const description = 'SeedYear';
    partnerInformationNode.importDocument(
      buildContactInformation({
        nameSpace,
        name,
        description,
      }),
    );
  }
  if (dataSource) {
    const name = inverse ? dataSource : 'WS-XML';
    const description = 'DataSource';
    partnerInformationNode.importDocument(
      buildContactInformation({
        nameSpace,
        name,
        description,
      }),
    );
  }
  if (softwareName) {
    const name = inverse ? softwareName : 'AgriDealer';
    const description = 'SoftwareName';
    partnerInformationNode.importDocument(
      buildContactInformation({
        nameSpace,
        name,
        description,
      }),
    );
  }
  if (softwareVersion) {
    const name = inverse ? softwareVersion : '1.0.0';
    const description = 'SoftwareVersion';
    partnerInformationNode.importDocument(
      buildContactInformation({
        nameSpace,
        name,
        description,
      }),
    );
  }

  return partnerInformationNode;
};

const buildXmlPayloadHeader = ({ params = {}, nameSpace }) => {
  const uuid = uuidv4();

  let x2 = new Date().toISOString();
  const { from, to } = params;
  const _normalizeNodeNamespace = (node) => normalizeNodeNamespace(node, nameSpace);
  const header = xmlBuilder.create(_normalizeNodeNamespace('Header'));
  header
    .ele({
      [_normalizeNodeNamespace('ThisDocumentIdentifier')]: {
        [_normalizeNodeNamespace('DocumentIdentifier')]: {
          // "#text": "TEST-PB_1000"
          '#text': uuid,
        },
      },
    })
    .insertAfter(_normalizeNodeNamespace('ThisDocumentDateTime'))
    .ele(_normalizeNodeNamespace('DateTime'), {
      DateTimeQualifier: 'On',
    })
    // .raw("2019-06-03T02:57:59Z");
    // .raw("2021-04-15T02:57:59Z");
    .raw(x2);

  //partner information
  header
    .ele(_normalizeNodeNamespace('From'))
    .importDocument(buildPartnerInformation({ nameSpace, partnerInformation: from }));
  header
    .ele(_normalizeNodeNamespace('To'))
    .importDocument(buildPartnerInformation({ nameSpace, partnerInformation: to }));

  return header;
};

const getPartnerId = (obj, nameSpace, underscore) => {
  let prefix = nameSpace ? `${nameSpace}:` : '';
  return obj[`${prefix}PartnerInformation`][0][`${prefix}PartnerIdentifier`][0][underscore ? '_' : '-'];
};

const calculateSeedYear = () => {
  const seedYear =
    parseInt(moment().format('M')) > process.env.SEASONMONTH
      ? (new Date().getFullYear() + 1).toString()
      : new Date().getFullYear().toString();

  return seedYear;
};

const parseProductBookingError = (responseStatus = [], details = []) => {
  let orderLavelErrorMsg = [];
  let orderLavelwarningMsg = [];
  let lineItemLavelErrorMsg = [];
  let lineItemLavelwarningMsg = [];
  let isError = false;
  responseStatus.map((item, i) => {
    if (item.identifier === 'E') {
      isError = true;
      i === 0
        ? (orderLavelErrorMsg.push('Purchase Order Level (E Type Error): '), orderLavelErrorMsg.push(item.description))
        : orderLavelErrorMsg.push(item.description);
    }
    if (item.identifier === 'I') {
      i === 0
        ? (orderLavelwarningMsg.push('Purchase Order Level (I Type Warning): '),
          orderLavelwarningMsg.push(item.description))
        : orderLavelwarningMsg.push(item.description);
    }
  });
  details.map((item, i) => {
    item.responseStatus.map((inneritem) => {
      if (inneritem.identifier === 'E') {
        isError = true;
        i === 0
          ? (lineItemLavelErrorMsg.push('Line Item Level (E Type Error): '),
            lineItemLavelErrorMsg.push(`${inneritem.description}(${item.identification.identifier})`))
          : lineItemLavelErrorMsg.push(`${inneritem.description}(${item.identification.identifier})`);
      }
      if (inneritem.identifier === 'I') {
        i === 0
          ? (lineItemLavelwarningMsg.push('Line Item Level (I Type Warning): '),
            lineItemLavelwarningMsg.push(`${inneritem.description}(${item.identification.identifier})`))
          : lineItemLavelwarningMsg.push(`${inneritem.description}(${item.identification.identifier})`);
      }
    });
  });

  const errorMsg =
    orderLavelErrorMsg.join(' ; ') +
    '\n' +
    orderLavelwarningMsg.join(' ; ') +
    '\n' +
    lineItemLavelErrorMsg.join(' ; ') +
    '\n' +
    lineItemLavelwarningMsg.join(' ; ');
  const warningMsg =
    orderLavelwarningMsg.length && lineItemLavelwarningMsg.length
      ? orderLavelwarningMsg.join(' ; ') + '\n' + lineItemLavelwarningMsg.join(' ; ')
      : '';
  console.log(warningMsg);
  return { errorMsg: errorMsg, warningMsg, isError };
};

module.exports = {
  normalizeNodeNamespace,
  buildMonsantoRequest,
  buildXmlPayloadHeader,
  parseXmlStringPromise,
  getPartnerId,
  calculateSeedYear,
  parseProductBookingError,
  parseMainProductBookingError,
  parseRetailOrderSummaryError,
  parseGrowerLicenseError,
  parseShipNoticeError,
};
