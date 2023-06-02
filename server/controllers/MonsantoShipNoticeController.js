const request = require('request-promise');
const config = require('config').getConfig();
const emailUtility = require('utilities/email');

const { Op } = require('sequelize');
const {
  common: { parseXmlStringPromise },
} = require('utilities/xml');
const { buildShipNoticeListRequest, parseShipNoticeListResponse } = require('utilities/xml/ship_notice');
const { ApiSeedCompany, MonsantoLot, MonsantoProduct, MonsantoProductLineItem } = require('models');

module.exports.shipNoticeList = async (req, res) => {
  const { technologyId, username, password, name } = req.body;
  let monsantoUserData = {
    dataValues: { username, password },
  };
  const apiseedcompanyData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });

  const isExits = await MonsantoProduct.findOne({
    where: {
      organizationId: req.user.organizationId,
      id: `99999${req.user.organizationId}`,
    },
  });
  if (!isExits) {
    await MonsantoProduct.create({
      organizationId: req.user.organizationId,
      id: `99999${req.user.organizationId}`,
      seedCompanyId: apiseedcompanyData ? apiseedcompanyData.dataValues.id : `99999${req.user.organizationId}`,
      isFavorite: false,
      productDetail: 'specialID',
      classification: 'no',
    });
  }

  const isExitsItems = await MonsantoProductLineItem.findOne({
    where: {
      organizationId: req.user.organizationId,
      productId: `99999${req.user.organizationId}`,
      id: `99999${req.user.organizationId}`,
    },
  });
  if (!isExitsItems) {
    await MonsantoProductLineItem.create({
      id: `99999${req.user.organizationId}`,

      organizationId: req.user.organizationId,
      productId: `99999${req.user.organizationId}`,
      lineNumber: `99999${req.user.organizationId}`,
      crossReferenceProductId: 'specialID',
      effectiveFrom: new Date(),
      effectiveTo: new Date(),
      suggestedDealerPrice: JSON.stringify({}),
      suggestedDealerCurrencyCode: JSON.stringify({}),
      suggestedDealerMeasurementValue: 0,
      suggestedDealerMeasurementUnitCode: JSON.stringify({}),
      suggestedEndUserPrice: JSON.stringify({}),
      suggestedEndUserCurrencyCode: JSON.stringify({}),
      suggestedEndUserMeasurementValue: 0,
      suggestedEndUserMeasurementUnitCode: JSON.stringify({}),
    });
  }
  let emaildata = [];

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
  return buildShipNoticeListRequest({
    technologyId: apiseedcompanyData.dataValues.technologyId,
    name: apiseedcompanyData.dataValues.name,
    monsantoUserData,
  })
    .then((shipNoticeListRequest) => {
      return request.post(config.monsantoEndPoint, {
        'content-type': 'text/plain',
        body: shipNoticeListRequest,
      });
    })
    .then(parseXmlStringPromise)
    .then(parseShipNoticeListResponse)
    .then(async (jsonResponse) => {
      // monsantoReqLogCreator({
      //   req,
      //   userName: req.body.name,
      //   type: 'ship notice list check',
      //   uuid: response.licences[0].uuid,
      // });
      if (jsonResponse.length > 0) {
        await Promise.all(
          jsonResponse.map((shipNotice) => {
            if (shipNotice.shipNoticeDetails.length > 0) {
              shipNotice.shipNoticeDetails.forEach(async (detail, index) => {
                const { shippedQuantity, productSubLineItems, product, lineNumber } = detail;

                await MonsantoProduct.findOne({
                  where: {
                    organizationId: req.user.organizationId,
                    crossReferenceId: product.productId,
                  },
                }).then(async (res) => {
                  if (!res && res === null) {
                    await emaildata.push({ productDetail: product.productName, productId: product.productId });
                    MonsantoProduct.findOne({
                      where: {
                        organizationId: req.user.organizationId,
                        id: `99999${req.user.organizationId}`,
                      },
                    }).then(async (res) => {
                      if (res && res !== null) {
                        await MonsantoLot.findAll({
                          where: {
                            organizationId: req.user.organizationId,
                            shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
                            deliveryNoteNumber:
                              shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
                            lotNumber: productSubLineItems.lotNumber,
                            lineNumber: lineNumber,
                            monsantoProductId: `99999${req.user.organizationId}`,
                          },
                        }).then(async (arrayData) => {
                          MonsantoLot.create({
                            quantity: shippedQuantity.value,
                            receivedQty: shippedQuantity.value,
                            organizationId: req.user.organizationId,
                            lotNumber: productSubLineItems.lotNumber,
                            crossReferenceId: product.productId,
                            monsantoProductId: `99999${req.user.organizationId}`,
                            grossVolume:
                              productSubLineItems.grossVolume.value +
                              ' ' +
                              productSubLineItems.grossVolume.unitOfMeasureCode,
                            netWeight:
                              productSubLineItems.netWeight.value +
                              ' ' +
                              productSubLineItems.netWeight.unitOfMeasureCode,
                            source: 'Monsanto Seed Company',
                            lineNumber: lineNumber,
                            shipDate: shipNotice.shipNoticeProperties.shipDate,
                            deliveryDate: shipNotice.shipNoticeProperties.deliveryDate,
                            shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
                            deliveryNoteNumber:
                              shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
                            isNew: arrayData && arrayData.length > 0 ? false : true,
                            isDeleted: false,
                          });
                        });
                      }
                    });
                  } else {
                    await MonsantoLot.findAll({
                      where: {
                        organizationId: req.user.organizationId,
                        shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
                        deliveryNoteNumber: shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
                        lotNumber: productSubLineItems.lotNumber,
                        lineNumber: lineNumber,
                        monsantoProductId: res ? res.dataValues.id : null,
                      },
                    }).then((arrayData) => {
                      MonsantoLot.create({
                        quantity: shippedQuantity.value,
                        receivedQty: shippedQuantity.value,
                        organizationId: req.user.organizationId,
                        lotNumber: productSubLineItems.lotNumber,
                        crossReferenceId: product.productId,
                        lineNumber: lineNumber,
                        monsantoProductId: res ? res.dataValues.id : '',
                        lineNumber: lineNumber,
                        grossVolume:
                          productSubLineItems.grossVolume.value +
                          ' ' +
                          productSubLineItems.grossVolume.unitOfMeasureCode,
                        netWeight:
                          productSubLineItems.netWeight.value + ' ' + productSubLineItems.netWeight.unitOfMeasureCode,
                        source: 'Monsanto Seed Company',
                        shipDate: shipNotice.shipNoticeProperties.shipDate,
                        deliveryDate: shipNotice.shipNoticeProperties.deliveryDate,
                        shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
                        deliveryNoteNumber: shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
                        isNew: arrayData && arrayData.length > 0 ? false : true,
                        isDeleted: false,
                      });
                    });
                  }
                });
              });
            }
          }),
        ).catch((e) => {
          console.log(e, 'error from monsanto Ship notice');
        });
      }

      res.json({ data: jsonResponse, isUpdate: jsonResponse.length > 0 ? true : false });
    })
    .then(() => {
      setTimeout(() => {
        emaildata.length > 0 &&
          emailUtility.sendEmail(
            'dev@agridealer.co',
            'Product Not Found Email',
            `Below Product is not found in ShipNoticeListRequest`,
            `<p>Below Product is not found in ShipNoticeListRequest</p><br></br>
      ${emaildata.map((data) => {
        return `<p>The product name/detail${data.productDetail} , the Bayer product ID ${data.productId} , and the organizationId is ${req.user.organizationId}  </p>`;
      })}`,
            null,
          );
      }, 4000);
    })
    .catch((e) => {
      console.log('error from ship Notice');
    });

  //   const content = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  //        <soapenv:Header/>
  //        <soapenv:Body>
  //           <ag:outboundData xmlns:ag="urn:aggateway:names:ws:docexchange">
  //              <ag:processStep>ShipNoticeList</ag:processStep>
  //              <ag:messageId>81847ade-aef7-4cb9-9143-e5d51fb5cafb</ag:messageId>
  //              <ag:xmlPayload>
  //                 <ShipNoticeList xmlns="urn:cidx:names:specification:ces:schema:all:5:2" Version="5.2">
  //                    <Header>
  //                       <ThisDocumentIdentifier xmlns:urn="urn:aggateway:names:ws:docexchange"
  //                                               xmlns:urn1="urn:cidx:names:specification:ces:schema:all:5:3">
  //                          <DocumentIdentifier>67bf6388-a847-42b7-b3ce-138d93f0d699</DocumentIdentifier>
  //                       </ThisDocumentIdentifier>
  //                       <ThisDocumentDateTime xmlns:urn="urn:aggateway:names:ws:docexchange"
  //                                             xmlns:urn1="urn:cidx:names:specification:ces:schema:all:5:3">
  //                          <DateTime DateTimeQualifier="On">2022-04-22T09:24:02.463Z</DateTime>
  //                       </ThisDocumentDateTime>
  //                       <From>
  //                          <PartnerInformation>
  //                             <PartnerName>Bayer Crop Science</PartnerName>
  //                             <PartnerIdentifier Agency="AGIIS-EBID">0062668030000</PartnerIdentifier>
  //                          </PartnerInformation>
  //                       </From>
  //                       <To>
  //                          <PartnerInformation>
  //                             <PartnerName>SHAWN SULLIVAN SEED WALLACE NE</PartnerName>
  //                             <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
  //                          </PartnerInformation>
  //                       </To>
  //                    </Header>
  //                    <ShipNoticeListBody>
  //                       <ShipNoticeListProperties/>
  //                       <ShipNoticeListDetails>
  //                          <ShipNoticeBody>
  //                             <ShipNoticeProperties>
  //                                <ShipmentIdentification>
  //                                   <DocumentReference>
  //                                      <DocumentIdentifier>0090003707</DocumentIdentifier>
  //                                   </DocumentReference>
  //                                </ShipmentIdentification>
  //                                <ShipDate>
  //                                   <DateTime DateTimeQualifier="On">2021-11-04T00:00:00Z</DateTime>
  //                                </ShipDate>
  //                                <PurchaseOrderInformation>
  //                                   <DocumentReference>
  //                                      <DocumentIdentifier>4198029/22-TEST</DocumentIdentifier>
  //                                      <ReferenceItem>50</ReferenceItem>
  //                                   </DocumentReference>
  //                                </PurchaseOrderInformation>
  //                                <TransportMethodCode Domain="UN-Rec-19">3</TransportMethodCode>
  //                                <ReferenceInformation ReferenceType="DeliveryNoteNumber">
  //                                   <DocumentReference>
  //                                      <DocumentIdentifier>0801730010</DocumentIdentifier>
  //                                   </DocumentReference>
  //                                </ReferenceInformation>
  //                                <ReferenceInformation ReferenceType="BillOfLadingNumber">
  //                                   <DocumentReference>
  //                                      <DocumentIdentifier>0090003707</DocumentIdentifier>
  //                                   </DocumentReference>
  //                                </ReferenceInformation>
  //                                <ConveyanceInformation>
  //                                   <ConveyanceNameOrIdentifier>DeliveryDate</ConveyanceNameOrIdentifier>
  //                                   <EstimatedTimeOfArrivalDate>
  //                                      <DateTimeInformation>
  //                                         <DateTime DateTimeQualifier="On">2022-08-31T00:00:00.000000000</DateTime>
  //                                      </DateTimeInformation>
  //                                   </EstimatedTimeOfArrivalDate>
  //                                </ConveyanceInformation>
  //                                <ShipNoticeDate>
  //                                   <DateTime DateTimeQualifier="On">2022-04-22T09:24:22Z</DateTime>
  //                                </ShipNoticeDate>
  //                             </ShipNoticeProperties>
  //                             <ShipNoticePartners>
  //                                <Buyer>
  //                                   <PartnerInformation>
  //                                      <PartnerName>SHAWN SULLIVAN SEED WALLACE NE</PartnerName>
  //                                      <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
  //                                      <AddressInformation>
  //                                         <AddressLine>74971 AVENUE 358</AddressLine>
  //                                         <CityName>WALLACE</CityName>
  //                                         <StateOrProvince>NE</StateOrProvince>
  //                                         <PostalCode>69169</PostalCode>
  //                                         <PostalCountry>US</PostalCountry>
  //                                      </AddressInformation>
  //                                   </PartnerInformation>
  //                                </Buyer>
  //                                <Seller>
  //                                   <PartnerInformation>
  //                                      <PartnerName>Bayer Crop Science</PartnerName>
  //                                      <PartnerIdentifier Agency="AGIIS-EBID">0062668030000</PartnerIdentifier>
  //                                      <AddressInformation>
  //                                         <AddressLine>800 N.LINDBERGH</AddressLine>
  //                                         <CityName>CREVE COEUR</CityName>
  //                                         <StateOrProvince>MO</StateOrProvince>
  //                                         <PostalCode>63167</PostalCode>
  //                                         <PostalCountry>US</PostalCountry>
  //                                      </AddressInformation>
  //                                   </PartnerInformation>
  //                                </Seller>
  //                                <OtherPartner PartnerRole="ShipFrom">
  //                                   <PartnerInformation>
  //                                      <PartnerName>null</PartnerName>
  //                                      <PartnerIdentifier Agency="AGIIS-EBID">0004169135</PartnerIdentifier>
  //                                      <AddressInformation>
  //                                         <CityName>null</CityName>
  //                                         <StateOrProvince>null</StateOrProvince>
  //                                         <PostalCode>null</PostalCode>
  //                                         <PostalCountry>null</PostalCountry>
  //                                      </AddressInformation>
  //                                   </PartnerInformation>
  //                                </OtherPartner>
  //                                <OtherPartner PartnerRole="Carrier">
  //                                   <PartnerInformation>
  //                                      <PartnerName>FV: G W Van Keppel Co</PartnerName>
  //                                      <PartnerIdentifier Agency="SCAC">7VKL</PartnerIdentifier>
  //                                      <AddressInformation>
  //                                         <AddressLine>LOCK BOX 8</AddressLine>
  //                                         <CityName>Kansas City</CityName>
  //                                         <StateOrProvince>MO</StateOrProvince>
  //                                         <PostalCode>64187</PostalCode>
  //                                         <PostalCountry>US</PostalCountry>
  //                                      </AddressInformation>
  //                                   </PartnerInformation>
  //                                </OtherPartner>
  //                                <OtherPartner PartnerRole="ShipTo">
  //                                   <PartnerInformation>
  //                                      <PartnerName>SHAWN SULLIVAN SEED WALLACE NE</PartnerName>
  //                                      <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
  //                                      <AddressInformation>
  //                                         <AddressLine>74971 AVENUE 358</AddressLine>
  //                                         <CityName>WALLACE</CityName>
  //                                         <StateOrProvince>NE</StateOrProvince>
  //                                         <PostalCode>69169</PostalCode>
  //                                         <PostalCountry>US</PostalCountry>
  //                                      </AddressInformation>
  //                                   </PartnerInformation>
  //                                </OtherPartner>
  //                                <OtherPartner PartnerRole="BillToParty">
  //                                   <PartnerInformation>
  //                                      <PartnerName>SHAWN SULLIVAN SEED WALLACE NE</PartnerName>
  //                                      <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
  //                                      <AddressInformation>
  //                                         <AddressLine>74971 AVENUE 358</AddressLine>
  //                                         <CityName>WALLACE</CityName>
  //                                         <StateOrProvince>NE</StateOrProvince>
  //                                         <PostalCode>69169</PostalCode>
  //                                         <PostalCountry>US</PostalCountry>
  //                                      </AddressInformation>
  //                                   </PartnerInformation>
  //                                </OtherPartner>
  //                             </ShipNoticePartners>
  //                             <ShipNoticeDetails>
  //                                <ShipNoticeProductLineItem>
  //                                   <LineNumber>30</LineNumber>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="UPC">888346084119</ProductIdentifier>
  //                                      <ProductName>DKA40-16 50# CONV</ProductName>
  //                                      <ProductDescription>000000000012663288</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="EAN">000000000012663288</ProductIdentifier>
  //                                      <ProductName>DKA40-16 50# CONV</ProductName>
  //                                      <ProductDescription>000000000012663288</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="AGIIS-ProductID">00888346084119</ProductIdentifier>
  //                                      <ProductName>DKA40-16 50# CONV</ProductName>
  //                                      <ProductDescription>000000000012663288</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ShippedQuantity>
  //                                      <Measurement>
  //                                         <MeasurementValue>180.000</MeasurementValue>
  //                                         <UnitOfMeasureCode Domain="UN-Rec-20">BG</UnitOfMeasureCode>
  //                                      </Measurement>
  //                                   </ShippedQuantity>
  //                                   <PurchaseOrderInformation>
  //                                      <DocumentReference>
  //                                         <DocumentIdentifier>4198029/22-TEST</DocumentIdentifier>
  //                                         <ReferenceItem>60</ReferenceItem>
  //                                      </DocumentReference>
  //                                   </PurchaseOrderInformation>
  //                                   <ReferenceInformation ReferenceType="SalesOrderReference">
  //                                      <DocumentReference>
  //                                         <DocumentIdentifier>0002171990</DocumentIdentifier>
  //                                      </DocumentReference>
  //                                   </ReferenceInformation>
  //                                   <ProductSubLineItems>
  //                                      <SubLineItemNumber>1</SubLineItemNumber>
  //                                      <ManufacturingIdentificationDetails>
  //                                         <ManufacturingIdentificationType>Lot</ManufacturingIdentificationType>
  //                                         <ManufacturingIdentificationNumber>LEPSI-STK</ManufacturingIdentificationNumber>
  //                                      </ManufacturingIdentificationDetails>
  //                                      <GrossVolume>
  //                                         <SpecifiedMeasurement MeasurementQualifier="EqualTo">
  //                                            <Measurement>
  //                                               <MeasurementValue>18.000</MeasurementValue>
  //                                               <UnitOfMeasureCode Domain="UN-Rec-20">BG</UnitOfMeasureCode>
  //                                            </Measurement>
  //                                         </SpecifiedMeasurement>
  //                                      </GrossVolume>
  //                                      <NetWeight>
  //                                         <SpecifiedMeasurement MeasurementQualifier="EqualTo">
  //                                            <Measurement>
  //                                               <MeasurementValue>900.000</MeasurementValue>
  //                                               <UnitOfMeasureCode Domain="UN-Rec-20">LBR</UnitOfMeasureCode>
  //                                            </Measurement>
  //                                         </SpecifiedMeasurement>
  //                                      </NetWeight>
  //                                   </ProductSubLineItems>
  //                                </ShipNoticeProductLineItem>
  //                                <ShipNoticeProductLineItem>
  //                                   <LineNumber>40</LineNumber>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="UPC">883580264334</ProductIdentifier>
  //                                      <ProductName>DKS28-05 50# Concep/Poncho</ProductName>
  //                                      <ProductDescription>000000000087674223</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="EAN">000000000087674223</ProductIdentifier>
  //                                      <ProductName>DKS28-05 50# Concep/Poncho</ProductName>
  //                                      <ProductDescription>000000000087674223</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="AGIIS-ProductID">00883580264334</ProductIdentifier>
  //                                      <ProductName>DKS28-05 50# Concep/Poncho</ProductName>
  //                                      <ProductDescription>000000000087674223</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ShippedQuantity>
  //                                      <Measurement>
  //                                         <MeasurementValue>100.000</MeasurementValue>
  //                                         <UnitOfMeasureCode Domain="UN-Rec-20">C62</UnitOfMeasureCode>
  //                                      </Measurement>
  //                                   </ShippedQuantity>
  //                                   <ProductSubLineItems>
  //                                      <SubLineItemNumber>1</SubLineItemNumber>
  //                                      <ManufacturingIdentificationDetails>
  //                                         <ManufacturingIdentificationType>Lot</ManufacturingIdentificationType>
  //                                         <ManufacturingIdentificationNumber>TEST02SR03</ManufacturingIdentificationNumber>
  //                                      </ManufacturingIdentificationDetails>
  //                                      <GrossVolume>
  //                                         <SpecifiedMeasurement MeasurementQualifier="EqualTo">
  //                                            <Measurement>
  //                                               <MeasurementValue>6.090</MeasurementValue>
  //                                               <UnitOfMeasureCode Domain="UN-Rec-20">C62</UnitOfMeasureCode>
  //                                            </Measurement>
  //                                         </SpecifiedMeasurement>
  //                                      </GrossVolume>
  //                                      <NetWeight>
  //                                         <SpecifiedMeasurement MeasurementQualifier="EqualTo">
  //                                            <Measurement>
  //                                               <MeasurementValue>55.000</MeasurementValue>
  //                                               <UnitOfMeasureCode Domain="UN-Rec-20">LBR</UnitOfMeasureCode>
  //                                            </Measurement>
  //                                         </SpecifiedMeasurement>
  //                                      </NetWeight>
  //                                   </ProductSubLineItems>
  //                                </ShipNoticeProductLineItem>
  //                                <ShipNoticeProductLineItem>
  //                                   <LineNumber>900002</LineNumber>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="UPC">190794218009</ProductIdentifier>
  //                                      <ProductName>A3253 N/A 140M CONV</ProductName>
  //                                      <ProductDescription>000000000012663289</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="EAN">000000000012663289</ProductIdentifier>
  //                                      <ProductName>A3253 N/A 140M CONV</ProductName>
  //                                      <ProductDescription>000000000012663289</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ProductIdentification>
  //                                      <ProductIdentifier Agency="AGIIS-ProductID">00190794218009</ProductIdentifier>
  //                                      <ProductName>A3253 N/A 140M CONV</ProductName>
  //                                      <ProductDescription>000000000012663289</ProductDescription>
  //                                   </ProductIdentification>
  //                                   <ShippedQuantity>
  //                                      <Measurement>
  //                                         <MeasurementValue>150.000</MeasurementValue>
  //                                         <UnitOfMeasureCode Domain="UN-Rec-20">BG</UnitOfMeasureCode>
  //                                      </Measurement>
  //                                   </ShippedQuantity>
  //                                   <PurchaseOrderInformation>
  //                                      <DocumentReference>
  //                                         <DocumentIdentifier>4198029/22-TEST</DocumentIdentifier>
  //                                         <ReferenceItem>50</ReferenceItem>
  //                                      </DocumentReference>
  //                                   </PurchaseOrderInformation>
  //                                   <ReferenceInformation ReferenceType="SalesOrderReference">
  //                                      <DocumentReference>
  //                                         <DocumentIdentifier>0002171990</DocumentIdentifier>
  //                                      </DocumentReference>
  //                                   </ReferenceInformation>
  //                                   <ProductSubLineItems>
  //                                      <SubLineItemNumber>1</SubLineItemNumber>
  //                                      <ManufacturingIdentificationDetails>
  //                                         <ManufacturingIdentificationType>Lot</ManufacturingIdentificationType>
  //                                         <ManufacturingIdentificationNumber>TEST01SR02</ManufacturingIdentificationNumber>
  //                                      </ManufacturingIdentificationDetails>
  //                                      <GrossVolume>
  //                                         <SpecifiedMeasurement MeasurementQualifier="EqualTo">
  //                                            <Measurement>
  //                                               <MeasurementValue>15.000</MeasurementValue>
  //                                               <UnitOfMeasureCode Domain="UN-Rec-20">BG</UnitOfMeasureCode>
  //                                            </Measurement>
  //                                         </SpecifiedMeasurement>
  //                                      </GrossVolume>
  //                                      <NetWeight>
  //                                         <SpecifiedMeasurement MeasurementQualifier="EqualTo">
  //                                            <Measurement>
  //                                               <MeasurementValue>750.000</MeasurementValue>
  //                                               <UnitOfMeasureCode Domain="UN-Rec-20">LBR</UnitOfMeasureCode>
  //                                            </Measurement>
  //                                         </SpecifiedMeasurement>
  //                                      </NetWeight>
  //                                   </ProductSubLineItems>
  //                                </ShipNoticeProductLineItem>
  //                             </ShipNoticeDetails>
  //                          </ShipNoticeBody>
  //                       </ShipNoticeListDetails>
  //                    </ShipNoticeListBody>
  //                 </ShipNoticeList>
  //              </ag:xmlPayload>
  //           </ag:outboundData>
  //        </soapenv:Body>
  //     </soapenv:Envelope>
  //     `;

  //   buildShipNoticeListRequest({ technologyId, name, monsantoUserData }).then((shipNoticeListRequest) => {
  //     //  console.log(shipNoticeListRequest);
  //   });

  //   const parsedXML = await parseXmlStringPromise(content);
  //   const jsonResponse = await parseShipNoticeListResponse(parsedXML);

  //   if (jsonResponse.length > 0) {
  //     await Promise.all(
  //       jsonResponse.map((shipNotice) => {
  //         if (shipNotice.shipNoticeDetails.length > 0) {
  //           shipNotice.shipNoticeDetails.forEach(async (detail, index) => {
  //             const { shippedQuantity, productSubLineItems, product, lineNumber } = detail;

  //             await MonsantoProduct.findOne({
  //               where: {
  //                 organizationId: req.user.organizationId,
  //                 crossReferenceId: product.productId,
  //               },
  //             }).then(async (res) => {
  //               if (!res && res === null) {
  //                 await emaildata.push({ productDetail: product.productName, productId: product.productId });
  //                 MonsantoProduct.findOne({
  //                   where: {
  //                     organizationId: req.user.organizationId,
  //                     id: `99999${req.user.organizationId}`,
  //                   },
  //                 }).then(async (res) => {
  //                   if (res && res !== null) {
  //                     await MonsantoLot.findAll({
  //                       where: {
  //                         organizationId: req.user.organizationId,
  //                         shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
  //                         deliveryNoteNumber: shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
  //                         lotNumber: productSubLineItems.lotNumber,
  //                         lineNumber: lineNumber,
  //                         monsantoProductId: `99999${req.user.organizationId}`,
  //                       },
  //                     }).then(async (arrayData) => {
  //                       MonsantoLot.create({
  //                         quantity: shippedQuantity.value,
  //                         receivedQty: shippedQuantity.value,
  //                         organizationId: req.user.organizationId,
  //                         lotNumber: productSubLineItems.lotNumber,
  //                         crossReferenceId: product.productId,
  //                         monsantoProductId: `99999${req.user.organizationId}`,
  //                         grossVolume:
  //                           productSubLineItems.grossVolume.value +
  //                           ' ' +
  //                           productSubLineItems.grossVolume.unitOfMeasureCode,
  //                         netWeight:
  //                           productSubLineItems.netWeight.value + ' ' + productSubLineItems.netWeight.unitOfMeasureCode,
  //                         source: 'Monsanto Seed Company',
  //                         lineNumber: lineNumber,
  //                         shipDate: shipNotice.shipNoticeProperties.shipDate,
  //                         deliveryDate: shipNotice.shipNoticeProperties.deliveryDate,
  //                         shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
  //                         deliveryNoteNumber: shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
  //                         isNew: arrayData && arrayData.length > 0 ? false : true,
  //                         isDeleted: false,
  //                       });
  //                     });
  //                   }
  //                 });
  //               } else {
  //                 await MonsantoLot.findAll({
  //                   where: {
  //                     organizationId: req.user.organizationId,
  //                     shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
  //                     deliveryNoteNumber: shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
  //                     lotNumber: productSubLineItems.lotNumber,
  //                     lineNumber: lineNumber,
  //                     monsantoProductId: res ? res.dataValues.id : null,
  //                   },
  //                 }).then((arrayData) => {
  //                   MonsantoLot.create({
  //                     quantity: shippedQuantity.value,
  //                     receivedQty: shippedQuantity.value,
  //                     organizationId: req.user.organizationId,
  //                     lotNumber: productSubLineItems.lotNumber,
  //                     crossReferenceId: product.productId,
  //                     lineNumber: lineNumber,
  //                     monsantoProductId: res ? res.dataValues.id : '',
  //                     lineNumber: lineNumber,
  //                     grossVolume:
  //                       productSubLineItems.grossVolume.value + ' ' + productSubLineItems.grossVolume.unitOfMeasureCode,
  //                     netWeight:
  //                       productSubLineItems.netWeight.value + ' ' + productSubLineItems.netWeight.unitOfMeasureCode,
  //                     source: 'Monsanto Seed Company',
  //                     shipDate: shipNotice.shipNoticeProperties.shipDate,
  //                     deliveryDate: shipNotice.shipNoticeProperties.deliveryDate,
  //                     shipNotice: shipNotice.shipNoticeProperties.shipmentIdentification,
  //                     deliveryNoteNumber: shipNotice.shipNoticeProperties.referenceInformation[0].DeliveryNoteNumber,
  //                     isNew: arrayData && arrayData.length > 0 ? false : true,
  //                     isDeleted: false,
  //                   });
  //                 });
  //               }
  //             });
  //           });
  //         }
  //       }),
  //     ).catch((e) => {
  //       console.log(e, 'error from monsanto Ship notice');
  //     });
  //   }
  //   res.json(jsonResponse);
};

module.exports.list = async (req, res) => {
  MonsantoLot.findAll({
    where: {
      organizationId: req.user.organizationId,
      isDeleted: {
        [Op.or]: [false, null],
      },
    },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: MonsantoProduct,
        as: 'Product',
      },
    ],
  })
    .then((response) => {
      console.log(response.length);
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: 'Something went wrong!' });
    });
};

// router.patch('/:id', (req, res, next) => {
module.exports.updateAcceptStatus = async (req, res) => {
  try {
    const { ids, isAccepted } = req.body;
    await Promise.all(
      ids.map(async (id) => {
        if (isAccepted) {
          await MonsantoLot.findOne({
            where: {
              id: id,
              organizationId: req.user.organizationId,
            },
          }).then((monsantoLot) => {
            return MonsantoLot.findAll({
              where: {
                organizationId: req.user.organizationId,
                shipNotice: monsantoLot.shipNotice,
                lotNumber: monsantoLot.lotNumber,
                deliveryNoteNumber: monsantoLot.deliveryNoteNumber,
                monsantoProductId: monsantoLot.monsantoProductId,
                //
                id: { $ne: id },
              },
              order: [['createdAt', 'ASC']],
            }).then((result) => {
              console.log(result, 'result');
              if (result.length > 0) {
                return result.forEach((result1) => {
                  return result1.update({ isDeleted: true });
                });
              }
            });
          });
        }
        return await MonsantoLot.update(
          { isAccepted: isAccepted, isNew: false, isDeleted: isAccepted ? false : true },
          {
            where: {
              id: id,
              organizationId: req.user.organizationId,
            },
          },
        );
      }),
    );
    res.json('done');
  } catch (error) {
    console.log('error : ', error);
    res.status(422).json({ error: 'Error updating received Qty' });
  }
};
