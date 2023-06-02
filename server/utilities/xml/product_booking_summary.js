const xmlBuilder = require('xmlbuilder');
const config = require('config').getConfig();
const { buildMonsantoRequest, buildXmlPayloadHeader, calculateSeedYear } = require('./common');

const buildProductBookingSummaryRequest = async ({
  seedDealerMonsantoId,
  organizationName,
  orders,
  monsantoUserData,
  organizationAddress,
  organizationBusinessCity,
  organizationBusinessState,
  organizationBusinessZip,
  isDealerUpdate,
}) => {
  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  const { xmlPayload } = await buildMonsantoRequest({
    businessProcess: 'ProductBookingWS53',
    processStep: 'ProductBookingWSRequest',
    partnerId: seedDealerMonsantoId.trim(),
    partnerType: 'AGIIS-EBID',
    messageId: 'Test-ProductBooking5.3-1',
    useURN1: 'urn:cidx:names:specification:ces:schema:all:5:3',
    isProcutBooking: true,
    monsantoUserData,
    isDealerUpdate,
  });

  const body = xmlPayload
    .ele(
      'ProductBooking',
      isDealerUpdate
        ? {
            xmlns: 'urn:cidx:names:specification:ces:schema:all:5.4.0',
            Version: '5.4.0',
          }
        : {
            'xsi:schemaLocation': 'urn:cidx:names:specification:ces:schema:all:5:3',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            xmlns: 'urn:cidx:names:specification:ces:schema:all:5:3',
          },
    )
    .importDocument(
      buildXmlPayloadHeader({
        nameSpace: '',
        params: {
          from: {
            inverse: true,
            agency: isDealerUpdate ? 'GLN' : 'AGIIS-EBID',
            name: organizationName, //organizationName,
            identifier: seedDealerMonsantoId,
            dataSource: 'WS-XML',
            seedYear: calculateSeedYear(),
            softwareName: 'AgriDealer',
            softwareVersion: process.env.SOFTWARE_VERSION || '3.0.0',
          },
          to: {
            agency: isDealerUpdate ? 'GLN' : 'AGIIS-EBID',
            name: 'Bayer Crop Science',
            identifier: MONSANTO_TECH_ID,
          },
        },
      }),
    );

  const buildProductBookingSummaryRequestBodyPromises = orders.map((order) => {
    return buildProductBookingSummaryRequestBody({
      ...order,
      buyer: {
        name: organizationName,
        identifier: seedDealerMonsantoId,
        AddressInformation: {
          AddressLine: organizationAddress,
          CityName: organizationBusinessCity,
          StateOrProvince: organizationBusinessState,
          PostalCode: organizationBusinessZip,
          PostalCountry: 'US',
        },
      },
      seller: {
        name: 'Bayer Crop Science',
        identifier: MONSANTO_TECH_ID,
      },
      shipTo: {
        name: order.shipTo.name,
        identifier: order.shipTo.identifier,
        agency: order.shipTo.agency ? order.shipTo.agency : 'GLN',
        AddressInformation: {
          AddressLine: order.shipTo.addressInformation.address,
          CityName: order.shipTo.addressInformation.city,
          StateOrProvince: order.shipTo.addressInformation.state,
          PostalCode: order.shipTo.addressInformation.postalCode,
          PostalCountry: order.shipTo.addressInformation.postalCountry || 'US',
        },
      },
    });
  });

  const bodies = await Promise.all(buildProductBookingSummaryRequestBodyPromises);

  bodies.forEach((_body) => body.importDocument(_body));

  return xmlPayload.end({ pretty: true });
};

const buildProductBookingSummaryRequestBody = async (orderInfo) => {
  const {
    orderNumber,
    orderType,
    orderReference,
    productYear = calculateSeedYear(),
    directShip,
    specialInstructions,
    issuedDate,
    shipTo, //ask
    soldTo,
    payer, //ask
    buyer,
    seller,
    products,
  } = orderInfo;

  const body = xmlBuilder.create('ProductBookingBody');
  body.importDocument(
    await buildProductBookingSummaryRequestProperties({
      orderNumber,
      orderType,
      orderReference,
      productYear,
      directShip,
      specialInstructions,
      issuedDate,
    }),
  );
  body.importDocument(buildProductBookingSummaryRequestPartners({ buyer, seller, shipTo, soldTo, payer, orderType }));
  if (orderType !== 'SummaryRequest') {
    body.importDocument(await buildProductBookingSummaryRequestDetails(orderType, products));
  }
  return body;
};

const buildProductBookingSummaryRequestProperties = async (properties) => {
  const { orderNumber, orderType, orderReference, productYear, directShip, specialInstructions, issuedDate } =
    properties;

  const propertiesXMLObj = xmlBuilder.create('ProductBookingProperties');

  propertiesXMLObj.ele({
    ProductBookingType: orderType,
  });

  propertiesXMLObj.ele({
    ProductBookingOrderNumber: orderNumber || '999999',
  });

  propertiesXMLObj.ele({
    ProductBookingOrderTypeCode: {
      '@Domain': 'ANSI-ASC-X12-92',
      '#text': 'KB',
    },
  });

  if (issuedDate) {
    propertiesXMLObj.ele({
      ProductBookingOrderIssuedDate: {
        DateTime: {
          '@DateTimeQualifier': 'On',
          '#text': issuedDate,
        },
      },
    });
  }

  propertiesXMLObj.ele({
    LanguageCode: {
      '@Domain': 'ISO-639-2T',
      '#text': 'EN',
    },
  });
  propertiesXMLObj.ele({
    CurrencyCode: {
      '@Domain': 'ISO-4217',
      '#text': 'USD',
    },
  });

  propertiesXMLObj.ele({
    BuyerSequenceNumber: 1,
  });

  propertiesXMLObj.ele({
    SoftwareInformation: {
      SoftwareSource: 'AgriDealer',
      SoftwareVersion: process.env.SOFTWARE_VERSION || '3.0.0',
    },
  });

  if (productYear) {
    propertiesXMLObj.ele({
      ProductYear: productYear,
    });
  }

  propertiesXMLObj.ele({
    ReferenceInformation: {
      '@ReferenceType': 'SalesOrderReference',
      DocumentReference: {
        DocumentIdentifier: orderReference || '9999999999',
      },
    },
  });

  if (specialInstructions !== undefined) {
    propertiesXMLObj.ele({
      SpecialInstructions: {
        '@InstructionType': specialInstructions.type,
        '#text': specialInstructions.content,
      },
    });
  }
  propertiesXMLObj.ele({
    DirectShipFlag: directShip ? 1 : 0,
  });

  return propertiesXMLObj;
};

const buildProductBookingSummaryRequestPartners = ({
  buyer,
  seller,
  shipTo,
  soldTo = buyer,
  payer = buyer,
  orderType,
}) => {
  const agency = orderType === 'DealerOrderUpdate' ? 'GLN' : 'AGIIS-EBID';
  const partners = xmlBuilder
    .create('ProductBookingPartners')
    .importDocument(buildProductBookingSummaryRequestPartner({ type: 'Buyer', ...buyer, agency: agency }))
    .importDocument(buildProductBookingSummaryRequestPartner({ type: 'Seller', ...seller, agency: agency }));

  if (shipTo) {
    partners.importDocument(
      buildProductBookingSummaryRequestPartner({
        type: 'ShipTo',
        ...shipTo,
        // agency: 'GLN',
      }),
    );
  }

  partners.importDocument(buildProductBookingSummaryRequestPartner({ type: 'SoldTo', ...soldTo, agency: agency }));

  partners.importDocument(buildProductBookingSummaryRequestPartner({ type: 'Payer', ...payer, agency: agency }));
  return partners;
};

const buildProductBookingSummaryRequestPartner = ({
  type,
  name = 'SHAWN SULLIVAN SEED',
  identifier,
  agency,
  AddressInformation,
}) => {
  const partner = xmlBuilder.create(`${type}`).ele('PartnerInformation');
  partner.ele({
    PartnerName: name,
    PartnerIdentifier: {
      '@Agency': agency,
      '#text': identifier,
    },
  });
  if (AddressInformation) {
    partner.ele({
      AddressInformation: {
        AddressLine: AddressInformation.address || 'default address',
        CityName: AddressInformation.city || 'Default City',
        StateOrProvince: AddressInformation.state || 'NE',
        PostalCode: AddressInformation.postalCode || '99999',
        PostalCountry: AddressInformation.postalCountry || 'Default Country',
      },
    });
  }
  return partner;
};

const buildProductBookingSummaryRequestDetails = async (orderType, productList) => {
  const details = xmlBuilder.create('ProductBookingDetails');
  await productList.forEach((product, index) => {
    details.importDocument(
      buildProductBookingSummaryRequestProductLineItem(orderType, {
        ...product,
        index: index + 1,
      }),
    );
  });
  return details;
};

const buildProductBookingSummaryRequestProductLineItem = (
  orderType,
  {
    lineNumber = '999999',
    lineItemNumber, // 2
    action = 'Add',
    itemType = 'Sale', // not required but will keep it dynamic since, Bayer could add another type change it at some point
    requestedDate = new Date().toISOString(),
    crossReferenceProductId, // 1100032937530
    increaseOrDecrease,
    quantity,
    requestedShipDate, // 2021-05-20T12:15:30Z
    specialInstructions = {},
    monsantoOrderQty,
    actionRequest,
    index,
  },
) => {
  const propertiesXMLObj = xmlBuilder.create('ProductBookingProductLineItem');
  propertiesXMLObj.ele({
    LineNumber: lineNumber,
    ActionRequest: actionRequest ? actionRequest : monsantoOrderQty ? 'Add' : 'Change',
    LineItemType: itemType,
    ProductBookingOrderLineItemNumber: lineItemNumber, // not index
    ProductIdentification: {
      ProductIdentifier: {
        '@Agency': 'AGIIS-ProductID',
        '#text': crossReferenceProductId,
      },
    },
    // ReferenceInformation: {
    //   "@ReferenceType": "ContractNumber",
    //   DocumentReference: {
    //     DocumentIdentifier: 1
    //   }
    // },
    IncreaseOrDecrease: {
      IncreaseOrDecreaseType: increaseOrDecrease.type,
      ProductQuantityChange: {
        Measurement: {
          MeasurementValue: increaseOrDecrease.value,
          UnitOfMeasureCode: {
            '@Domain': 'UN-Rec-20',
            '#text': increaseOrDecrease.unit,
          },
        },
      },
    },

    ProductQuantity: {
      Measurement: {
        MeasurementValue: quantity.value,
        UnitOfMeasureCode: {
          '@Domain': 'UN-Rec-20',
          '#text': increaseOrDecrease.unit,
        },
      },
    },
    RequestedShipDateTime: {
      DateTimeInformation: {
        DateTime: {
          '@DateTimeQualifier': 'After',
          '#text': requestedShipDate,
        },
      },
    },
  });

  if (orderType != 'DealerOrderUpdate') {
    propertiesXMLObj.ele({
      SpecialInstructions: {
        '@InstructionType': specialInstructions.type || 'General',
        '#text': specialInstructions.content,
      },
    });
  }

  return propertiesXMLObj;
};

// PARSER:
const parseProductBookingSummaryResponse = async (rawResponse, orderReference) => {
  const envelope = rawResponse['soapenv:Envelope'];
  if (envelope['S:Body']) {
    const errorMessage = envelope['S:Body'][0]['soapenv:Fault'][0]['detail'][0]['con:fault'][0]['con:reason'][0];
    if (errorMessage == 'No data found') {
      throw new Error(`No data found in retail order summary response`);
    }
  }
  if (envelope['S:Body']) {
    const errorMessage =
      envelope['S:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0]['S:Fault'][0]['faultstring'][0];
  }
  const envBody = envelope['soapenv:Body'][0];
  const payload = envBody['ag:outboundData'][0]['ag:xmlPayload'][0];
  const productBookingResponse = payload['urn:ProductBookingResponse'][0];

  // const productBookings = productBookingResponse["urn:ProductBookingResponseBody"];
  const productBookings =
    productBookingResponse['ProductBookingResponseBody'] || productBookingResponse['urn:ProductBookingResponseBody'];
  let productBooking;
  if (orderReference) {
    productBooking = findBookingByOrderReference({
      orderReference,
      productBookings,
    });
    if (!productBooking) {
      throw new Error('Booking not found');
    }
  } else {
    // productBooking = productBookings[0];
    productBooking = productBookings;
  }

  return {
    ...(await parseProductBooking(productBooking)),
  };
};

const findBookingByOrderReference = ({ orderReference, productBookings }) => {
  return productBookings.find((booking) => {
    return parseProductBookingProperties(booking).crossRefIdentifier === orderReference;
  });
};

const parseProductBooking = async (booking) => {
  const properties = await parseProductBookingProperties(booking);
  const details = await parseProductBookingDetails(booking);
  return {
    properties,
    // details
  };
};

const parseProductBookingProperties = (booking) => {
  return Promise.all(
    booking &&
      booking.map(async (book) => {
        // const propertiesObj = booking["urn:ProductBookingResponseProperties"][0];
        const propertiesObj = (book['ProductBookingResponseProperties'] ||
          book['urn:ProductBookingResponseProperties'])[0];

        const responseStatus = propertiesObj['urn:ResponseStatus'] ? propertiesObj['urn:ResponseStatus'][0] : '';
        const detailsObj = (book['ProductBookingResponseDetails'] || book['urn:ProductBookingResponseDetails'])[0][
          'urn:ProductBookingResponseProductLineItem'
        ];

        return {
          // orderNumber: propertiesObj["urn:ProductBookingOrderNumber"][0],
          orderNumber: (propertiesObj['ProductBookingOrderNumber'] ||
            propertiesObj['urn:ProductBookingOrderNumber'])[0],
          // typeCode: propertiesObj["urn:ProductBookingOrderTypeCode"][0],
          typeCode: (propertiesObj['ProductBookingOrderTypeCode'] ||
            propertiesObj['urn:ProductBookingOrderTypeCode'])[0],
          issuedDate:
            // propertiesObj["urn:ProductBookingOrderIssuedDate"][0]["urn:DateTime"][0]["_"],
            propertiesObj['ProductBookingOrderIssuedDate']
              ? propertiesObj['ProductBookingOrderIssuedDate'][0]['DateTime'][0]['_']
              : propertiesObj['urn:ProductBookingOrderIssuedDate'][0]['urn:DateTime'][0]['_'],

          crossRefIdentifier:
            // propertiesObj["urn:ReferenceInformation"][0]["urn:DocumentReference"][0]["urn:DocumentIdentifier"][0],
            propertiesObj['ReferenceInformation']
              ? propertiesObj['ReferenceInformation'][0]['DocumentReference'][0]['DocumentIdentifier'][0]
              : propertiesObj['urn:ReferenceInformation'][0]['urn:DocumentReference'][0]['urn:DocumentIdentifier'][0],

          responseStatus: responseStatus
            ? {
                identifier: responseStatus['urn:ResponseStatusReasonIdentifier'][0]['_'],
                description: responseStatus['urn:ResponseStatusReasonDescription'][0],
              }
            : '',
          partnerName: (book['ProductBookingResponsePartners'] || book['urn:ProductBookingResponsePartners'])[0][
            'urn:ShipTo'
          ][0]['urn:PartnerInformation'][0]['urn:PartnerName'][0],
          detail: await Promise.all(detailsObj.map(parseProductBookingDetail)),
        };
      }),
  );
};

const parseProductBookingDetails = (booking) => {
  // const detailsObj = booking["urn:ProductBookingResponseDetails"][0]["urn:ProductBookingResponseProductLineItem"];
  return Promise.all(
    booking.map((book) => {
      const detailsObj = book['ProductBookingResponseDetails']
        ? book['ProductBookingResponseDetails'][0]['urn:ProductBookingResponseProductLineItem']
        : book['urn:ProductBookingResponseDetails'][0]['urn:ProductBookingResponseProductLineItem'];
      return Promise.all(detailsObj.map(parseProductBookingDetail));
    }),
  );
};

const parseProductBookingDetail = async (productLineItem) => {
  return {
    lineNumber: productLineItem['urn:LineNumber'][0],
    productBookingLineItemNumber: productLineItem['urn:ProductBookingOrderLineItemNumber'][0],
    identification: {
      identifier: productLineItem['urn:ProductIdentification'][0]['urn:ProductIdentifier'][0]['_'],
      productName: productLineItem['urn:ProductIdentification'][0]['urn:ProductName']
        ? productLineItem['urn:ProductIdentification'][0]['urn:ProductName'][0]
        : '',
    },
    quantity: {
      value: productLineItem['urn:ProductQuantity'][0]['urn:Measurement'][0]['urn:MeasurementValue'][0],
      unit: productLineItem['urn:ProductQuantity'][0]['urn:Measurement'][0]['urn:UnitOfMeasureCode'][0]['_'],
    },
  };
};

module.exports = {
  buildProductBookingSummaryRequest,
  parseProductBookingSummaryResponse,
};
