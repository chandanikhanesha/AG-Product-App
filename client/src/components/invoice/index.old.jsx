import React, { Component } from 'react';
// import jsPDF from 'jspdf'
import html2canvas from 'html2canvas';

import InvoiceSigner from '../../components/signer';

class Invoice extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.savePDF = this.savePDF.bind(this);
  }

  state = {
    email: '',
  };

  onChange(field, event) {
    this.setState({
      [field]: event.target.value,
    });
  }

  savePDF() {
    let data = {};

    if (this.state.email && document.getElementById('email').validity.valid) {
      data.email = this.state.email;
    }

    html2canvas(document.getElementById('invoice')).then((canvas) => {
      let img = canvas.toDataURL('image/png');
      data.img = img;
      fetch(`${process.env.REACT_APP_API_BASE}/invoice/create_pdf`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'content-type': 'application/json',
          'x-access-token': localStorage.getItem('authToken'),
        },
      })
        .then((response) => response.json())
        .then((response) => console.log('response : ', response));
    });
  }

  render() {
    return (
      <div>
        <div id="invoice">
          <h4>invoice</h4>
          <InvoiceSigner />
        </div>

        <input id="email" type="email" onChange={(e) => this.onChange('email', e)} value={this.state.email} />

        <button onClick={this.savePDF}>save pdf</button>
      </div>
    );
  }
}

export default Invoice;
