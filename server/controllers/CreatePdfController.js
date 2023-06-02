const { Router } = require('express');
// const puppeteer = require('puppeteer');
const authMiddleware = require('middleware/userAuth');

const router = (module.exports = Router().use(authMiddleware));

// router.post('/', async (req, res, next) => {
//     const clientPath = req.body.clientPath;
//     const token = req.headers['x-access-token'];
//     let browser;
//     try {
//         browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setRequestInterception(true);
//         page.on('request', request => {
//             if (request.resourceType() === 'image') {
//                 request.abort();
//             } else {
//                 request.continue();
//             }
//         });
//         await page.setViewport({ width: 1366, height: 768 });

//         const url = `${process.env.URL_BASE}${clientPath}`;
//         await page.goto(url, {
//             waitUntil: 'load'
//         });
//         await page.evaluate((token) => {
//             localStorage.setItem('authToken', token);
//         }, token);
//         try {
//             await page.goto(url, {
//                 waitUntil: 'networkidle0'
//             });
//         } catch (e) {
//             console.error(new Error(e))
//         }

//         const pdf = await page.pdf({
//             fullPage: true
//         });
//         await page.evaluate(() => {
//             localStorage.clear();
//         });
//         await browser.close();

//         res.contentType('application/pdf');
//         res.send(pdf);
//     } catch (error) {
//         console.error(new Error(error))
//         if (browser) {
//             await browser.close();
//         }
//         res.status(500).json({
//             error: 'Unable to generate PDF'
//         });
//     }
// });
