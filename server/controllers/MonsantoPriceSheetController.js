const request = require('request-promise');
const config = require('config').getConfig();
const {
  common: { parseXmlStringPromise },
  products: { parsePriceSheetResponse, buildPriceSheetRequest },
} = require('utilities/xml');
const { Op } = require('sequelize');

const {
  MonsantoProductLineItem,
  MonsantoProduct,
  MonsantoPriceSheet,
  sequelize,
  User,
  ApiSeedCompany,
} = require('models');

module.exports.addZoneId = async (req, res) => {
  try {
    const { cropType, newzoneId } = req.body;
    if (newzoneId && cropType) {
      const user = await User.findOne({ where: { email: req.user.email } });
      const apiseedCompany = await ApiSeedCompany.findOne({
        where: { organizationId: user.organizationId },
      });
      const oldZoneIds = JSON.parse(apiseedCompany.zoneIds);
      const newZoneIds = oldZoneIds.map((item) => {
        if (item.classification === cropType.toUpperCase()) {
          if (Array.isArray(item.zoneId)) {
            return { ...item, zoneId: [...item.zoneId, newzoneId] };
          } else if (typeof item.zoneId === 'string') {
            const newArray = [];
            newArray.push(item.zoneId);
            return { ...item, zoneId: [...newArray, newzoneId] };
          }
        } else {
          return item;
        }
      });
      await apiseedCompany.update({ zoneIds: JSON.stringify(newZoneIds) });
      res.send('success');
    } else {
      res.status(422).json({ errors: 'Invalid cropType and zoneId' });
    }
  } catch (e) {
    console.log('error : ', e);
    res.status(422).json({ errors: 'Error at add zones' });
  }
};

module.exports.deleteZoneId = async (req, res) => {
  try {
    const { cropType, zoneId } = req.body;

    if (zoneId && cropType) {
      const user = await User.findOne({ where: { email: req.user.email } });
      const apiseedCompany = await ApiSeedCompany.findOne({
        where: { organizationId: user.organizationId },
      });
      const oldZoneIds = JSON.parse(apiseedCompany.zoneIds);
      const newList = oldZoneIds.map((item) => {
        if (item.classification === cropType.toUpperCase()) {
          if (Array.isArray(item.zoneId)) {
            const data = item.zoneId.filter((zone) => zone !== zoneId);
            if (data.length === 1) {
              item.zoneId = data[0];
            } else {
              item.zoneId = data;
            }
          }
          return item;
        } else {
          return item;
        }
      });
      apiseedCompany.update({ zoneIds: JSON.stringify(newList) });
      res.send('success');
    } else {
      res.status(422).json({ errors: 'Invalid cropType and zoneId' });
    }
  } catch (e) {
    console.log('error : ', e);
    res.status(422).json({ errors: 'Error at add zones' });
  }
};

module.exports.getZoneIds = async (req, res) => {
  try {
    const { cropType } = req.query;
    const user = await User.findOne({ where: { email: req.user.email } });
    const apiseedCompany = await ApiSeedCompany.findOne({
      where: { organizationId: user.organizationId },
    });

    const updated =
      cropType !== undefined &&
      JSON.parse(apiseedCompany.zoneIds).filter((item) => item.classification === cropType.toUpperCase());
    let zoneIds = [];

    if (Array.isArray(updated && updated.length > 0 && updated[0].zoneId)) {
      zoneIds = [...updated[0].zoneId];
    } else {
      zoneIds.push(updated[0].zoneId);
    }
    res.json(zoneIds);
  } catch (e) {
    console.log('error : ', e);
    res.status(422).json({ errors: `Error getting zones ${e}` });
  }
};

module.exports.requestPriceSheet = async (req, res) => {
  try {
    const { cropType, zoneId, seedDealerMonsantoId } = req.body;
    const checkPriceSheetExistance = await MonsantoPriceSheet.findOne({
      where: {
        buyerMonsantoId: seedDealerMonsantoId,
        cropType,
        zoneId,
      },
    });
    const monsantoUserData = await ApiSeedCompany.findOne({
      where: { organizationId: req.user.organizationId },
    });

    const priceSheetRequest = await buildPriceSheetRequest({
      user: req.user,
      cropType,
      zoneId,
      lastRequest:
        checkPriceSheetExistance.dataValues !== undefined
          ? JSON.parse(checkPriceSheetExistance.dataValues.lastUpdateDate)
          : process.env.PRICESHEETDEFAULTDATE,

      seedDealerMonsantoId,
      monsantoUserData,
    });
    const xmlResponseString = await request.post(config.monsantoEndPoint, {
      'content-type': 'text/plain',
      body: priceSheetRequest,
    });
    const parsedString = await parseXmlStringPromise(xmlResponseString);
    const priceSheetData = await parsePriceSheetResponse(parsedString, cropType);
    res.send(priceSheetData);
  } catch (error) {
    console.log('error', error);
    res.send(error);
  }
};

// request to get zoneIDs assigned to specific seed dealer
module.exports.fetchPriceSheet = async ({
  user,
  cropType = 'C',
  zoneId = 'AB',
  lastRequest = process.env.PRICESHEETDEFAULTDATE,
  seedDealerMonsantoId = 1100032937530,
  seedCompanyId = 13,
}) => {
  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  const monsantoUserData = await ApiSeedCompany.findOne({
    where: { organizationId: user.organizationId },
  });

  let priceSheet;
  const checkPriceSheetExistance = await MonsantoPriceSheet.findOne({
    where: {
      buyerMonsantoId: seedDealerMonsantoId,
      cropType,
      zoneId,
    },
  });
  if (checkPriceSheetExistance) {
    priceSheet = checkPriceSheetExistance.dataValues;
    // if (checkPriceSheetExistance.dataValues.isSyncing) {
    //   return;
    // }
  } else {
    const priceSheetpre = await MonsantoPriceSheet.create({
      buyerMonsantoId: seedDealerMonsantoId,
      sellerMonsantoId: MONSANTO_TECH_ID,
      zoneId,
      cropType,
      isSyncing: true,
      startRequestTimestamp: JSON.stringify(new Date().toISOString()),
    });
    priceSheet = priceSheetpre.dataValues;
  }
  const priceSheetRequest = await buildPriceSheetRequest({
    user,
    cropType,
    zoneId,
    lastRequest:
      priceSheet !== undefined && priceSheet.lastUpdateDate !== null
        ? JSON.parse(priceSheet.lastUpdateDate)
        : process.env.PRICESHEETDEFAULTDATE,
    seedDealerMonsantoId,
    monsantoUserData,
  });
  const xmlResponseString = await request.post(config.monsantoEndPoint, {
    'content-type': 'text/plain',
    body: priceSheetRequest,
  });

  const parsedString = await parseXmlStringPromise(xmlResponseString);
  const priceSheetData = await parsePriceSheetResponse(parsedString, cropType);
  const { identifier, buyerMonsantoId, sellerMonsantoId, productLineItems } = priceSheetData;

  // const { identifier, productLineItems } = priceSheetData;
  const productIDs = new Set();
  const products = [];
  productLineItems.forEach((lineItem) => {
    if (!productIDs.has(lineItem.product.AgiisId)) {
      productIDs.add(lineItem.product.AgiisId);
      products.push(lineItem.product);
    }
  });
  const productMap = {};
  const transaction = await sequelize.transaction();

  try {
    const createProduct = async (product) => {
      let monsantoProduct = await MonsantoProduct.findOne({
        where: {
          crossReferenceId: product.AgiisId,
          organizationId: user.organizationId,
          zoneId: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
        },
      });
      if (!monsantoProduct) {
        return MonsantoProduct.create(
          {
            ...product,
            crossReferenceId: product.AgiisId,
            seedCompanyId: seedCompanyId,
            organizationId: user.organizationId,
            cropType,
            isDeletedInBayer: false,
            zoneId: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
          },
          { transaction },
        ).then(({ dataValues: product }) => {
          productMap[product.crossReferenceId] = product.id;
        });
      }
    };

    const createProductLineItem = async (productLineItem) => {
      const {
        lineNumber,
        crossReferenceProductId,
        effectiveFrom,
        effectiveTo,
        zoneId,
        suggestedDealerPrice,
        suggestedDealerCurrencyCode,
        suggestedDealerMeasurementValue,
        suggestedDealerMeasurementUnitCode,
        suggestedEndUserPrice,
        suggestedEndUserCurrencyCode,
        suggestedEndUserMeasurementValue,
        suggestedEndUserMeasurementUnitCode,
      } = productLineItem;
      const product = await MonsantoProductLineItem.findOne({
        where: {
          productId: productMap[crossReferenceProductId],
          organizationId: user.organizationId,
          zoneId: [zoneId.toString() == '*' ? 'NZI' : zoneId.toString()],
        },
      });
      if (!product) {
        const suggestedDealerPriceJson = {};
        const suggestedEndUserPriceJson = {};
        if (!zoneId.toString()) {
          suggestedDealerPriceJson[`NZI`] = suggestedDealerPrice;
          suggestedEndUserPriceJson[`NZI`] = suggestedEndUserPrice;
        } else {
          suggestedDealerPriceJson[`${zoneId}`] = suggestedDealerPrice;
          suggestedEndUserPriceJson[`${zoneId}`] = suggestedEndUserPrice;
        }
        const newZoneId = [];
        if (!zoneId.toString()) {
          newZoneId.push('NZI');
        } else {
          newZoneId.push(zoneId.toString());
        }

        await MonsantoProductLineItem.create(
          {
            organizationId: user.organizationId,
            zoneId: [...newZoneId],
            lineNumber,
            crossReferenceProductId,
            effectiveFrom: effectiveFrom === 'T00:00:00.000-05:00' ? new Date() : effectiveFrom,
            effectiveTo: effectiveTo === 'T00:00:00.000-05:00' ? new Date() : effectiveTo,
            suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
            suggestedDealerCurrencyCode: JSON.stringify(suggestedDealerCurrencyCode),
            suggestedDealerMeasurementValue,
            suggestedDealerMeasurementUnitCode: JSON.stringify(suggestedDealerMeasurementUnitCode),
            suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
            suggestedEndUserCurrencyCode: JSON.stringify(suggestedEndUserCurrencyCode),
            suggestedEndUserMeasurementValue,
            suggestedEndUserMeasurementUnitCode: JSON.stringify(suggestedEndUserMeasurementUnitCode),
            productId: productMap[crossReferenceProductId],
            cropType: cropType,
          },
          { transaction },
        );
      } else {
        const suggestedDealerPriceJson = {
          ...JSON.parse(product.suggestedDealerPrice),
        };
        const suggestedEndUserPriceJson = {
          ...JSON.parse(product.suggestedEndUserPrice),
        };

        //If DealerPrice and enduser price are not match then not update the table
        if (!zoneId.toString()) {
          suggestedDealerPriceJson[`NZI`] = suggestedDealerPrice;
          suggestedEndUserPriceJson[`NZI`] = suggestedEndUserPrice;
          // newZoneId = [...product.zoneId, 'NZI'];
          if (
            suggestedDealerPriceJson[`NZI`] !== suggestedDealerPrice &&
            suggestedEndUserPriceJson[`NZI`] !== suggestedEndUserPrice
          ) {
            await MonsantoProductLineItem.update(
              {
                suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
                suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
              },
              {
                where: {
                  crossReferenceProductId,
                  productId: productMap[crossReferenceProductId],
                  organizationId: user.organizationId,
                  zoneId: {
                    [Op.contains]: ['NZI'],
                  },
                },
              },
              { transaction },
            );
          }
        } else {
          suggestedDealerPriceJson[`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`] = suggestedDealerPrice;
          suggestedEndUserPriceJson[`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`] = suggestedEndUserPrice;
          // newZoneId = [...product.zoneId, zoneId.toString()];
          if (
            suggestedDealerPriceJson[`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`] !==
              suggestedDealerPrice &&
            suggestedEndUserPriceJson[`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`] !==
              suggestedEndUserPrice
          ) {
            await MonsantoProductLineItem.update(
              {
                suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
                suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
              },
              {
                where: {
                  organizationId: user.organizationId,
                  crossReferenceProductId,
                  productId: productMap[crossReferenceProductId],
                  zoneId: {
                    [Op.contains]: [`${zoneId}`],
                  },
                },
              },
              { transaction },
            );
          }
        }
        // if (!zoneId.toString()) {
        //   newZoneId = [...product.zoneId, 'NZI'];
        // } else {
        //   newZoneId = [...product.zoneId, zoneId.toString()];
        // }
      }
    };

    await Promise.all(products.map(createProduct));
    await Promise.all(productLineItems.map(createProductLineItem));

    await MonsantoPriceSheet.update(
      {
        identifier,
        isSyncing: false,
        endRequestTimestamp: JSON.stringify(new Date().toISOString()),
        lastUpdateDate: productLineItems.length > 0 ? JSON.stringify(new Date().toISOString()) : priceSheet.lastRequest,
      },
      {
        where: { buyerMonsantoId: seedDealerMonsantoId, cropType },
        transaction,
      },
    );

    await transaction.commit();
    return priceSheet;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports.getPriceSheet = async (req, res, next) => {
  try {
    let monsantoProduct = await MonsantoProduct.findAll({
      where: { organizationId: req.user.organizationId },
      include: [
        {
          model: MonsantoProductLineItem,
          as: 'LineItem',
        },
        {
          model: ApiSeedCompany,
        },
      ],
    });
    res.send({ monsantoProduct });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
};

module.exports.patchPriceSheet = async (req, res, next) => {
  try {
    await MonsantoProduct.findById(req.body.id)
      .then((mproduct) => mproduct.update(req.body))
      .then((updatedMonsantoProduct) => res.json(updatedMonsantoProduct))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating monsanto product' });
      });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
};

module.exports.syncLatestPricesheets = async (req, res) => {
  const { seedCompanyId } = req.query;
  const user = req.user.dataValues;
  try {
    const apiseedCompany = await ApiSeedCompany.findOne({
      where: {
        organizationId: user.organizationId,
      },
    });
    zoneIds = JSON.parse(apiseedCompany.dataValues.zoneIds);

    await Promise.all(
      zoneIds.map(async (item) => {
        const cropType = item.classification;
        console.log(cropType, 'cropType');

        const starZoneCropType = ['B'];
        const zoneId = starZoneCropType.includes(cropType) ? '*' : item.zoneId;

        if (Array.isArray(zoneId)) {
          await Promise.all(
            zoneId.map(async (zone) => {
              await fetchLatestPricesheet(
                apiseedCompany,
                cropType,
                zone,
                apiseedCompany.dataValues.technologyId,
                seedCompanyId,
                user.organizationId,
              );
            }),
          );
        } else {
          await fetchLatestPricesheet(
            apiseedCompany,
            cropType,
            zoneId,
            apiseedCompany.dataValues.technologyId,
            seedCompanyId,
            user.organizationId,
          );
        }
      }),
    );
    return res.status(200).json({ status: true, lastUpdateDate: new Date() });
  } catch (error) {
    if (error.message == 'No data found') {
      console.log('No need to request pricesheet because everything is already synced!');
      return res
        .status(200)
        .json({ status: true, msg: 'No need to request pricesheet because everything is already synced!' });
    } else {
      console.log(error.message, 'error from fetch priceSheet');
      return res.status(400).json({ error: error.message });
    }
  }
};

const fetchLatestPricesheet = async (
  company,
  cropType,
  zoneId,
  seedDealerMonsantoId,
  seedCompanyId,
  organizationId,
) => {
  const currentUser = await User.findOne({
    where: {
      organizationId: company.dataValues.organizationId,
    },
  });
  const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
  console.log('i am in fetchLatestPricesheet');
  let priceSheet;
  const checkPriceSheetExistance = await MonsantoPriceSheet.findOne({
    where: {
      buyerMonsantoId: seedDealerMonsantoId,
      cropType,
      zoneId,
    },
  });
  let priceSheetJustCreated = false;
  let lastRequest = process.env.PRICESHEETDEFAULTDATE;
  if (checkPriceSheetExistance) {
    priceSheet = checkPriceSheetExistance.dataValues;
    lastRequest = checkPriceSheetExistance.dataValues.lastUpdateDate;
    // if (checkPriceSheetExistance.dataValues.isSyncing) {
    //   throw new Error(`pricesheet for ${cropType} and ${zoneId} is not synced`);
    // }
  } else {
    const priceSheetpre = await MonsantoPriceSheet.create({
      buyerMonsantoId: seedDealerMonsantoId,
      sellerMonsantoId: MONSANTO_TECH_ID,
      zoneId,
      cropType,
      isSyncing: true,
      startRequestTimestamp: JSON.stringify(new Date().toISOString()),
    });
    priceSheet = priceSheetpre.dataValues;
    priceSheetJustCreated = true;
  }

  if (!priceSheetJustCreated) {
    lastRequest =
      JSON.parse(priceSheet.lastUpdateDate) !== null
        ? new Date(JSON.parse(priceSheet.lastUpdateDate)).toISOString()
        : JSON.stringify(new Date().toISOString());
  }
  // const lastRequest = '2021-08-30T09:18:33.027Z';
  const monsantoUserData = { dataValues: company.dataValues };

  const priceSheetRequest = await buildPriceSheetRequest({
    user: currentUser,
    cropType,
    zoneId,
    seedDealerMonsantoId,
    lastRequest: lastRequest,

    monsantoUserData,
  });

  const xmlResponseString = await request.post(config.monsantoEndPoint, {
    'content-type': 'text/plain',
    body: priceSheetRequest,
  });
  const parsedString = await parseXmlStringPromise(xmlResponseString);
  const priceSheetData = await parsePriceSheetResponse(parsedString, cropType);
  const { productLineItems, identifier } = priceSheetData;

  const productIDs = new Set();
  const products = [];
  const productCrossRefIds = [];
  productLineItems.forEach((lineItem) => {
    if (!productIDs.has(lineItem.product.AgiisId)) {
      productIDs.add(lineItem.product.AgiisId);
      products.push(lineItem.product);
      productCrossRefIds.push(lineItem.product.AgiisId);
    }
  });
  const productMap = {};
  const transaction = await sequelize.transaction();

  const removedProducts = await checkMonsantoRemovedProducts(productCrossRefIds, cropType, organizationId);

  try {
    await Promise.all(
      removedProducts.map((item) => {
        console.log(`bayer has removed ${item} from their database in ${cropType} category`);
        return MonsantoProduct.update(
          {
            isDeletedInBayer: true,
          },
          {
            where: {
              crossReferenceId: item.crossReferenceId,
              isDeletedInBayer: false,
              organizationId: organizationId,
              zoneId: {
                [Op.contains]: [`${item.zoneId.toString()}`],
              },
            },
          },
        );
      }),
    );

    const updateProduct = async (product) => {
      let monsantoProduct = await MonsantoProduct.findOne({
        where: {
          crossReferenceId: product.AgiisId,
          organizationId: organizationId,
          zoneId: {
            [Op.contains]: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
          },
        },
      });

      if (monsantoProduct) {
        productMap[product.AgiisId] = monsantoProduct.id;
        return MonsantoProduct.update(
          {
            ...product,
            crossReferenceId: product.AgiisId,
            seedCompanyId: seedCompanyId,
            organizationId: organizationId,
            cropType,
            isDeletedInBayer: false,
            zoneId: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
          },
          {
            where: {
              crossReferenceId: product.AgiisId,
              organizationId: organizationId,
              zoneId: {
                [Op.contains]: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
              },
            },
          },
          { transaction },
        );
      } else {
        console.log(`new product with ID ${product.AgiisId} found`);

        return MonsantoProduct.create({
          ...product,
          crossReferenceId: product.AgiisId,
          seedCompanyId: seedCompanyId,
          organizationId: organizationId,
          cropType,
          isDeletedInBayer: false,
          zoneId: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
        }).then(({ dataValues: product }) => {
          productMap[product.crossReferenceId] = product.id;
        });
      }
    };
    const createOrUpdateLineItem = async (productLineItem) => {
      const {
        lineNumber,
        crossReferenceProductId,
        effectiveFrom,
        effectiveTo,
        zoneId,
        suggestedDealerPrice,
        suggestedDealerCurrencyCode,
        suggestedDealerMeasurementValue,
        suggestedDealerMeasurementUnitCode,
        suggestedEndUserPrice,
        suggestedEndUserCurrencyCode,
        suggestedEndUserMeasurementValue,
        suggestedEndUserMeasurementUnitCode,
      } = productLineItem;

      const product = await MonsantoProductLineItem.findOne({
        where: {
          crossReferenceProductId,
          productId: productMap[crossReferenceProductId],
          organizationId: organizationId,
          zoneId: {
            [Op.contains]: [zoneId.toString() == '*' ? 'NZI' : zoneId.toString()],
          },
        },
      });
      if (!product) {
        const suggestedDealerPriceJson = {};
        const suggestedEndUserPriceJson = {};
        if (zoneId && !zoneId.toString()) {
          suggestedDealerPriceJson[`NZI`] = suggestedDealerPrice;
          suggestedEndUserPriceJson[`NZI`] = suggestedEndUserPrice;
        } else {
          suggestedDealerPriceJson[`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`] = suggestedDealerPrice;
          suggestedEndUserPriceJson[`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`] = suggestedEndUserPrice;
        }
        const newZoneId = [];
        if (!zoneId.toString()) {
          newZoneId.push('NZI');
        } else {
          if (zoneId.toString !== '') {
            newZoneId.push(zoneId.toString() == '*' ? 'NZI' : zoneId.toString());
          }
        }

        await MonsantoProductLineItem.create(
          {
            organizationId: organizationId,
            zoneId: [...newZoneId],
            lineNumber,
            crossReferenceProductId,
            effectiveFrom: effectiveFrom === 'T00:00:00.000-05:00' ? new Date() : effectiveFrom,
            effectiveTo: effectiveTo === 'T00:00:00.000-05:00' ? new Date() : effectiveTo,
            suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
            suggestedDealerCurrencyCode: JSON.stringify(suggestedDealerCurrencyCode),
            suggestedDealerMeasurementValue,
            suggestedDealerMeasurementUnitCode: JSON.stringify(suggestedDealerMeasurementUnitCode),
            suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
            suggestedEndUserCurrencyCode: JSON.stringify(suggestedEndUserCurrencyCode),
            suggestedEndUserMeasurementValue,
            suggestedEndUserMeasurementUnitCode: JSON.stringify(suggestedEndUserMeasurementUnitCode),
            productId: productMap[crossReferenceProductId],
            cropType: cropType,
          },
          { transaction },
        ).then((res) => {});
      } else {
        const suggestedDealerPriceJson = {
          ...JSON.parse(product.suggestedDealerPrice),
        };
        const suggestedEndUserPriceJson = {
          ...JSON.parse(product.suggestedEndUserPrice),
        };
        if (zoneId && !zoneId.toString()) {
          suggestedDealerPriceJson[`NZI`] = suggestedDealerPrice;
          suggestedEndUserPriceJson[`NZI`] = suggestedEndUserPrice;

          if (
            suggestedDealerPriceJson[`NZI`] !== suggestedDealerPrice &&
            suggestedEndUserPriceJson[`NZI`] !== suggestedEndUserPrice
          ) {
            await MonsantoProductLineItem.update(
              {
                suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
                suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
              },
              {
                where: {
                  crossReferenceProductId,
                  productId: productMap[crossReferenceProductId],
                  organizationId: organizationId,
                  zoneId: {
                    [Op.contains]: ['NZI'],
                  },
                },
              },
              { transaction },
            );
          }
        } else {
          suggestedDealerPriceJson[
            `${product.dataValues.zoneId.toString() == '*' ? 'NZI' : product.dataValues.zoneId.toString()}`
          ] = suggestedDealerPrice;
          suggestedEndUserPriceJson[
            `${product.dataValues.zoneId.toString() == '*' ? 'NZI' : product.dataValues.zoneId.toString()}`
          ] = suggestedEndUserPrice;

          if (
            JSON.parse(product.suggestedDealerPrice)[
              `${product.dataValues.zoneId.toString() == '*' ? 'NZI' : product.dataValues.zoneId.toString()}`
            ] !== suggestedDealerPrice &&
            JSON.parse(product.suggestedEndUserPrice)[
              `${product.dataValues.zoneId.toString() == '*' ? 'NZI' : product.dataValues.zoneId.toString()}`
            ] !== suggestedEndUserPrice
          ) {
            await MonsantoProductLineItem.update(
              {
                suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
                suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
              },
              {
                where: {
                  crossReferenceProductId,
                  productId: productMap[crossReferenceProductId],
                  organizationId: organizationId,
                  zoneId: {
                    [Op.contains]: [`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`],
                  },
                },
              },
              { transaction },
            );
          }
        }

        // let newZoneId = [...product.zoneId];
        // if (!zoneId.toString() && !product.zoneId.includes('NZI')) {
        //   newZoneId.push('NZI');
        // } else {
        //   if (!product.zoneId.includes(zoneId.toString())) {
        //     newZoneId.push(zoneId.toString());
        //   }
        // }
      }
    };

    await Promise.all(products.map(updateProduct));
    await Promise.all(productLineItems.map(createOrUpdateLineItem));

    await MonsantoPriceSheet.update(
      {
        identifier,
        isSyncing: false,
        endRequestTimestamp: JSON.stringify(new Date().toISOString()),
        lastUpdateDate: productLineItems.length > 0 ? JSON.stringify(new Date().toISOString()) : priceSheet.lastRequest,
      },
      {
        where: {
          buyerMonsantoId: seedDealerMonsantoId,
          cropType,
          zoneId,
        },
        transaction,
      },
    );

    if (priceSheetJustCreated) {
      console.log(`pricesheet synced for ${cropType} and ${zoneId}`);
    }

    await transaction.commit();
  } catch (err) {
    console.log(err);

    await transaction.rollback();
    throw err;
  }
};

async function checkMonsantoRemovedProducts(productCrossRefIds, cropType, organizationId) {
  const AllMonsantoProducts = await MonsantoProduct.findAll({
    where: {
      classification: cropType,
      isDeletedInBayer: false,
      organizationId: organizationId,
    },
  });
  const removedProduct = [];
  AllMonsantoProducts.map((product) => {
    if (!productCrossRefIds.includes(product.dataValues.crossReferenceId)) {
      removedProduct.push({ crossReferenceId: product.dataValues.crossReferenceId, zoneId: product.dataValues.zoneId });
    }
  });
  return removedProduct;
}
