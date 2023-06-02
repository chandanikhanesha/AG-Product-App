import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import moment from 'moment';
// material dashboard components
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

// icons
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import TextField from '@material-ui/core/TextField';

// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

const styles = {
  select: {
    width: '100%',
  },
};

class PaymentDialog extends Component {
  state = {
    shareholderId: 0, // 0: is for customer
    amount: 0.0,
    paymentDate: new Date(),
    method: 'Cash',
  };

  componentDidMount() {
    const { editingPayment } = this.props;
    if (!editingPayment) return;
    const { shareholderId, amount, paymentDate } = editingPayment;
    this.setState({
      shareholderId,
      amount,
      paymentDate,
    });
  }

  submit = () => {
    const { shareholderId, amount, paymentDate, method } = this.state;
    const { editingPayment } = this.props;

    let data = { amount, paymentDate, method };
    if (!isNaN(shareholderId)) data.shareholderId = shareholderId;

    if (editingPayment) {
      this.props.updatePayment(data);
    } else {
      this.props.createPayment(data);
    }

    this.setState({
      shareholderId: 0,
      amount: 0.0,
      paymentDate: new Date(),
      method: 'Cash',
    });
  };

  onSelectShareholderChange = (shareholderId) => {
    this.setState({
      shareholderId,
    });
  };

  onSelectMethodChange = (method) => {
    this.setState({
      method,
    });
  };

  render() {
    const { showPaymentDialog, cancelPaymentDialog, shareholders, editingPayment, classes, customer } = this.props;
    const { amount, shareholderId, paymentDate, method } = this.state;

    return (
      <Dialog open={showPaymentDialog}>
        <DialogTitle>Payment</DialogTitle>

        <DialogContent>
          <DatePicker
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            emptyLabel="Date"
            value={paymentDate}
            onChange={(e) => this.setState({ paymentDate: moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z' })}
          />
          d
          <br />
          <TextField
            label="Amount"
            id="amount"
            inputProps={{
              type: 'number',
              defaultValue: amount,
              onChange: (e) => this.setState({ amount: e.target.value }),
              step: 0.1,
              min: 0,
            }}
          />
          <br />
          <FormControl className={classes.select} style={{ marginBottom: '17px' }}>
            <InputLabel htmlFor="method">Payment method </InputLabel>
            <Select name="method" value={method} onChange={(e) => this.onSelectMethodChange(e.target.value)}>
              {['Cash', 'Credit'].map((method) => (
                <MenuItem value={method} key={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {shareholders.length > 0 && (
            <FormControl className={classes.select}>
              <InputLabel htmlFor="shareholder">Shareholder</InputLabel>
              <Select
                id="shareholderChoose"
                name="shareholder"
                value={shareholderId}
                onChange={(e) => this.onSelectShareholderChange(e.target.value)}
              >
                <MenuItem value={0}>{customer.name}</MenuItem>
                {shareholders.map((shareholder) => (
                  <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
                    {shareholder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelPaymentDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={this.submit} color="primary" id="createPayment">
            {editingPayment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(PaymentDialog);
