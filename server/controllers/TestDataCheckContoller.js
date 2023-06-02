const { Router } = require('express');
const authMiddleware = require('../middleware/userAuth');
const puppeteer = require('puppeteer');
// const { PendingXHR } = require("pending-xhr-puppeteer");
const fs = require('fs');
const path = require('path');
const diff = require('nested-object-diff').diff;

const router = (module.exports = Router().use(authMiddleware));

async function parsePurchaseOrder(page, URL, custId, poID, isQuote) {
  await page.goto(`${URL}/app/customers/${custId}/${isQuote ? 'quote' : 'purchase_order'}/${poID}`, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
  });
  const totalObj = await page.evaluate(() => {
    const grandTotal = document.querySelector('[data-test-id=gradTotal]')
      ? document.querySelector('[data-test-id=gradTotal]').textContent
      : 0;
    const pretotal = document.querySelector('[data-test-id=pretotal]')
      ? document.querySelector('[data-test-id=pretotal]').textContent
      : 0;
    const discount = document.querySelector('[data-test-id=discount]')
      ? document.querySelector('[data-test-id=discount]').textContent
      : 0;
    return { grandTotal, pretotal, discount };
  });

  await page.goto(`${URL}/app/customers/${custId}/preview/${poID}`, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
  });
  const balanceDue = await page.evaluate(() => {
    const balanceDue = document.querySelector('[data-test-id=balanceDue]')
      ? document.querySelector('[data-test-id=balanceDue]').textContent
      : 0;
    return balanceDue;
  });
  return { totalObj, balanceDue };
}

router.post('/compare-start', async (req, res) => {
  try {
    const { IsBefore, orgName, USERNAME, PASSWORD } = req.body;
    console.log('started');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1366, height: 768 });
    const URL = process.env.URL;

    // const pendingXHR = new PendingXHR(page);
    let listOrgLength = 0;
    let currentIndex = -1;
    const allData = [];

    if (orgName === 'ALL') {
      while (currentIndex < listOrgLength) {
        await login(currentIndex === -1 ? 0 : currentIndex);
      }
    } else {
      await login(null, orgName);
    }

    async function login(index, selectedorgName) {
      try {
        await page.goto(`${URL}/log_in`);
        await page.waitForTimeout(500);

        await page.type('#email', USERNAME, { delay: 50 });
        await page.type('#password', PASSWORD, { delay: 50 });

        await page.click('[type="submit"]');
        await page.waitForTimeout(2000);

        await page.click('#standard-select-organizations');

        const listOrg = await page.$$(
          '#menu- > div.MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded > ul > li',
        );

        await Promise.all(
          listOrg.map(async (item, indexOrg) => {
            const orgName1 = await (await item.getProperty('innerText')).jsonValue();
            if (selectedorgName === orgName1) {
              index = indexOrg;
            }
          }),
        );

        await listOrg[index].click();
        const orgName = await (await listOrg[index].getProperty('innerText')).jsonValue();

        listOrgLength = listOrg.length;
        currentIndex++;

        await page.click(
          'body > div.MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper > div > div.MuiDialogActions-root.MuiDialogActions-spacing > button',
        );
        await page.waitForTimeout(2000);

        await page.goto(`${URL}/app/customers`, {
          waitUntil: ['domcontentloaded', 'networkidle0'],
        });
        // await pendingXHR.waitForAllXhrFinished();

        console.log('loaded', orgName);
        const customersData = await page.evaluate(() => {
          const json = localStorage.getItem('reduxPersist:customerReducer');
          return JSON.parse(json);
        });

        const Allcustomers = customersData.customers;

        for (let i = 0; i < Allcustomers.length; i++) {
          const custId = Allcustomers[i].id;
          if (custId) {
            for (let j = 0; j < Allcustomers[i]['PurchaseOrders'].length; j++) {
              const poID = Allcustomers[i]['PurchaseOrders'][j].id;
              if (poID) {
                try {
                  const isQuote = Allcustomers[i]['PurchaseOrders'][j]['isQuote'];
                  const { totalObj, balanceDue } = await parsePurchaseOrder(page, URL, custId, poID, isQuote);
                  Allcustomers[i]['PurchaseOrders'][j]['totalObj'] = totalObj;
                  Allcustomers[i]['PurchaseOrders'][j]['balanceDue'] = balanceDue;
                } catch (error) {
                  console.log('poID ' + poID, error);
                }
              } else console.log('no poID found');
            }
          } else console.log('no customer found');
        }

        allData.push({ [`${String(orgName).replace(/ /g, '')}`]: Allcustomers });
        await page.goto(`${URL}/app/customers`, { waitUntil: ['domcontentloaded'] });
        await page.evaluate(() => localStorage.clear());

        console.log('Done', orgName);
      } catch (error) {
        console.log('error', error);
        currentIndex++;
      }
    }

    if (IsBefore === 'true') {
      fs.writeFileSync(path.join(__dirname, '../public/json/before.json'), JSON.stringify(allData));
    } else {
      fs.writeFileSync(path.join(__dirname, '../public/json/after.json'), JSON.stringify(allData));
    }

    browser.close();

    res.redirect('/compare-result');
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get('/compare-result', async (req, res) => {
  const after = fs.readFileSync(path.join(__dirname, '../public/json/after.json'), { encoding: 'utf8' });
  const before = fs.readFileSync(path.join(__dirname, '../public/json/before.json'), { encoding: 'utf8' });
  // const difference = {};
  // JSON.parse(after).map((aitem) => {
  //   Object.keys(aitem).map((akey) => {
  //     JSON.parse(before).forEach((bitem) => {
  //       if (bitem[akey]) {
  //         console.log(bitem[akey]);
  //       } else {
  //         console.log("no found");
  //       }
  //     });
  //     //   if(bitem === aitem){
  //     //     name = akey;
  //     //   }
  //     //   // aitem[akey].map((item2) => {
  //     //   //   console.log(item2);
  //     //   // });
  //   });
  // });
  const differences = diff(JSON.parse(after), JSON.parse(before));
  res.render('compare', { data: JSON.stringify(differences) });
});
