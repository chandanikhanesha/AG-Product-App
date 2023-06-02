const path = require('path');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');

const { TempGPOS } = require('models');
const csvParser = require('csv-parser');

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,

  secretAccessKey: process.env.S3_SECRET_KEY,
  endpoint: process.env.BUCKET_ENDPOINT,
});
const BUCKET = process.env.BUCKET;
module.exports.removeUpload = (key) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: BUCKET,
        Key: key,
      },
      (err, data) => {
        if (err) {
          console.log('error deleting upload : ', key);
          reject(err);
        } else {
          console.log('uploaded deleted successfully : ', key);
          resolve(data);
        }
      },
    );
  });
};

module.exports.organizationLogoUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
});

const importCsvData = async () => {
  console.log('import csv funxtion');
  const dataPath = path.resolve('GPOS_Reconciliation_Summary_Report.csv');

  fs.createReadStream(dataPath)
    .on('error', (err) => {
      console.log(err);
    })

    .pipe(csvParser())
    .on('data', async (row) => {
      // console.log(row, 'row');
      row['purchaseOrderId'] = parseInt(row.reportedInvoiceNumber.split('_')[0]);
      row['indivisualDeliveryId'] = row.reportedInvoiceNumber.split('_')[1];

      const data = await TempGPOS.findOne({ where: { transactionId: row.transactionId } });
      if (!data) {
        TempGPOS.create(row)
          .then((res) => {
            // console.log('done');
          })
          .catch((e) => {
            console.log(e, 'e');
          });
      }
    });
};
// importCsvData();

// transactionId,transactionStatus,loadDate,reportedInvoiceDate,reportedShipDate,currentShipDate,reportedInvoiceNumber,currentInvoiceNumber,reporterMonAccTId,reporterMonEbid,reporterMonGLN,reporterMonSapId,reporterReportedName,reporterMonName,sfReportedQualifier,sfReportedValue,sfReportedCity,sfReportedState,sfMonEbid,sfMonGLN,sfMonAccountId,sfMonName,stReportedQualifier,stReportedValue,stReportedName,stReportedCity,stReportedState,stMonGLN,stMonAccountId,stMonName,stMonCity,stMonState,productReportedQualifier,productReportedValue,productReportedDescription,productReportedQuantity,productReportedUOM,productMonUPC,productMonTraitDescription,productMonDescription,productCurrentQty,productCurrentUOM,salesOrPkgQty,salesType,orderType,licenseStatusAllOthers,xmlConversationId,transactionSource
