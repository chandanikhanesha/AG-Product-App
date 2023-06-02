import React, { Component } from 'react';
import moment from 'moment';
import SweetAlert from 'react-bootstrap-sweetalert';
import { withStyles, Paper, Popover, MenuList, MenuItem } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ViewSubscriptionsDialogStyles } from './view_subscription_dialog.styles';
import axios from 'axios';

class ViewSubscriptionsDialog extends Component {
  state = {
    items: [],
    isSubmitting: false,
  };

  handleChange(e) {
    let isChecked = e.target.checked;
    if (isChecked) {
      const items = this.state.items;
      items.push(e.target.value);
      this.setState({ items });
    } else {
      const result = this.state.items.filter((item) => item !== e.target.value);
      this.setState({ items: result });
    }
  }

  handleSubmit = async (event) => {
    const selectedPlanNames = this.props.planList
      .filter((item) => this.state.items.includes(item.id))
      .map((item) => item.nickname);
    const items = this.state.items.map((item) => ({ price: item }));

    const data = {
      items: items,
      selectedPlanNames,
    };

    axios
      .post(`${process.env.REACT_APP_API_BASE}/admin/subscription/chargeOffline `, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        if (response.data.data) {
          this.setState({ isSubmitting: true });
        } else {
          console.log(response);
          alert(response);
          this.setState({ isSubmitting: false });
        }
      });
  };

  componentDidMount() {
    this.props.getSubscriptionPlans().then(() => {
      const selectedItem = [];
      this.props.planList.map(({ id, nickname }) => {
        if (this.props.subscriptionPlan.includes(nickname)) {
          selectedItem.push(id);
        }
      });
      this.setState({ items: selectedItem });
    });
  }

  render() {
    const { classes, onClose, open, data } = this.props;
    const { items, isSubmitting } = this.state;
    console.log(data);

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md" style={{ padding: '10px 20px' }}>
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            Subscription Details
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <span className={classes.totalRowText}>
          Payment Mode :{' '}
          {data.subscription.length > 0 ? data.subscription[data.subscription.length - 1].paymentMode : '-'}
        </span>
        <span className={classes.totalRowText}>
          Subscription Started time :{' '}
          {data.subscription.length > 0
            ? moment
                .utc(data.subscription[data.subscription.length - 1].subscription_start_timestamp)
                .format('DD/MM/YYYY HH:mm:ss')
            : '-'}
        </span>
        <span className={classes.totalRowText}>
          Subscription End time :{' '}
          {data.subscription.length > 0
            ? moment
                .utc(data.subscription[data.subscription.length - 1].subscription_end_timestamp)
                .format('DD/MM/YYYY HH:mm:ss')
            : '-'}
        </span>
        <Divider style={{ marginTop: '10px' }} />
        <CardBody className={classes.cardBody}>
          <form onSubmit={this.handleSubmit}>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormGroup>
                {this.props.planList.map(({ nickname, id, unit_amount }) => {
                  if (nickname === 'Bayer API Connectivity') {
                    if (this.props.data.apiSeedCompanies) {
                      return;
                    }
                  }
                  return (
                    <FormControlLabel
                      control={<Checkbox onChange={(e) => this.handleChange(e)} value={id} />}
                      checked={this.state.items.includes(id)}
                      label={`${nickname} ($${unit_amount / 100})`}
                    />
                  );
                })}
              </FormGroup>
              {isSubmitting && <CircularProgress />}
              <FormControlLabel
                control={
                  <Button type="submit" variant="contained">
                    Pay
                  </Button>
                }
              />
            </FormControl>
          </form>
        </CardBody>
        <div style={{ marginTop: '10px' }}>
          <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(ViewSubscriptionsDialogStyles)(ViewSubscriptionsDialog);
