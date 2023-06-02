// create statement automaticlly
const moment = require('moment');
const { isEmpty } = require('lodash/lang');
const CronJob = require('cron').CronJob;
const {
  Organization,
  Company,
  SeedCompany,
  CustomerProduct,
  CustomerCustomProduct,
  PurchaseOrder,
  Customer,
  StatementSetting,
  FinanceMethod,
  DelayProduct,
  DealerDiscount,
  Product,
  CustomProduct,
  Statement,
  PurchaseOrderStatement,
} = require('models');
const { numberToDollars, customerProductDiscountsTotals, setResultToArray } = require('utilities');
const { getProductFromOrder, getProductName } = require('utilities/product');
const { getAppliedDiscounts } = require('utilities/purchase_order');
//console.log("before job start")

const job = new CronJob(
  //"*/10 * * * * *",
  //everyday
  '0 0 0 * * *',
  async () => {
    try {
      //doStatementJob();
    } catch (err) {}
  },
  null,
  true,
  'America/Chicago',
);

async function doStatementJob() {
  //console.log("Job start");
  const seedTypes = [
    'CORN',
    'SOYBEAN',
    'SORGHUM',
    'CANOLA',
    // 'ALFALFA'
  ];
  Organization.findAll().then((organizations) => {
    organizations.forEach(async (organization) => {
      //get all dependencies
      const query = {
        where: {
          organizationId: organization.id,
        },
      };
      let customers = await Customer.all(query);
      customers = setResultToArray(customers);
      if (isEmpty(customers)) return;
      let companies = await Company.all(query);
      companies = setResultToArray(companies);
      let seedCompanies = await SeedCompany.all(query);
      seedCompanies = setResultToArray(seedCompanies);
      if (companies.length + seedCompanies.length < 1) return;
      let purchaseOrders = await PurchaseOrder.all(query);
      purchaseOrders = setResultToArray(purchaseOrders);
      if (isEmpty(purchaseOrders)) return;
      let statementSettings = await StatementSetting.all(query);
      statementSettings = setResultToArray(statementSettings);
      if (isEmpty(statementSettings)) return;
      statementSetting = statementSettings.sort((a, b) => b.id - a.id)[0];
      if (statementSetting == undefined) return;
      let customerProducts = await CustomerProduct.all(query);
      customerProducts = setResultToArray(customerProducts);
      let customercustomProducts = await CustomerCustomProduct.all(query);
      customerCustomProducts = setResultToArray(customercustomProducts);
      let dealerDiscounts = await DealerDiscount.all(query);
      dealerDiscounts = setResultToArray(dealerDiscounts);
      let products = await Product.all(query);
      products = setResultToArray(products);
      let customProducts = await CustomProduct.all(query);
      customProducts = setResultToArray(customProducts);
      let statements = await Statement.all(query);
      statements = setResultToArray(statements);
      let financeMethods = await FinanceMethod.all(query);
      financeMethods = setResultToArray(financeMethods);
      let delayProducts = await DelayProduct.all(query);
      delayProducts = setResultToArray(delayProducts);

      //console.log("start customer")
      //check statement for each customer
      customers.forEach(async (customer) => {
        //statement created for this month?
        let statementCreated = false;
        //filter purchaseOrders(belong to this customer, not Quote, with data)
        const currentPurchaseOrders = purchaseOrders.filter(
          (purchaseOrder) =>
            !purchaseOrder.isQuote &&
            purchaseOrder.farmData.length > 0 &&
            parseInt(purchaseOrder.customerId, 10) === parseInt(customer.id, 10),
        );
        // if no purchase order, return
        if (currentPurchaseOrders.length === 0) return;
        const currentStatements = statements.filter(
          (statement) => parseInt(statement.customerId, 10) === parseInt(customer.id, 10),
        );

        //check if the statement for this month is created
        if (currentStatements.length > 0) {
          const lastStatement = currentStatements.sort((a, b) => b.id - a.id)[0];
          const lastStatementCreatedAt = moment(lastStatement.createdAt).format('YYYY MM DD');
          if (lastStatementCreatedAt == moment().format('YYYY MM DD')) statementCreated = true;
        }
        if (statementCreated) return;
        //check date
        //only accept monthly now
        let isToday = false;
        const { compoundingDays } = statementSetting;
        const year = parseInt(moment().format('YYYY'), 10);
        const month = parseInt(moment().format('MM'), 10);
        const day = parseInt(moment().format('DD'), 10);
        if (month === 2) {
          if (day === compoundingDays) {
            isToday = true;
          }
          //Leap Year
          if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
            if (day === 29 && compoundingDays >= 29) {
              isToday = true;
            }
          } else {
            if (day === 28 && compoundingDays >= 29) {
              isToday = true;
            }
          }
        } else if (month === 4 || month === 6 || month === 9 || month === 11) {
          if (day === compoundingDays) {
            isToday = true;
          } else if (day === 30 && compoundingDays >= 30) {
            isToday = true;
          }
        } else {
          if (day === compoundingDays) {
            isToday = true;
          }
        }

        //create statement
        //console.log("isToday: ",isToday)
        //If it is not the monthly create statement date, return
        if (!isToday) return;
        //console.log("start creating statement")
        const createStatementData = {
          compoundingDays,
          startDate: new Date(),
          organizationId: organization.id,
          customerId: customer.id,
        };
        const statementRes = await Statement.create(createStatementData);
        let statement = statementRes.toJSON();

        const statementId = statement.id;
        const statementNo =
          (statementId < 10 ? '000' : statementId < 100 ? '00' : statementId < 1000 ? '0' : '') + statementId;
        const updateData = { statementNo };
        //update statement NO.
        await statementRes.update(updateData);
        let emptyPOStatements = [];

        //console.log("start creating postatement")
        currentPurchaseOrders.forEach(async (purchaseOrder) => {
          //set invoice table data
          const groupedDiscountsData = {
            get groupedDiscountsData() {
              let productDiscountsData = [...customerProducts, ...customerCustomProducts]
                .filter((cp) => cp.purchaseOrderId === purchaseOrder.id)
                .map((order) => {
                  let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
                  let product = getProductFromOrder(order, products, customProducts);
                  let seedCompany;
                  let company;
                  if (order.hasOwnProperty('customProductId')) {
                    company = companies.find((c) => c.id === product.companyId);
                  } else {
                    seedCompany = seedCompanies.find((sc) => sc.id === product.seedCompanyId);
                  }
                  return {
                    discountData: customerProductDiscountsTotals(
                      order,
                      appliedDiscounts,
                      product,
                      null,
                      null,
                      null,
                      purchaseOrder,
                    ),
                    product,
                    seedCompany,
                    company,
                    order,
                  };
                });
              let seedTypeGrouping = { BUSINESS: [] };
              productDiscountsData.forEach((data) => {
                if (data.product.hasOwnProperty('companyId')) {
                  seedTypeGrouping['BUSINESS'] = [...seedTypeGrouping['BUSINESS'], data];
                } else {
                  if (seedTypeGrouping[data.product.seedType]) {
                    seedTypeGrouping[data.product.seedType] = [...seedTypeGrouping[data.product.seedType], data];
                  } else {
                    seedTypeGrouping[data.product.seedType] = [data];
                  }
                }
              });
              return seedTypeGrouping;
            },
          }; //groupedDiscountsData
          let rows = [];
          let saveRows = [];
          let totalUnits = 0;
          let totalItemTotals = 0;
          let totalNetPrices = 0;
          let total = 0;
          let isDefferedProduct = customer.isDefferedProduct;
          let defferedSeedCompanyId = [];
          let defferedCompanyId = [];
          //check deffer product
          if (isDefferedProduct) {
            delayProducts.forEach((delayProduct) => {
              const isFixed = delayProduct.delayMethod === 'fixed';
              let defferedDate;
              if (isFixed) {
                defferedDate = moment(delayProduct.fixedDate).format('YYYY/MM/DD');
              } else {
                defferedDate = moment(purchaseOrder.createdAt)
                  .add(delayProduct.certainDate, 'days')
                  .format('YYYY/MM/DD');
              }
              const today = moment().format('YYYY/MM/DD');
              if (defferedDate > today) {
                defferedSeedCompanyId = [...defferedSeedCompanyId, ...delayProduct.seedCompanyIds];
                defferedCompanyId = [...defferedCompanyId, ...delayProduct.companyIds];
              }
            });
          }

          seedCompanies.map((seedCompany) => {
            if (defferedSeedCompanyId.includes(seedCompany.id)) {
              return;
            }
            seedTypes.map((seedType) => {
              if (isEmpty(groupedDiscountsData.groupedDiscountsData)) {
                return rows;
              }
              let discountsData = groupedDiscountsData.groupedDiscountsData[seedType].filter(
                (d) => d.seedCompany.id === seedCompany.id,
              );

              discountsData.forEach((data) => {
                let units = data.order.orderQty;
                totalUnits += units;
                totalItemTotals += data.discountData.originalPrice;
                const netPrice = units === 0 ? units : (data.discountData.total / units).toFixed(2);

                totalNetPrices += parseFloat(netPrice);

                total += data.discountData.total;

                rows.push({
                  qty: units,
                  item: seedType,
                  description: getProductName(data.product, seedCompanies),
                  rate: numberToDollars(netPrice),
                  amount: numberToDollars(data.discountData.total),
                  orderDate: data.order.orderDate,
                });

                saveRows.push({
                  qty: units,
                  item: seedType,
                  description: getProductName(data.product, seedCompanies),
                  rate: numberToDollars(netPrice),
                  rateValue: netPrice,
                  amount: numberToDollars(data.discountData.total),
                  amountValue: data.discountData.total,
                  orderDate: data.order.orderDate,
                });
              });
            });
          }); //seedCompany

          companies.map((company) => {
            if (defferedCompanyId.includes(company.id)) {
              return;
            }
            if (isEmpty(groupedDiscountsData.groupedDiscountsData)) {
              return rows;
            }
            let discountsData = groupedDiscountsData.groupedDiscountsData['BUSINESS'].filter(
              (d) => d.company.id === company.id,
            );
            discountsData.forEach((data) => {
              let units = data.order.orderQty;
              totalUnits += units;
              totalItemTotals += data.discountData.originalPrice;
              const netPrice = units === 0 ? units : (data.discountData.total / units).toFixed(2);

              totalNetPrices += parseFloat(netPrice);

              total += data.discountData.total;
              if (data.discountData.total) {
                rows.push({
                  qty: data.order.orderQty,
                  item: data.product.name,
                  description: `${data.product.name} / ${data.product.description} / ${data.product.type}`,
                  rate: numberToDollars(netPrice),
                  amount: numberToDollars(data.discountData.total),
                  orderDate: data.order.orderDate,
                });
                saveRows.push({
                  qty: data.order.orderQty,
                  item: data.product.name,
                  description: `${data.product.name} / ${data.product.description} / ${data.product.type}`,
                  rate: numberToDollars(netPrice),
                  rateValue: netPrice,
                  amount: numberToDollars(data.discountData.total),
                  amountValue: data.discountData.total,
                  orderDate: data.order.orderDate,
                });
              }
            });
          }); //company
          this.totalNetPrice = total;
          if (isEmpty(saveRows)) {
            emptyPOStatements.push({ id: statement.id });
            return;
          }
          let data = {
            organizationId: organization.id,
            statementId: statement.id,
            statementNo: statementNo,
            purchaseOrderId: purchaseOrder.id,
            isRemoved: false,
            isDeferred: false,
            deferredDate: null,
            statementData: saveRows,
            totalAmount: this.totalNetPrice,
            reportUpdatedDate: moment().format(),
          };
          await PurchaseOrderStatement.create(data);
        }); //currentPurchaseOrder
        //remove empty data statement
        //console.log("check empty")
        //console.log("emptyPOStatements empty?: ", isEmpty(emptyPOStatements))
        if (!isEmpty(emptyPOStatements)) {
          emptyPOStatements.forEach(async (emptyPOStatement) => {
            const query = {
              where: {
                organizationId: organization.id,
                statementId: parseInt(emptyPOStatement.id, 10),
              },
            };
            const poStatements = await PurchaseOrderStatement.findAll(query);
            //console.log(emptyPOStatement.id)
            //console.log(poStatements)
            if (poStatements.length < 1) {
              Statement.findById(emptyPOStatement.id).then((statement) => statement.destroy());
            }
          });
        }
      }); //customer
    }); //organization
  });
}

process.env.IS_CRON_RUN === 'true' && job.start();

module.exports = { job, doStatementJob };
