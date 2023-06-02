const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (to, subject, text, html, attachments) => {
  let msg = {
    to: to,
    from: 'dev@agridealer.co',
    subject: subject,
    text: text,
    ...(html && { html: html }),
    attachments: attachments ? attachments : [],
  };
  msg.subject = msg.subject || ' ';
  msg.text = msg.text || ' ';
  return sgMail
    .send(msg)
    .then((result) => {
      console.log('email sent');
    })
    .catch((error) => {
      console.log(error, 'at send mail');
    });
};

const sendTestEmail = (email, subject, attachments, text, html) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'gok3efoivh2fjpsk@ethereal.email',
        pass: 'y14NrsKzuAqrnpbyC1',
      },
    });

    const message = {
      from: 'test',
      to: email,
      subject: subject,
      text: text || 'text',
      html: html || text || '<p>here is your pdf<p>',
      attachments: attachments,
    };

    transporter.sendMail(message, (error, info) => {
      if (error) reject(error);

      console.log('Message send : ', info.messageId);
      console.log('Preview URL : ', nodemailer.getTestMessageUrl(info));

      resolve();
    });
  });
};

module.exports = {
  sendEmail: sendEmail,
  sendTestEmail: sendTestEmail,
};
