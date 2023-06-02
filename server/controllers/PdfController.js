const { Router } = require('express');
const authMiddleware = require('middleware/userAuth');
const emailUtility = require('utilities/email');
const pdfUtility = require('utilities/pdf');

const router = (module.exports = Router().use(authMiddleware));

router.post('/', (req, res, next) => {
  res.contentType = 'application/pdf';

  pdfUtility
    .writePdf(req.body.img)
    .then(() => {
      if (req.body.email) {
        emailUtility
          .sendEmail('shnick@gmail.com', 'here is your pdf', 'here is your pdf', '<p>here is your pdf</p>', [
            { path: '/fs/ok.pdf' },
          ])
          .then(() => {
            res.json({ hello: 'pdf' });
          })
          .catch((e) => res.json({ error: e }));
      } else {
        res.json({ hello: 'pdf' });
      }
    })
    .catch((e) => res.json({ error: e }));
});
