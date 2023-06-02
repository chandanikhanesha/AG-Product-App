const xmlBuilder = require('xmlbuilder');
const {
  buildMonsantoRequest,
  buildXmlPayloadHeader,
  getPartnerId,
  calculateSeedYear,
  parseXmlStringPromise,
} = require('./common');

const config = require('config').getConfig();
const bayerAPIDown = process.env.IS_BAYER_API_DOWN;
const fs = require('fs');
const path = require('path');

const convertProductDescriptionToProps = (description, classification) => {
  const props = {};
  const seedType = {
    C: 'CORN',
    S: 'SORGHUM',
    B: 'SOYBEAN',
  };
  let name = description.split('\n')[0].split('(')[0];
  let split = name.split(' ');
  props.blend = split[0]; //variety
  //note: 'AG28X7 RR2X 140M UNTR(BAG)', doesn't have brand
  let isRegularSoybean;
  if (split.length > 1) {
    isRegularSoybean = seedType[classification] === 'SOYBEAN' && split[2].match(/[0-9]{2,3}(SCU_)?MB?$/);
  }
  switch (seedType[classification]) {
    case 'CORN':
      if (props.blend.includes('RIB')) {
        props.seedSize = split[1];
        props.brand = split[2]; //trait
        props.treatment = split[4];
        props.packaging = split[3];
      } else {
        props.seedSize = split[1];
        props.brand = 'Conventional';
        // props.treatment = split[3];
        // props.packaging = split[2];
        props.treatment = split[4];
        props.packaging = split[3];
      }
      break;
    case 'SORGHUM':
      props.seedSize = split[1];
      props.packaging = split[1];
      props.treatment = split[2];
      break;
    case 'SOYBEAN': {
      if (isRegularSoybean) {
        props.brand = split[1]; //trait
        props.packaging = split[2];
        props.treatment = split[3];
      } else {
        // props.brand = split[1];  //trait
        props.packaging = split[1];
        props.treatment = split[2];
      }
      break;
    }
    default:
      return {};
  }
  return props;
};

const buildPriceSheetRequest = async ({
  user,
  cropType,
  zoneId,
  lastRequest,
  seedDealerMonsantoId,
  monsantoUserData,
}) => {
  if (!seedDealerMonsantoId) throw new Error('Monsanto Seed Dealer ID must be provided');

  const currentOrganizationInfo = user && (await user.getOrganizationInfo());

  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'PriceSheetWS',
    processStep: 'PriceSheetRequest',
    partnerId: seedDealerMonsantoId.trim(),
    partnerType: 'AGIIS-EBID',
    monsantoUserData,
  });
  xmlPayload
    .ele('mon:PriceSheetRequest', {
      'xmlns:cidx': 'urn:cidx:names:specification:ces:schema:all:5:1:1',
      'xmlns:mon': 'urn:mon:pricesheetrequest:5:1:1',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    })
    .importDocument(
      buildXmlPayloadHeader({
        nameSpace: 'cidx',
        params: {
          from: {
            inverse: true,
            agency: 'AGIIS-EBID',
            name: currentOrganizationInfo.name,
            identifier: seedDealerMonsantoId.trim(),
            seedYear: calculateSeedYear(), //TODO: ask
            dataSource: 'WS-XML',
            softwareName: 'AgriDealer',
            SoftwareVersion: process.env.SOFTWARE_VERSION,
          },
          to: {
            agency: 'AGIIS-EBID',
            name: 'MONSANTO COMPANY',
            identifier: MONSANTO_TECH_ID,
          },
        },
      }),
    )
    .importDocument(
      buildPriceSheetRequestBody({
        cropType,
        zoneId,
        lastRequest,
        buyer: {
          name: currentOrganizationInfo.name, //currentOrganizationInfo.name,
          identifier: seedDealerMonsantoId.trim(),
        },
      }),
    );
  return xmlPayload.end({ pretty: true });
};

const buildPriceSheetRequestBody = ({ cropType, zoneId, lastRequest, buyer }) => {
  const body = xmlBuilder.create('mon:PriceSheetRequestBody');
  body.importDocument(buildPriceSheetRequestProperties({ cropType, zoneId, lastRequest }));
  body.importDocument(buildPriceSheetRequestPartners({ buyer }));
  return body;
};

const buildPriceSheetRequestProperties = ({ cropType, zoneId, lastRequest }) => {
  return xmlBuilder
    .create('mon:PriceSheetRequestProperties')
    .ele({
      'cidx:CurrencyCode': {
        '@Domain': 'ISO-4217',
        '#text': 'USD',
      },
    })
    .insertAfter({
      'cidx:LanguageCode': {
        '@Domain': 'ISO-639-2T',
        '#text': 'eng',
      },
    })
    .insertAfter({
      'mon:LastRequestDate': {
        'cidx:DateTime': {
          '@DateTimeQualifier': 'On',
          '#text': lastRequest,
        },
      },
    })
    .insertAfter({
      'cidx:ZoneID': {
        '#text': zoneId,
      },
    })
    .insertAfter({
      'cidx:ProductClassification': {
        '#text': cropType,
      },
    });
};

const buildPriceSheetRequestPartners = ({ buyer }) => {
  return xmlBuilder
    .create('mon:PriceSheetRequestPartners')
    .ele('cidx:Buyer')
    .ele({
      'cidx:PartnerInformation': {
        'cidx:PartnerName': buyer.name,
        'cidx:PartnerIdentifier': {
          '@Agency': 'AGIIS-EBID',
          '#text': buyer.identifier,
        },
      },
    });
};

// TODO: move this to common
const getDate = (obj, nameSpace) => {
  let prefix = nameSpace ? `${nameSpace}:` : '';
  return obj[`${prefix}DateTimeInformation`][0][`${prefix}DateTime`][0]['-'];
};

const getDateTimeRange = (obj, nameSpace) => {
  const prefix = nameSpace ? `${nameSpace}:` : '';
  const timeRange = obj[`${prefix}DateTimeInformation`][0][`${prefix}DateTimeRange`][0];
  return {
    from: timeRange[`${prefix}FromDateTime`][0],
    to: timeRange[`${prefix}ToDateTime`][0],
  };
};

const getProductIdentifier = (product) => product['ns2:ProductIdentification'][0]['ns2:ProductIdentifier'][0];

const getProductDescription = (product) => product['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0];

const getProductClassification = (product) => product['ns2:ProductIdentification'][0]['ns2:ProductClassification'][0];

const getAgiisProductInformation = (products) =>
  products.find((info) => getProductIdentifier(info)['$']['Agency'].match(/^AGIIS-.*$/));

const getEffectiveDate = (priceApplicabilityCriteria) => {
  const effectiveDate = priceApplicabilityCriteria['ns2:OrderFeatures'][0]['ns2:PriceSheetEffectiveDate'][0];
  return getDateTimeRange(effectiveDate, 'ns2');
};

const getZoneIds = (priceApplicabilityCriteria) =>
  priceApplicabilityCriteria['ns2:GeographicFeatures'].map((feature) => {
    return feature['ns2:Location'][0]['ns2:ZoneID'] !== undefined
      ? feature['ns2:Location'][0]['ns2:ZoneID'][0]
      : feature['ns2:Location'][0].ZoneID;
  });

const getProductPrice = (product) => {
  const perUnit = product['ns2:PricingPerUnit'][0];
  const currencyData = perUnit['ns2:MonetaryAmount'][0]['ns2:CurrencyCode'][0];
  const measurement = perUnit['ns2:PriceBasis'][0]['ns2:Measurement'][0];
  const measurementUnitData = measurement['ns2:UnitOfMeasureCode'][0];
  return {
    monetaryValue: perUnit['ns2:MonetaryAmount'][0]['ns2:MonetaryValue'][0],
    currencyCode: {
      value: currencyData['_'],
      domain: currencyData['$']['Domain'],
    },
    measurementValue: measurement['ns2:MeasurementValue'][0],
    measurementCode: {
      value: measurementUnitData['_'],
      domain: measurementUnitData['$']['Domain'],
    },
  };
};

const getProductPrices = (prices) => {
  const findByType = (price, type) => price['$']['PriceType'] === type;
  const retailerPrice = getProductPrice(prices.find((price) => findByType(price, 'SuggestedDealerOrRetailerPrice')));
  const endUserPrice = getProductPrice(prices.find((price) => findByType(price, 'SuggestedGrowerOrEndUserPrice')));
  return {
    suggestedDealerPrice: retailerPrice.monetaryValue,
    suggestedDealerCurrencyCode: retailerPrice.currencyCode,
    suggestedDealerMeasurementValue: retailerPrice.measurementValue,
    suggestedDealerMeasurementUnitCode: retailerPrice.measurementCode,
    suggestedEndUserPrice: endUserPrice.monetaryValue,
    suggestedEndUserCurrencyCode: endUserPrice.currencyCode,
    suggestedEndUserMeasurementValue: endUserPrice.measurementValue,
    suggestedEndUserMeasurementUnitCode: endUserPrice.measurementCode,
  };
};

const parsePriceSheetProduct = (rawProduct) => {
  const productInformationList = rawProduct['ns2:ProductInformation'];
  const priceApplicabilityCriteria = rawProduct['ns2:PriceSheetPriceData'][0]['ns2:PriceApplicabilityCriteria'][0];
  const pricesData = getProductPrices(rawProduct['ns2:PriceSheetPriceData'][0]['ns2:ListPrice'][0]['ns2:Pricing']);

  const agiisProductInformation = getAgiisProductInformation(productInformationList);
  const classification = getProductClassification(agiisProductInformation);
  let packaging = '',
    seedSize = 'SP50',
    brand = '',
    blend = '',
    treatment = 'Basic';
  rawProduct['ns2:PriceSheetPriceData'][0]['ns2:PriceApplicabilityCriteria'][0]['ns2:ProductFeatures'][0][
    'ns2:ProductAttribute'
  ].map((data) => {
    if (data['ns2:ProductAttributeName'][0]['_'] === 'TRAITDESCRIPTION') {
      brand = data['ns2:ProductAttributeValue'][0];
    }
    if (data['ns2:ProductAttributeName'][0]['_'] === 'ACRONYMNAME') {
      blend = data['ns2:ProductAttributeValue'][0];
    }
    if (data['ns2:ProductAttributeName'][0]['_'] === 'TREATMENTDESCRIPTION') {
      treatment = data['ns2:ProductAttributeValue'][0];
    }
    if (data['ns2:ProductAttributeName'][0]['_'] === 'GRADESIZE') {
      seedSize = data['ns2:ProductAttributeValue'][0];
    }
    // if (data["ProductAttributeName"][0]["_"] === "BASEUOM") {
    //   packaging = data["ProductAttributeValue"][0];
    // }
    if (classification === 'C') {
      if (agiisProductInformation['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0].includes('80M')) {
        packaging = '80M';
      } else if (
        agiisProductInformation['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0].includes('SP45')
      ) {
        packaging = 'SP45';
      } else if (
        agiisProductInformation['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0].includes('SP40')
      ) {
        packaging = 'SP40';
      } else {
        packaging = 'SP50';
      }
    } else if (classification === 'S') {
      if (agiisProductInformation['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0].includes('50#')) {
        packaging = '50#';
      } else {
        packaging = 'SP50U';
      }
    } else if (classification === 'L') {
      if (agiisProductInformation['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0].includes('4250M')) {
        packaging = '4250M';
      } else {
        packaging = '30SCUSP';
      }
    } else if (classification === 'B') {
      if (agiisProductInformation['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0].includes('140M')) {
        packaging = '140M';
      } else if (
        agiisProductInformation['ns2:ProductIdentification'][0]['ns2:ProductDescription'][0].includes('40SCUMB')
      ) {
        packaging = '40SCUMB';
      } else {
        packaging = 'SC-BULK-FG';
      }
    } else if (classification === 'A') {
      packaging = '50#';
    }
  });
  return {
    lineNumber: rawProduct['ns2:LineNumber'][0],
    crossReferenceProductId: getProductIdentifier(agiisProductInformation)['_'],
    product: {
      classification,
      AgiisId: getProductIdentifier(agiisProductInformation)['_'],
      productDetail: getProductDescription(agiisProductInformation),
      // ...convertProductDescriptionToProps(
      //   getProductDescription(agiisProductInformation),
      //   classification
      // ),
      packaging,
      seedSize,
      brand,
      blend,
      treatment,
      zoneId: getZoneIds(priceApplicabilityCriteria),
    },
    effectiveFrom: getEffectiveDate(priceApplicabilityCriteria).from,
    effectiveTo: getEffectiveDate(priceApplicabilityCriteria).to,
    zoneId: getZoneIds(priceApplicabilityCriteria),
    ...pricesData,
  };
};

const parsePriceSheetResponse = async (rawResponse, cropType) => {
  const hardCodeXml =
    cropType &&
    fs.readFileSync(path.join(__dirname, `../xmlResponse/pricesheet(${cropType}).xml`), {
      encoding: 'utf8',
    });

  const hardCodeResponse = await parseXmlStringPromise(hardCodeXml);
  const rawResponseData = bayerAPIDown === 'true' ? hardCodeResponse : rawResponse;

  let envelope = rawResponseData.response
    ? rawResponseData.response['soapenv:Envelope']
    : rawResponseData['soapenv:Envelope'];

  if (envelope !== undefined && envelope['S:Body']) {
    const errorMessage =
      envelope['S:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0]['S:Fault'][0]['faultstring'][0];
    if (errorMessage == 'No Data Found') {
      return { productLineItems: [] };
    }
    throw new Error(errorMessage);
  }

  let envBody = envelope['soapenv:Body'] !== undefined ? envelope['soapenv:Body'][0] : envelope[0]['soapenv:Body'][0];

  if (envBody['ag:outboundData']) {
    envBody = envBody['ag:outboundData'][0]['ag:xmlPayload'][0]['soapenv:Envelope'][0]['soapenv:Body'][0];
  }
  const payload = envBody['urn:outboundData'][0]['urn:xmlPayload'][0];
  const $priceSheet = payload['ns2:PriceSheet'][0]['ns2:PriceSheetBody'][0];
  const $priceSheetProperties = $priceSheet['ns2:PriceSheetProperties'][0];
  const $priceSheetInformation = $priceSheetProperties['ns2:PriceSheetInformation'][0];
  const $priceSheetPartners = $priceSheet['ns2:PriceSheetPartners'][0];
  const $priceSheetDetails = $priceSheet['ns2:PriceSheetDetails'][0];
  const $priceSheetProducts = $priceSheetDetails['ns2:PriceSheetProductLineItem'];

  return {
    identifier: $priceSheetInformation['ns2:PriceSheetIdentifier'][0],
    specialInstructions: $priceSheetProperties['ns2:SpecialInstructions'][0]['_'],
    currencyCode: $priceSheetProperties['ns2:CurrencyCode'][0],
    description: $priceSheetInformation['ns2:PriceSheetDescription'][0],
    effectiveDate: getDate($priceSheetInformation['ns2:PriceSheetEffectiveDate'][0], 'ns2'),
    buyerMonsantoId: getPartnerId($priceSheetPartners['ns2:Buyer'][0], 'ns2'),
    sellerMonsantoId: getPartnerId($priceSheetPartners['ns2:Seller'][0], 'ns2'), // Monsanto ID
    ZoneIds:
      $priceSheetDetails['ns2:PriceZoneGeographyList'][0]['ns2:PriceZoneGeography'][0]['ns2:PriceZone'][0][
        'ns2:ZoneID'
      ],
    productLineItems: $priceSheetProducts.length > 0 ? $priceSheetProducts.map(parsePriceSheetProduct) : [],
  };
};

module.exports = {
  convertProductDescriptionToProps,
  buildPriceSheetRequest,
  parsePriceSheetResponse,
};
