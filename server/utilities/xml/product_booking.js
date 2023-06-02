const xmlBuilder = require('xmlbuilder');
const config = require('config').getConfig();
const { buildMonsantoRequest, buildXmlPayloadHeader, calculateSeedYear } = require('./common');

const buildProductBookingRequest = async ({
  seedDealerMonsantoId,
  organizationName,
  orders,
  isDealerBucket,
  monsantoUserData,
  organizationAddress,
  organizationBusinessCity,
  organizationBusinessState,
  organizationBusinessZip,
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
  });
  const body = xmlPayload
    .ele('ProductBooking', {
      'xsi:schemaLocation':
        'urn:cidx:names:specification:ces:schema:all:5:3 file:///Y:/B2B/SC-II/5.3/Chem_eStandards_5.3_FINAL_QA_2013-09-30a.xsd',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      xmlns: 'urn:cidx:names:specification:ces:schema:all:5:3',
    })
    .importDocument(
      buildXmlPayloadHeader({
        nameSpace: '',
        params: {
          from: {
            inverse: true,
            agency: 'AGIIS-EBID',
            name: organizationName, //organizationName,
            identifier: seedDealerMonsantoId.trim(),
            dataSource: 'WS-XML',
            seedYear: calculateSeedYear(),
            softwareName: 'AgriDealer',
            SoftwareVersion: process.env.SOFTWARE_VERSION,
          },
          to: {
            agency: 'AGIIS-EBID',
            name: 'Bayer Crop Science',
            identifier: MONSANTO_TECH_ID,
          },
        },
      }),
    );
  const buildProductBookingRequestBodyPromises = orders.map((order) => {
    const latest = { ...order };
    return buildProductBookingRequestBody({
      ...order,
      buyer: {
        name: organizationName,
        identifier: seedDealerMonsantoId.trim(),
        // AddressInformation: {
        //   AddressLine: "74971 AVENUE 358",
        //   CityName: "WALLACE",
        //   StateOrProvince: "NE",
        //   PostalCode: "69169",
        //   PostalCountry: "US",
        // },
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
        // name: "BOYD GIGAX",
        // identifier: isDealerBucket ? "1100064726737" : "1100031728863",
        name: order.shipTo.name || 'BOYD GIGAX',
        identifier: isDealerBucket ? '1100064726737' : order.shipTo.identifier,
        agency: order.shipTo.agency ? order.shipTo.agency : 'GLN',

        // AddressInformation: {
        //   AddressLine: "",
        //   CityName: "",
        //   StateOrProvince: "NE",
        //   PostalCode: "69169",
        //   PostalCountry: "US",
        // },
        AddressInformation: {
          AddressLine: order.shipTo.addressInformation.address || '',
          CityName: order.shipTo.addressInformation.city || '',
          StateOrProvince: order.shipTo.addressInformation.state || 'NE',
          PostalCode: order.shipTo.addressInformation.postalCode || '69169',
          PostalCountry: order.shipTo.addressInformation.postalCountry || 'US',
        },
      },
      // use original grower id's here
      SoldTo: {
        name: organizationName,
        identifier: seedDealerMonsantoId.trim(),
      },
      Payer: {
        name: organizationName,
        identifier: seedDealerMonsantoId.trim(),
      },
      isDealerBucket,
    });
  });

  const bodies = await Promise.all(buildProductBookingRequestBodyPromises);

  bodies.forEach((_body) => body.importDocument(_body));
  return xmlPayload.end({ pretty: true });
};

const buildProductBookingRequestBody = async (orderInfo) => {
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
    isDealerBucket,
  } = orderInfo;

  const body = xmlBuilder.create('ProductBookingBody');
  body.importDocument(
    await buildProductBookingRequestProperties({
      orderNumber,
      orderType,
      orderReference,
      productYear,
      directShip,
      specialInstructions,
      issuedDate,
    }),
  );
  body.importDocument(
    buildProductBookingRequestPartners({
      buyer,
      seller,
      shipTo,
      soldTo,
      payer,
      isDealerBucket,
    }),
  );

  if (orderType !== 'SummaryRequest') {
    body.importDocument(await buildProductBookingRequestDetails(orderType, products));
  }
  return body;
};

const buildProductBookingRequestProperties = async (properties) => {
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
      '#text': 'KN' || 'NE',
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
    BuyerSequenceNumber: 0,
  });

  propertiesXMLObj.ele({
    SoftwareInformation: {
      SoftwareSource: 'AgriDealer',
      SoftwareVersion: process.env.SOFTWARE_VERSION,
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

  propertiesXMLObj.ele({
    DirectShipFlag: directShip ? 1 : 0,
  });

  if (specialInstructions) {
    propertiesXMLObj.ele({
      SpecialInstructions: {
        '@InstructionType': specialInstructions.type,
        '#text': specialInstructions.content,
      },
    });
  }
  return propertiesXMLObj;
};

const buildProductBookingRequestPartners = ({
  buyer,
  seller,
  shipTo,
  soldTo = buyer,
  payer = buyer,
  isDealerBucket,
}) => {
  const partners = xmlBuilder
    .create('ProductBookingPartners')
    .importDocument(buildProductBookingRequestPartner({ type: 'Buyer', ...buyer }))
    .importDocument(buildProductBookingRequestPartner({ type: 'Seller', ...seller }));

  if (shipTo) {
    partners.importDocument(
      buildProductBookingRequestPartner({
        type: 'ShipTo',
        ...shipTo,
        isDealerBucket,
      }),
    );
  }

  partners.importDocument(buildProductBookingRequestPartner({ type: 'SoldTo', ...soldTo }));

  partners.importDocument(buildProductBookingRequestPartner({ type: 'Payer', ...payer }));

  return partners;
};

const buildProductBookingRequestPartner = ({
  type,
  name = 'SHAWN SULLIVAN SEED',
  identifier,
  agency = 'AGIIS-EBID',
  AddressInformation,
  isDealerBucket,
}) => {
  const partner = xmlBuilder.create(`${type}`).ele('PartnerInformation');
  partner.ele({
    PartnerName: name ? name : 'SHAWN SULLIVAN SEED',
    PartnerIdentifier: {
      '@Agency': agency,
      '#text': type === 'ShipTo' && isDealerBucket ? '1100064726737' : identifier,
    },
  });
  if (AddressInformation) {
    partner.ele({
      AddressInformation: {
        // AddressLine: addressInformation.address,
        // CityName: addressInformation.city,
        // StateOrProvince: addressInformation.state,

        AddressLine: AddressInformation.AddressLine || 'Deafult address',
        CityName: AddressInformation.CityName || 'Default City',
        StateOrProvince: AddressInformation.StateOrProvince || 'NE',
        PostalCode: AddressInformation.PostalCode || '9999',
        PostalCountry: AddressInformation.PostalCountry || '',
      },
    });
  }
  return partner;
};

function findDublicateLineItem(arr) {
  const makeUnique =
    arr.length > 0 &&
    arr.reduce((list, item) => {
      const hasItem = list.find((listItem) =>
        ['lineNumber', 'lineItemNumber', 'action', 'monsantoOrderQty', 'crossReferenceProductId', 'orderQty'].every(
          (key) => listItem[key] === item[key],
        ),
      );
      if (!hasItem) list.push(item);
      return list;
    }, []);

  return (
    makeUnique.length > 0 &&
    makeUnique
      .map((e) => e['lineItemNumber'])
      .map((e, i, final) => final.indexOf(e) !== i && i)
      .filter((obj) => makeUnique[obj])
      .map((e) => makeUnique[e]['lineItemNumber'])
  );
}

const buildProductBookingRequestDetails = async (orderType, productList) => {
  const details = xmlBuilder.create('ProductBookingDetails');
  const isDublicate = findDublicateLineItem(productList);
  if (isDublicate.length) {
    throw 'Line Item Number is Duplicate found';
  } else {
    productList.length > 0 &&
      (await productList.forEach((product, index) => {
        details.importDocument(
          buildProductBookingRequestProductLineItem(orderType, {
            ...product,
            index: index + 1,
          }),
        );
      }));
    return details;
  }
};

const buildProductBookingRequestProductLineItem = (
  orderType,
  {
    lineItem,
    lineNumber = '999999',
    lineItemNumber,
    action,
    MonsantoProduct,
    itemType = 'Sale', // not required but will keep it dynamic since, Bayer could add another type change it at some point
    requestedDate = new Date().toISOString(),
    crossReferenceProductId,
    increaseOrDecrease,
    quantity,
    requestedShipDate,
    specialInstructions = {},
    monsantoOrderQty,
    isDeleted,
    index,
  },
) => {
  return xmlBuilder.create('ProductBookingProductLineItem').ele({
    LineNumber: lineNumber,
    ActionRequest: action,
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
            '@Domain': JSON.parse(lineItem.suggestedDealerMeasurementUnitCode).domain,
            '#text': JSON.parse(lineItem.suggestedDealerMeasurementUnitCode).value,
            // "@Domain": lineItem.suggestedDealerMeasurementUnitCode.domain,
            // "#text": lineItem.suggestedDealerMeasurementUnitCode.value
          },
        },
      },
    },

    ProductQuantity: {
      Measurement: {
        MeasurementValue: quantity.value,
        UnitOfMeasureCode: {
          '@Domain': JSON.parse(lineItem.suggestedDealerMeasurementUnitCode).domain,
          '#text': JSON.parse(lineItem.suggestedDealerMeasurementUnitCode).value,
          // "@Domain": lineItem.suggestedDealerMeasurementUnitCode.domain,
          // "#text": lineItem.suggestedDealerMeasurementUnitCode.value
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
    // currently not needed

    // SpecialInstructions: {
    //   "@InstructionType": specialInstructions.type || "General",
    //   "#text": specialInstructions.content
    // }
  });
};

// PARSER:
const parseProductBookingResponse = async (rawResponse, orderReference) => {
  const envelope = rawResponse['soapenv:Envelope'];
  if (envelope['S:Body']) {
    const errorMessage =
      envelope['S:Body'][0]['ag:outboundData'][0]['ag:xmlPayload'][0]['S:Fault'][0]['faultstring'][0];
  }
  const envBody = envelope['soapenv:Body'][0];
  const payload = envBody['ag:outboundData'][0]['ag:xmlPayload'][0];
  const productBookingResponse = payload['urn:ProductBookingResponse'][0];
  const uuid = productBookingResponse['urn:Header'][0]['urn:ThisDocumentIdentifier'][0]['urn:DocumentIdentifier'][0];
  const productBookings = productBookingResponse['urn:ProductBookingResponseBody'];
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
    if (productBookings.length > 1) {
      productBooking = productBookings;
    } else {
      productBooking = productBookings[0];
    }
  }
  return {
    ...(await parseProductBooking(productBooking)),
    uuid,
  };
};

const findBookingByOrderReference = ({ orderReference, productBookings }) => {
  return productBookings.find((booking) => {
    return parseProductBookingProperties(booking).crossRefIdentifier === orderReference;
  });
};

const parseProductBooking = async (booking) => {
  if (Array.isArray(booking)) {
    const totaldDetails = [];
    const totalProperties = {};
    for (let i = 0; i < booking.length; i++) {
      const propertyDetails = await parseProductBookingProperties(booking[i]);
      const properties = {
        crossRefIdentifier: propertyDetails.crossRefIdentifier,
        orderNumber: propertyDetails.orderNumber,
        responseStatus: propertyDetails.responseStatus,
      };
      totalProperties[i] = properties;
      totaldDetails.push(...(await parseProductBookingDetails(booking[i])));
    }
    return {
      properties: totalProperties,
      details: totaldDetails,
    };
  } else {
    const properties = await parseProductBookingProperties(booking);
    const details = await parseProductBookingDetails(booking);
    const impactSummary = await parseRetailOrderImpactSummary(booking);
    return {
      properties,
      details,
      impactSummary,
    };
  }
};

const parseRetailOrderImpactSummary = (booking) => {
  let propertiesObj = booking['urn:RetailerOrderImpactSummary'][0]['urn:RetailerResponseSummaryProductLineItem'];
  propertiesObj =
    propertiesObj &&
    propertiesObj.map((item) => {
      return {
        crossReferenceId: item['urn:ProductIdentification'][0]['urn:ProductIdentifier'][0]['_'],
        increaseDecrease: {
          type: item['urn:IncreaseDecreaseRetailerProductQuantity'][0]['urn:IncreaseOrDecreaseType'][0],
          value:
            item['urn:IncreaseDecreaseRetailerProductQuantity'][0]['urn:Measurement'][0]['urn:MeasurementValue'][0],
        },
        supply: item['urn:TotalRetailerOrderedProductQuantity'][0]['urn:Measurement'][0]['urn:MeasurementValue'][0],
        demand: item['urn:TotalBookingDemandQuantity'][0]['urn:Measurement'][0]['urn:MeasurementValue'][0],
        longShort: {
          type: item['urn:TotalLongShortPosition'][0]['urn:LongShortPositionType'][0],
          value: item['urn:TotalLongShortPosition'][0]['urn:Measurement'][0]['urn:MeasurementValue'][0],
        },
      };
    });

  return propertiesObj;
};

const parseProductBookingProperties = (booking) => {
  const propertiesObj = booking['urn:ProductBookingResponseProperties'][0];
  const responseStatus = propertiesObj['urn:ResponseStatus'] ? propertiesObj['urn:ResponseStatus'] : [];
  return {
    orderNumber: propertiesObj['urn:ProductBookingOrderNumber'][0],
    typeCode: propertiesObj['urn:ProductBookingOrderTypeCode'][0],
    issuedDate: propertiesObj['urn:ProductBookingOrderIssuedDate'][0]['urn:DateTime'][0]['_'],
    crossRefIdentifier:
      propertiesObj['urn:ReferenceInformation'][0]['urn:DocumentReference'][0]['urn:DocumentIdentifier'][0],
    responseStatus: responseStatus.map((item) => ({
      identifier: item['urn:ResponseStatusReasonIdentifier'][0]['_'],
      description: item['urn:ResponseStatusReasonDescription'][0],
    })),
  };
};

const parseProductBookingDetails = (booking) => {
  const detailsObj = booking['urn:ProductBookingResponseDetails'][0]['urn:ProductBookingResponseProductLineItem'];

  return detailsObj ? Promise.all(detailsObj.map((item) => parseProductBookingDetail(item))) : [];
};

const parseProductBookingDetail = async (productLineItem) => {
  const responseStatus = productLineItem['urn:ResponseStatus'] ? productLineItem['urn:ResponseStatus'] : [];
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
    responseStatus: responseStatus.map((item) => ({
      identifier: item['urn:ResponseStatusReasonIdentifier'][0]['_'],
      description: item['urn:ResponseStatusReasonDescription'][0],
    })),
  };
};

module.exports = {
  buildProductBookingRequest,
  parseProductBookingResponse,
};
