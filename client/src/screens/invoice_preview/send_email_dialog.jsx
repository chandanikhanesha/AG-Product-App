import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as html2pdf from 'html2pdf.js';
import { _authHeaders } from '../../store/actions/helpers.js';
import { ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/style.css';

function DataURIToBlob(dataURI) {
  const splitDataURI = dataURI.split(',');
  const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

  return new Blob([ia], { type: mimeString });
}

const SendEmailDialog = (props) => {
  const { onClose, open, organization, purchaseOrder, customer } = props;
  const [emails, setEmails] = useState([]);
  const [subject, setSubject] = useState('Invoice');
  const [text, setText] = useState(' Thank you  for your business.');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    customer && props.customer.email !== ''
      ? setEmails([...emails, props.customer.email, organization.email])
      : setEmails([...emails, organization.email]);
  }, [customer]);

  const sendMail = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      let blobString = await html2pdf().from(document.getElementById('invoice')).toPdf().output('datauristring');
      const pdfFile = DataURIToBlob(blobString);

      formData.append('pdfFile', pdfFile, `${purchaseOrder.id}.pdf`);
      formData.append('toEmails', emails);
      formData.append('subject', subject);
      formData.append('text', text);
      formData.append('customPoId', purchaseOrder.id);
      formData.append('customCustId', customer.id);
      formData.append('custName', customer.name);
      formData.append('orgId', organization.id);
      formData.append('orgName', organization.name);

      // await axios.post(`${process.env.REACT_APP_INVOICE_API}/inovice-download`, {
      //   orgName:organization.name,
      //   customCustId: customer.id,
      //   customPoId: purchaseOrder.id,
      //   toEmails: emails,
      //   subject,
      //   text,
      // });
      await axios.post(`${process.env.REACT_APP_API_BASE}/invoiceSend/send-invoice-email`, formData, _authHeaders());
      setIsLoading(false);
      onClose();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };
  return (
    <Dialog onClose={onClose} className="hide-print" open={open} fullWidth>
      <DialogTitle>Send Invoie Email</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter your email address here. We will send Invoie to your email addresss (you can enter one or more
          email addresss)
        </DialogContentText>
        <ReactMultiEmail
          placeholder="Input your Email Address"
          emails={emails}
          onChange={(_emails) => {
            setEmails(_emails);
          }}
          getLabel={(email, index, removeEmail) => {
            return (
              <div data-tag key={index}>
                {email}
                <span data-tag-handle onClick={() => removeEmail(index)}>
                  ×
                </span>
              </div>
            );
          }}
        />
        <TextField
          margin="dense"
          label="Enter your subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          multiline
          fullWidth
          rows={3}
        />
        <TextField
          margin="dense"
          label="Enter your text (optional)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          fullWidth
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <div style={{ position: 'relative' }}>
          <Button onClick={sendMail} disabled={isLoading} color="primary" variant="contained">
            Send
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
            />
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default SendEmailDialog;
