const emailUtility = require('utilities/email');
const { Router, response } = require('express');
const authMiddleware = require('../middleware/userAuth');
const router = (module.exports = Router());
const { User } = require('models');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  console.log(req.body.email);
  const email = req.body.email;
  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    return res.status(200).json({ success: false, message: 'User not found , Please enter your logging email' });
  } else {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '900s' });

    emailUtility
      .sendEmail(
        req.body,
        'Reset Password Email',
        `Click on link and reset your password for this ${req.body.email} account `,
        `<p>Click on below link and reset your password for this <b>${req.body.email}</b> email <br></br>
        Reset Password Link : <a href="${process.env.URL_BASE}/reset_password/${token}">${process.env.URL_BASE}/reset_password/${token} </a><p>`,
        null,
      )
      .then((response) => {
        res.status(200).json({ success: true, message: 'Check your email,It send successfully' });
      })
      .catch((e) => {
        res.status(400).json({ error: e });
      });
  }
});

router.patch('/', (req, res) => {
  try {
    User.findOne({ where: { email: req.body.data.email } }).then((isExits) => {
      if (isExits !== null) {
        let updatePassword = false;
        if (
          req.body.data.newPassword &&
          req.body.data.newPasswordConfirmation &&
          req.body.data.newPassword === req.body.data.newPasswordConfirmation
        ) {
          updatePassword = true;

          User.findOne({ where: { email: req.body.data.email } })
            .then((user) => {
              if (updatePassword) return user.setPassword(req.body.data.newPassword);
              return Promise.resolve(user);
            })
            .then((user) => {
              let updateObj = {
                encryptedPassword: user.encryptedPassword,
              };
              return user.update(updateObj);
            })
            .then((response) => {
              res.status(200).json({ response, success: 'Password reset succesfully' });
            })
            .catch((e) => {
              console.log(e, 'e');
              res.status(400).json({ error: e });
            });
        } else {
          res.status(400).json({ error: 'Password mismatch with confirm password' });
        }
      } else {
        res.status(400).json({ error: 'Email not found' });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(503).json({ error: 'Not able to reset password' });
  }
});
