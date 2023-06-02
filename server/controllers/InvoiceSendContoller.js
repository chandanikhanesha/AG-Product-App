const { Router } = require('express');
const authMiddleware = require('../middleware/userAuth');
const multer = require('multer');
const puppeteer = require('puppeteer');
const AWS = require('aws-sdk');
const { sendEmail } = require('utilities/email');
const { v4: uuidv4 } = require('uuid');
const { Backup } = require('../models');
const csvParser = require('csv-parser');
const fs = require('fs');
const { MonsantoProduct, Organization, ApiSeedCompany, CsvMonsantoProduct, CsvPricesheetProduct } = require('models');

const s3 = new AWS.S3({
  endpoint: process.env.BUCKET_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
});
const bucket = process.env.BUCKET;
const upload = multer({ storage: multer.memoryStorage() });

const buildName = (name) => String(name).replace(/ /g, '');
const buildTimeStamp = () => {
  const dateAndTime = new Date().toISOString().split('T');
  return dateAndTime[0] + ':' + dateAndTime[1].split(':')[0];
};

const uuid = uuidv4();
const seasonYear = new Date().getFullYear();

const router = (module.exports = Router().use(authMiddleware));

const storage = multer.diskStorage({
  // notice you are calling the multer.diskStorage() method here, not multer()
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});
const upload1 = multer({ storage });

var cpUpload = upload1.fields([
  { name: 'pricesheet', maxCount: 1 },
  { name: 'productsheet', maxCount: 1 },
]);

router.post('/inovice-download', async (req, res) => {
  try {
    const { orgName, customCustId, customPoId, orgId, customersData } = req.body;
    console.log(req.body);
    console.log(req.body);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'],
      executablePath: 'google-chrome-unstable',
    });

    console.log('Backup process start......');

    const page = await browser.newPage();

    page.setViewport({ width: 1366, height: 768 });
    const URL = process.env.URL;
    const EMAIL = process.env.EMAIL;
    const PASSWORD = process.env.PASSWORD;

    await page.goto(`${URL}/log_in`);
    await page.waitForTimeout(500);

    await page.type('#email', EMAIL, { delay: 50 });
    await page.type('#password', PASSWORD, { delay: 50 });

    await page.click('[type="submit"]');
    await page.waitForTimeout(2000);
    await page.click('#standard-select-organizations');

    const listOrg = await page.$$(
      '#menu- > div.MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded > ul > li',
    );

    for (const org of listOrg) {
      const ddname = await (await org.getProperty('innerText')).jsonValue();
      if (ddname === orgName) {
        await org.click();
      }
    }
    await page.waitForTimeout(1000);
    await page.click(
      'body > div.MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper > div > div.MuiDialogActions-root.MuiDialogActions-spacing > button',
    );
    await page.waitForTimeout(2000);

    await page.goto(`${URL}/app/customers`, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });
    // const customersData = await page.evaluate(() => {
    //   const json = localStorage.getItem('reduxPersist:backupCustomerReducer');
    //   return JSON.parse(json);
    // });
    // const orgId = await page.evaluate(() => {
    //   return orgID;
    // });
    console.log(orgId, 'orgId');
    const isSpacificOrder = customPoId || customCustId ? true : false;
    const Allcustomers = customersData.backupCustomers;
    console.log(isSpacificOrder, 'isSpacificOrder');
    console.log(Allcustomers.length);

    for (let i = 0; i < Allcustomers.length; i++) {
      const custId = Allcustomers[i].id;
      const custName = Allcustomers[i].name;
      if (!isSpacificOrder || custId === Number(customCustId)) {
        for (let j = 0; j < Allcustomers[i]['PurchaseOrders'].length; j++) {
          const poID = Allcustomers[i]['PurchaseOrders'][j].id;
          const poname = Allcustomers[i]['PurchaseOrders'][j].name;
          if (!isSpacificOrder || poID === Number(customPoId)) {
            try {
              await page.goto(`${URL}/app/customers/${custId}/preview/${poID}`, {
                waitUntil: ['domcontentloaded', 'networkidle0'],
              });

              if (Allcustomers[i]['PurchaseOrders'][j].isSimple === false) {
                await page.click('[data-test-id=shareholdersSelect]');
                const listShareHolders = await page.$$(
                  '#menu- > div.MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded > ul > li',
                );
                for (const item of listShareHolders) {
                  try {
                    const ddname = await (await item.getProperty('innerText')).jsonValue();

                    await page.setDefaultNavigationTimeout(0);

                    await page.evaluate((element) => {
                      element.click();
                    }, item);

                    const savePath = `pdf-backup/${uuid}/${orgId}/${buildName(orgName)}/${custId}/${buildName(
                      custName,
                    )}/${seasonYear}/${buildTimeStamp()}/PO#${poID}(${poname}).pdf`;
                    console.log(savePath, 'savepathhh');

                    await storePDF(savePath, poID, orgId, custId, poname, false);
                  } catch (e) {
                    console.log(e);
                  }
                }
              } else {
                const savePath = `pdf-backup/${uuid}/${orgId}/${buildName(orgName)}/${custId}/${buildName(
                  custName,
                )}/${seasonYear}/${buildTimeStamp()}/PO#${poID}(${poname}).pdf`;
                console.log(savePath, 'savepathhh');
                await storePDF(savePath, poID, orgId, custId, poname, false);
              }
              const savePath = `pdf-backup/${uuid}/${orgId}/${buildName(orgName)}/${custId}/${buildName(
                custName,
              )}/${seasonYear}/${buildTimeStamp()}/Delivery#${poID}(${poname}).pdf`;
              await page.goto(`${URL}/app/customers/${custId}/delivery_preview/${poID}/print`, {
                waitUntil: ['domcontentloaded', 'networkidle0'],
              });
              await storePDF(savePath, poID, orgId, custId, poname, true);
            } catch (error) {
              console.log('poID ' + poID, error);
            }
          }
        }
      }
    }

    async function storePDF(savePath, poID, orgId, custId, poname, isDelivery) {
      try {
        const pdfBuffer = await page.pdf({
          printBackground: true,
          format: 'A4',
          PreferCSSPageSize: true,
        });
        await s3
          .upload({
            Bucket: bucket,
            Key: savePath,
            Body: pdfBuffer,
            ACL: 'public-read',
          })
          .promise()
          .then((res) => {
            Backup.create({
              organizationId: orgId,
              customerId: custId,
              purchaseOrderId: poID,
              pdfLink: res.Location,
              seasonYear: seasonYear,
              isDelivery,
            })
              .then((backup) => console.log('create Succesfully'))
              .catch((e) => {
                console.log('error : ', e);
              });
            console.log(res);
          });
        console.log('Your file has been uploaded successfully!', poID);
      } catch (error) {
        console.log(error);
      }
    }

    res.send('done');
    console.log('Done All backup ');
    await page.evaluate(() => localStorage.clear());
    browser.close();
  } catch (e) {
    console.log(e);
  }
});

router.post('/send-invoice-email', upload.single('pdfFile'), async (req, res) => {
  try {
    const { toEmails, subject, text, orgName, customCustId, customPoId, orgId, custName } = req.body;
    const savePath = `pdf-backup/${buildName(orgName)}-${orgId}/${buildTimeStamp()}/${buildName(
      custName,
    )}-${customCustId}/${customPoId}.pdf`;
    await s3.upload({ Bucket: bucket, Key: savePath, Body: req.file.buffer, ACL: 'public-read' }).promise();
    await sendEmail(toEmails.split(','), subject, text, '', [
      {
        content: req.file.buffer.toString('base64'),
        filename: req.file.originalname,
        type: req.file.mimetype,
        disposition: 'attachment',
      },
    ]);
    res.send('done');
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post('/check-monsanto-products-csv', cpUpload, async (req, res) => {
  try {
    console.log(req.files.pricesheet[0]);
    console.log(req.files.productsheet[0]);
    const newData = [];
    const apiseedcompanyData = await ApiSeedCompany.findOne({ where: { organizationId: req.body.organizationId } });
    let ends = 0;
    await Promise.all([
      fs
        .createReadStream(req.files.pricesheet[0].path)
        .on('error', () => {
          // handle error
        })
        .pipe(csvParser())
        .on('data', async (row) => {
          // use row data
          const zone = row['Prc Zone'] == '' ? '*' : row['Prc Zone'];
          const checkZone = JSON.parse(apiseedcompanyData.dataValues.zoneIds).filter(
            (a) => a.classification == row['Specie'] && a.zoneId == zone,
          );
          if (checkZone.length > 0) {
            const suggestedDealerPriceJson = {};
            const suggestedEndUserPriceJson = {};
            if (row['Prc Zone'] == '') {
              suggestedDealerPriceJson[`NZI`] = row['SRP'];
              suggestedEndUserPriceJson[`NZI`] = row['SRP Net'];
            } else {
              suggestedDealerPriceJson[`${row['Prc Zone']}`] = row['SRP'];
              suggestedEndUserPriceJson[`${row['Prc Zone']}`] = row['SRP Net'];
            }
            const newZoneId = [];
            if (row['Prc Zone'] == '') {
              newZoneId.push('NZI');
            } else {
              newZoneId.push(row['Prc Zone']);
            }
            ends = 1;
            return CsvPricesheetProduct.create({
              organizationId: req.body.organizationId,
              effectiveFrom: new Date(),
              effectiveTo: new Date(),
              zoneId: [...newZoneId],
              crossReferenceProductId: row['GTIN Number'],
              lineNumber: '999999',
              treatment: row['Treatment Desc'],
              suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
              suggestedDealerCurrencyCode: JSON.stringify('"{"value":"USD","domain":"ISO-4217"}"'),
              suggestedDealerMeasurementValue: 1,
              suggestedDealerMeasurementUnitCode: JSON.stringify('"{"value":"BG","domain":"UN-Rec-20"}"'),
              suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
              suggestedEndUserCurrencyCode: JSON.stringify('{"value":"USD","domain":"ISO-4217"}'),
              suggestedEndUserMeasurementValue: 1,
              suggestedEndUserMeasurementUnitCode: JSON.stringify('{"value":"UN","domain":"UN-Rec-20"}'),
            });
          }
        }),
      fs
        .createReadStream(req.files.productsheet[0].path)
        .on('error', () => {
          // handle error
        })
        .pipe(csvParser())
        .on('data', async (row1) => {
          // use row1 data
          let packaging;
          if (row1['Specie'] === 'C') {
            if (row1['Description'].includes('80M')) {
              packaging = '80M';
            } else if (row1['Description'].includes('SP45')) {
              packaging = 'SP45';
            } else {
              packaging = 'SP50';
            }
          } else if (row1['Specie'] === 'S') {
            if (row1['Description'].includes('50#')) {
              packaging = '50#';
            } else {
              packaging = 'SP50U';
            }
          } else if (row1['Specie'] === 'L') {
            if (row1['Description'].includes('4250M')) {
              packaging = '4250M';
            } else {
              packaging = '30SCUSP';
            }
          } else if (row1['Specie'] === 'B') {
            if (row1['Description'].includes('140M')) {
              packaging = '140M';
            } else if (row1['Description'].includes('40SCUMB')) {
              packaging = '40SCUMB';
            } else {
              packaging = 'SC-BULK-FG';
            }
          } else if (row1['Specie'] === 'A') {
            packaging = '50#';
          }
          ends = 2;
          return CsvMonsantoProduct.create({
            organizationId: req.body.organizationId,
            classification: row1['Specie'],
            packaging,
            seedSize: row1['Grade Size Desc'],
            brand: row1['Trait Description'],
            blend: row1['Acronym Name'],
            crossReferenceId: row1['GTIN'],
            seedCompanyId: apiseedcompanyData.dataValues.id,
          });
        }),
    ]).then(() => {
      setTimeout(() => {
        if (ends === 2) {
          console.log('helllo end is 2', ends);
        }
        console.log(ends, 'ends');

        res.send({ newData: 'done' });
        fs.unlinkSync(req.files.pricesheet[0].path);
        fs.unlinkSync(req.files.productsheet[0].path);
      }, 1000);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
