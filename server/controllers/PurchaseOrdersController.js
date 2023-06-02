const { Router } = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const request = require('request-promise');
const config = require('config').getConfig();
const {
  productBooking: { buildProductBookingRequest, parseProductBookingResponse },
  common: { parseXmlStringPromise },
} = require('utilities/xml');
const authMiddleware = require('middleware/userAuth');
const getMonsantoId = require('middleware/getMonsantoId');
const {
  Customer,
  PurchaseOrder,
  Payment,
  Product,
  MonsantoProduct,
  MonsantoProductLineItem,
  DeliveryReceipt,
  CustomerProduct,
  CustomerMonsantoProduct,
  CustomerCustomProduct,
  CustomProduct,
  DeliveryReceiptDetails,
  SeedCompany,
  Company,
  SeedSize,
  Packaging,
  ProductPackaging,
  Farm,
  ApiSeedCompany,
  Lot,
  CustomLot,
  Note,
  CustomEarlyPay,
  MonsantoLot,
  AdvanceOrderTemplate,
  Shareholder,
  // Organization
} = require('models');
const deliveryReceiptController = require('./DeliveryReceiptController');
const customerMonsantoProductsController = require('./CustomerMonsantoProductsController');
const MonsantoProductBookingController = require('./MonsantoProductBookingsController');
const paymentsController = require('./PaymentsController');
const { filterDeletedListResponse, getLastUpdatedDate } = require('utilities');

// Generic Functions
async function makeProductBookingRequest({
  orders,
  organizationName,
  seedDealerMonsantoId,
  isDealerBucket,
  monsantoUserData,
}) {
  try {
    const xmlStrinRgequest = await buildProductBookingRequest({
      seedDealerMonsantoId,
      organizationName,
      orders,
      isDealerBucket,
      monsantoUserData,
    });
    console.log(xmlStrinRgequest, 'xmlStrinRgequest');
    return xmlStrinRgequest;
  } catch (e) {
    console.log(e);
    // return e
  }
}

const router = (module.exports = Router()
  .use(authMiddleware)
  .use('/:purchase_order_id/delivery_receipts', deliveryReceiptController)
  .use('/:purchase_order_id/payments', paymentsController));

router.get('/', (req, res, next) => {
  PurchaseOrder.all({
    where: {
      organizationId: req.user.organizationId,
    },
    include: [
      {
        model: Note,
        where: { isDeleted: false },
        separate: true,
      },
      {
        model: CustomEarlyPay,
        where: { purchaseOrderId: req.params.id },
        separate: true,
      },
      {
        model: CustomerProduct,
        where: { isDeleted: false },

        separate: true,
        include: [
          {
            model: Product,
            include: [
              {
                model: SeedCompany,
                as: 'SeedCompany',
              },
            ],
            // where: defaultSeasonWhere,
          },
          {
            model: Farm,
          },
        ],
      },
      {
        model: CustomerMonsantoProduct,
        where: { isDeleted: false },

        separate: true,
        include: [
          {
            model: MonsantoProduct,
            // where: defaultSeasonWhere,
          },
        ],
      },
      {
        model: CustomerCustomProduct,
        where: { isDeleted: false },

        separate: true,
        include: [
          {
            model: CustomProduct,
            include: [{ model: Company, as: 'Company' }],
          },
        ],
      },
    ],
  })
    .then((purchaseOrders) => res.json(filterDeletedListResponse(purchaseOrders)))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error fetching purchase orders' });
    });
});

router.get('/last_update', (req, res) => {
  PurchaseOrder.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"PurchaseOrder"."updatedAt" DESC'),
    limit: 1,
  })
    .then((purchaseOrders) => {
      let lastUpdate = (purchaseOrders[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

router.get('/detail/:id', async (req, res, next) => {
  try {
    // const organization = await Organization.findOne({
    //   where: {
    //     id: req.user.organizationId
    //   },
    //   attributes: ["defaultSeason"]
    // });
    // const { defaultSeason } = organization;
    // const defaultSeasonWhere = {
    //   $or: [
    //     {
    //       seasonId: null
    //     },
    //     {
    //       seasonId: defaultSeason
    //     }
    //   ]
    // };
    const purchaseOrder = await PurchaseOrder.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
      include: [
        {
          model: ProductPackaging,
          where: { purchaseOrderId: req.params.id },
          separate: true,
        },

        {
          model: Payment,
          separate: true,
        },

        {
          model: Customer,
          include: [
            { model: PurchaseOrder }, // do we neeed this?
            { model: Farm },
          ],
        },
        {
          model: Note,
          where: { isDeleted: false },
          separate: true,
        },
        {
          model: CustomerProduct,

          where: { isDeleted: false },

          separate: true,
          include: [
            {
              model: Product,
              // where: defaultSeasonWhere,
              include: [
                {
                  model: SeedCompany,
                  include: [{ model: SeedSize }, { model: Packaging }],
                },
                {
                  model: ProductPackaging,
                  include: [{ model: PurchaseOrder, where: { id: req.params.id } }],
                },
                { model: Lot, as: 'lots' },
              ],
            },
            {
              model: Farm,
            },
          ],
        },
        {
          model: CustomerMonsantoProduct,
          where: { isDeleted: false },

          separate: true,
          include: [
            {
              model: MonsantoProduct,
              // where: defaultSeasonWhere,
              include: [
                {
                  model: MonsantoProductLineItem,
                  as: 'LineItem',
                  // where: {
                  //   $and: [
                  //     {
                  //       effectiveFrom: {
                  //         $lte: new Date(),
                  //       },
                  //     },
                  //     {
                  //       effectiveTo: {
                  //         $gte: new Date(),
                  //       },
                  //     },
                  //   ],
                  // },
                },
                {
                  model: ApiSeedCompany,
                },
                {
                  model: MonsantoLot,
                  as: 'monsantoLots',
                },
              ],
            },
          ],
        },
        {
          model: CustomerCustomProduct,
          where: { isDeleted: false },

          separate: true,
          include: [
            {
              model: CustomProduct,

              include: [
                { model: CustomLot, as: 'customLots' },
                {
                  model: Company,
                  as: 'Company',
                },
              ],
              // where: defaultSeasonWhere
            },
          ],
        },
        {
          model: DeliveryReceipt,
          separate: true,
          include: [
            {
              model: DeliveryReceiptDetails,
              separate: true,
              attributes: [
                'id',
                'amountDelivered',
                'deliveryReceiptId',
                'lotId',
                'createdAt',
                'customProductId',
                'isDeleted',
              ],
            },
          ],
        },
        {
          model: CustomEarlyPay,
          where: { purchaseOrderId: req.params.id },
          separate: true,
        },
      ],
    });
    if (purchaseOrder) {
      let purchaseOrderTotalPayment = 0.0;

      purchaseOrder.CustomerMonsantoProducts.filter((item) => item.pickLaterProductId == null).map((item) => {
        purchaseOrderTotalPayment +=
          (item.isPickLater == true ? item.pickLaterQty : item.orderQty) *
          (item.msrpEdited ? parseFloat(item.msrpEdited) : item.price);
      });
      purchaseOrder.CustomerMonsantoProducts.map(
        (customerMonsantoProduct) =>
          !customerMonsantoProduct.isDeleted ||
          (customerMonsantoProduct.isDeleted && !customerMonsantoProduct.isDeleteSynced),
      );

      let purchaseOrderTotalDelivery = 0.0;
      let purchaseOrderTotalPaid = 0.0;
      let purchaseOrderTotalDelivered = 0.0;
      purchaseOrder.CustomerProducts.forEach((customerProduct) => {
        purchaseOrderTotalPayment +=
          customerProduct.orderQty *
          (customerProduct.msrpEdited
            ? parseFloat(customerProduct.msrpEdited)
            : customerProduct.Product
            ? customerProduct.Product.msrp
            : 0);
        purchaseOrderTotalDelivery += customerProduct.orderQty;
      });
      purchaseOrder.CustomerCustomProducts.forEach((CustomerCustomProduct) => {
        purchaseOrderTotalPayment +=
          CustomerCustomProduct.orderQty *
          (CustomerCustomProduct.msrpEdited
            ? CustomerCustomProduct.msrpEdited
            : CustomerCustomProduct.CustomProduct
            ? CustomerCustomProduct.CustomProduct.costUnit
            : 0.0);
        purchaseOrderTotalDelivery += CustomerCustomProduct.orderQty;
      });
      purchaseOrderTotalDelivered += purchaseOrder.DeliveryReceipts.reduce(
        (totalSum, receipt) =>
          totalSum + receipt.DeliveryReceiptDetails.reduce((itemSum, detail) => itemSum + detail.amountDelivered, 0),
        0,
      );
      purchaseOrderTotalPaid += purchaseOrder.Payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      res.json({
        ...purchaseOrder.toJSON(),
        purchaseOrderTotalPayment,
        purchaseOrderTotalDelivery,
        purchaseOrderTotalPaid,
        purchaseOrderTotalDelivered,
      });
    } else {
      res.status(422).json({ errors: 'no order found' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(422).json({ errors: err.message });
  }
});

router.post('/orderTemplate', async (req, res) => {
  await PurchaseOrder.findAll({
    where: { organizationId: req.user.organizationId, isSimple: false, isDeleted: false },
    attributes: ['id', 'name', 'farmData', 'customerId'],

    raw: true,
  }).then(async (data) => {
    await Promise.all([
      data.map(async (s) => {
        s.farmData.map(async (f) => {
          const farmName = await Farm.findOne({ where: { id: f.farmId }, raw: true });

          if (farmName) {
            const isExit = await AdvanceOrderTemplate.findOne({
              where: {
                farmName: farmName.name,
                farmId: f.farmId,
                orderName: s.name,
                orderId: s.id,
                customerId: s.customerId,

                organizationId: req.user.organizationId,
              },
            });

            if (!isExit) {
              AdvanceOrderTemplate.create({
                farmName: farmName.name,
                farmId: f.farmId,
                orderName: s.name,
                orderId: s.id,
                shareHolderData: farmName.shareholderData,
                customerId: s.customerId,

                organizationId: req.user.organizationId,
              });
            } else {
              const isHolderSame =
                JSON.stringify(isExit.dataValues.shareHolderData) == JSON.stringify(farmName.shareholderData);
              if (!isHolderSame) {
                AdvanceOrderTemplate.update(
                  {
                    farmName: farmName.name,

                    orderName: s.name,

                    shareHolderData: farmName.shareholderData,
                  },
                  {
                    where: {
                      id: isExit.dataValues.id,
                    },
                  },
                );
              }
            }
          }
        });
      }),
    ])
      .then(() => {
        res.status(200).json({ msg: 'Create All Record succesfully' });
      })
      .catch((e) => {
        res.status(500).json({ error: e });
      });
  });
});

router.get('/orderTemplate', async (req, res) => {
  AdvanceOrderTemplate.findAll()
    .then(async (data) => {
      res.status(200).json({ data: data });
    })
    .catch((e) => {
      res.status(500).json({ error: e });
    });
});
router.patch('/orderTemplate/:id', async (req, res) => {
  const currentTemplete = await AdvanceOrderTemplate.findOne({ where: { id: req.params.id }, raw: true });

  await AdvanceOrderTemplate.update(req.body, { where: { id: req.params.id } }).then(async (data) => {
    await Promise.all([
      req.body.shareHolderData
        .filter((s) => s.shareholderId != 'theCustomer')
        .map((s) => {
          Shareholder.update(
            {
              name: s.name,
            },
            { where: { id: s.shareholderId } },
          );
        }),
    ]).then(async () => {
      await Farm.update(
        {
          name: req.body.farmName,
          shareholderData: req.body.shareHolderData,
        },
        { where: { id: req.body.farmId } },
      );

      await PurchaseOrder.update(
        {
          name: req.body.orderName,
        },
        { where: { id: currentTemplete.orderId } },
      );
    });

    return res.json({ data: data });
  });
});
router.delete('/orderTemplate/:id', async (req, res) => {
  AdvanceOrderTemplate.destroy({ where: { id: req.params.id } }).then((rowsDeleted) => {
    res.json({ id: req.params.id });
  });
});

router.post('/:id/confirm_monsanto_orders', getMonsantoId, MonsantoProductBookingController.create);
router.post('/all/confirm_all_monsanto_orders', getMonsantoId, MonsantoProductBookingController.createAll);

// router.post(
//   "/deleteinvoices",
//   getMonsantoId,
//   MonsantoProductBookingController.deleteAllInvoices
// );

router.post('/deleteinvoices', getMonsantoId, async (req, res) => {
  try {
    const productBookingDetails = req.body.detail.map((order) => {
      return `<ProductBookingProductLineItem>
        <LineNumber>999999</LineNumber>
        <ActionRequest>Delete</ActionRequest>
        <LineItemType>Sale</LineItemType>
        <ProductBookingOrderLineItemNumber>${order.productBookingLineItemNumber.replace(
          /^0+/,
          '',
        )}</ProductBookingOrderLineItemNumber>
        <ProductIdentification>
            <ProductIdentifier Agency="AGIIS-ProductID">${order.identification.identifier}</ProductIdentifier>
        </ProductIdentification>
        <ReferenceInformation ReferenceType="ContractNumber">
            <DocumentReference>
                <DocumentIdentifier>1</DocumentIdentifier>
            </DocumentReference>
        </ReferenceInformation>
        <IncreaseOrDecrease>
            <IncreaseOrDecreaseType>Decrease</IncreaseOrDecreaseType>
            <ProductQuantityChange>
                <Measurement>
                    <MeasurementValue>0</MeasurementValue>
                    <UnitOfMeasureCode Domain="UN-Rec-20">${order.quantity.unit}</UnitOfMeasureCode>
                </Measurement>
            </ProductQuantityChange>
        </IncreaseOrDecrease>
        <ProductQuantity>
            <Measurement>
                <MeasurementValue>${order.quantity.value}</MeasurementValue>
                <UnitOfMeasureCode Domain="UN-Rec-20">${order.quantity.unit}</UnitOfMeasureCode>
            </Measurement>
        </ProductQuantity>
        <RequestedShipDateTime>
            <DateTimeInformation>
                <DateTime DateTimeQualifier="After">2021-04-05T12:15:30Z</DateTime>
            </DateTimeInformation>
        </RequestedShipDateTime>
        <SpecialInstructions InstructionType="General">Plant Early</SpecialInstructions>
      </ProductBookingProductLineItem>`;
    });

    const str = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:urn1="urn:cidx:names:specification:ces:schema:all:5:3" xmlns:urn="urn:aggateway:names:ws:docexchange" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Header>
            <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                <wsse:UsernameToken xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="UsernameToken-BAFF8E68A8D786C41314389777816581">
                    <wsse:Username>3350963</wsse:Username>
                    <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">USITsup$3</wsse:Password>
                </wsse:UsernameToken>
            </wsse:Security>
        </soapenv:Header>
        <soapenv:Body>
            <urn:inboundData>
                <urn:businessProcess>ProductBookingWS53</urn:businessProcess>
                <urn:processStep>ProductBookingWSRequest</urn:processStep>
                <urn:partnerId>1100032937530</urn:partnerId>
                <urn:partnerType>AGIIS-EBID</urn:partnerType>
                <urn:conversationId/>
                <urn:messageId>Test-ProductBooking5.3-1</urn:messageId>
                <urn:xmlPayload>
                    <ProductBooking xsi:schemaLocation="urn:cidx:names:specification:ces:schema:all:5:3 file:///Y:/B2B/SC-II/5.3/Chem_eStandards_5.3_FINAL_QA_2013-09-30a.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:cidx:names:specification:ces:schema:all:5:3">
                        <Header>
                            <ThisDocumentIdentifier>
                                <DocumentIdentifier>TEST-PB_1000</DocumentIdentifier>
                            </ThisDocumentIdentifier>
                            <ThisDocumentDateTime>
                                <DateTime DateTimeQualifier="On">2021-03-09T12:15:30Z</DateTime>
                            </ThisDocumentDateTime>
                            <From>
                                <PartnerInformation>
                                    <PartnerName>SHAWN SULLIVAN SEED</PartnerName>
                                    <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
                                    <ContactInformation>
                                        <ContactName>WS-XML</ContactName>
                                        <ContactDescription>DataSource</ContactDescription>
                                    </ContactInformation>
                                    <ContactInformation>
                                        <ContactName>2021</ContactName>
                                        <ContactDescription>SeedYear</ContactDescription>
                                    </ContactInformation>
                                    <ContactInformation>
                                        <ContactName>AgriDealer</ContactName>
                                        <ContactDescription>SoftwareName</ContactDescription>
                                    </ContactInformation>
                                    <ContactInformation>
                                        <ContactName>1.0.0</ContactName>
                                        <ContactDescription>SoftwareVersion</ContactDescription>
                                    </ContactInformation>
                                </PartnerInformation>
                            </From>
                            <To>
                                <PartnerInformation>
                                    <PartnerName>BAYER AGRICULTURAL CO</PartnerName>
                                    <PartnerIdentifier Agency="AGIIS-EBID">0062668030000</PartnerIdentifier>
                                </PartnerInformation>
                            </To>
                        </Header>
                        <ProductBookingBody>
                            <ProductBookingProperties>
                                <ProductBookingType>Cancelled</ProductBookingType>
                                <ProductBookingOrderNumber>${req.body.orderNumber}</ProductBookingOrderNumber>
                                <ProductBookingOrderTypeCode Domain="ANSI-ASC-X12-92">KN</ProductBookingOrderTypeCode>
                                <ProductBookingOrderIssuedDate>
                                    <DateTime DateTimeQualifier="On">2021-03-09T12:15:30Z</DateTime>
                                </ProductBookingOrderIssuedDate>
                                <LanguageCode Domain="ISO-639-2T">EN</LanguageCode>
                                <CurrencyCode Domain="ISO-4217">USD</CurrencyCode>
                                <BuyerSequenceNumber>0</BuyerSequenceNumber>
                                <SoftwareInformation>
                                    <SoftwareSource>AgriDealer</SoftwareSource>
                                    <SoftwareVersion>1.0.0</SoftwareVersion>
                                </SoftwareInformation>
                                <ProductYear>2021</ProductYear>
                                <ReferenceInformation ReferenceType="SalesOrderReference">
                                    <DocumentReference>
                                        <DocumentIdentifier>${req.body.crossRefIdentifier}</DocumentIdentifier>
                                    </DocumentReference>
                                </ReferenceInformation>
                                <DirectShipFlag>0</DirectShipFlag>
                                <SpecialInstructions InstructionType="MarkingInstructions">West Farm</SpecialInstructions>
                            </ProductBookingProperties>
                            <ProductBookingPartners>
                                <Buyer>
                                    <PartnerInformation>
                                        <PartnerName>SHAWN SULLIVAN SEED</PartnerName>
                                        <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
                                        <AddressInformation>
                                            <AddressLine>74971 AVENUE 358</AddressLine>
                                            <CityName>WALLACE</CityName>
                                            <StateOrProvince>NE</StateOrProvince>
                                            <PostalCode>69169</PostalCode>
                                            <PostalCountry>US</PostalCountry>
                                        </AddressInformation>
                                    </PartnerInformation>
                                </Buyer>
                                <Seller>
                                    <PartnerInformation>
                                        <PartnerName>BAYER AGRICULTURAL CO</PartnerName>
                                        <PartnerIdentifier Agency="AGIIS-EBID">0062668030000</PartnerIdentifier>
                                    </PartnerInformation>
                                </Seller>
                                <ShipTo>
                                    <PartnerInformation>
                                        <PartnerName> BOYD GIGAX</PartnerName>
                                        <PartnerIdentifier Agency="GLN">1100031728863</PartnerIdentifier>
                                        <ContactInformation/>
                                        <AddressInformation>
                                            <AddressLine></AddressLine>
                                            <CityName></CityName>
                                            <StateOrProvince>NE</StateOrProvince>
                                            <PostalCode>69032</PostalCode>
                                            <PostalCountry>US</PostalCountry>
                                        </AddressInformation>
                                    </PartnerInformation>
                                </ShipTo>
                                <SoldTo>
                                    <PartnerInformation>
                                        <PartnerName>SHAWN SULLIVAN SEED</PartnerName>
                                        <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
                                    </PartnerInformation>
                                </SoldTo>
                                <Payer>
                                    <PartnerInformation>
                                        <PartnerName>SHAWN SULLIVAN SEED</PartnerName>
                                        <PartnerIdentifier Agency="AGIIS-EBID">1100032937530</PartnerIdentifier>
                                    </PartnerInformation>
                                </Payer>
                                <OtherPartner PartnerRole="FinancialInstitution">
                                    <PartnerInformation>
                                        <PartnerName>ABC FARM CMT</PartnerName>
                                        <PartnerIdentifier Agency="AssignedBySeller">386981</PartnerIdentifier>
                                        <AddressInformation>
                                            <AddressLine>PO BOX 188</AddressLine>
                                            <CityName>JEFFERSON</CityName>
                                            <StateOrProvince>IA</StateOrProvince>
                                            <PostalCode>50129-0188</PostalCode>
                                            <PostalCountry>US</PostalCountry>
                                        </AddressInformation>
                                    </PartnerInformation>
                                </OtherPartner>
                                <OtherPartner PartnerRole="SellingPartner">
                                    <PartnerInformation>
                                        <PartnerName>JOE SMITH</PartnerName>
                                        <PartnerIdentifier Agency="AssignedByBuyer">1234567</PartnerIdentifier>
                                    </PartnerInformation>
                                </OtherPartner>
                            </ProductBookingPartners>
                            <ProductBookingDetails>
                                ${productBookingDetails.join('')}
                            </ProductBookingDetails>
                        </ProductBookingBody>
                    </ProductBooking>
                </urn:xmlPayload>
            </urn:inboundData>
        </soapenv:Body>
    </soapenv:Envelope>`;

    // const xmlStringRequest = await makeProductBookingRequest(monsantoRequest);
    const response = await request.post(config.monsantoEndPoint, {
      'content-type': 'text/plain',
      body: str,
    });
    const responseString = await parseXmlStringPromise(response);
    const monsantoResponse = await parseProductBookingResponse(responseString);
    res.send('synced');
  } catch (err) {
    console.log('err', err);
    res.json({
      err,
      synced: false,
    });
  }
});
