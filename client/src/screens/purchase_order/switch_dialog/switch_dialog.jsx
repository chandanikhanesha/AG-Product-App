import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';

// material ui
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';

import SimpleView from '../../../assets/img/Simple-View.png';
import AdvancedView from '../../../assets/img/Advanced-View.png';

import { switchDialogStyles } from './switch_dialog.styles';

class CreatePurchaseOrderDialog extends Component {
  state = {
    isQuote: false,
    subjectName: 'Purchase Order',
    selectedType: null,
  };

  componentDidMount() {
    const { isQuote } = this.props;
    this.setState({
      isQuote: isQuote,
      subjectName: isQuote ? 'Quote' : 'Purchase Order',
    });
  }

  createPurchaseOrder() {
    const { createPurchaseOrderForCustomer, onClose } = this.props;
    const { isQuote, subjectName, selectedType } = this.state;
    const isSimple = selectedType === 'simple';
    const customerId = this.props.customerId;
    const routeSubject = subjectName === 'Quote' ? 'quote' : 'purchase_order';

    createPurchaseOrderForCustomer(customerId, { isQuote, isSimple }).then((response) => {
      onClose();
      this.props.history.push(`/app/customers/${customerId}/${routeSubject}/${response.payload.id}`);
    });
  }

  selectType = (type) => () => {
    this.setState({
      selectedType: type,
    });
  };

  render() {
    const { selectedType } = this.state;
    const { classes, open, onClose } = this.props;
    return (
      <Dialog
        classes={{
          paper: classes.dialogPaper,
        }}
        open={open}
        onClose={onClose}
      >
        <div className={classes.dialogTitle}>
          <h4>Switch View To</h4>
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <DialogContent className={classes.paper}>
          <Grid container className={classes.cardContainer}>
            <Grid>
              <Card
                className={`${classes.card} ${selectedType === 'simple' ? 'selected' : ''}`}
                onClick={this.selectType('simple')}
              >
                <CardContent>
                  <h4>Simple</h4>
                  <p>Product list is shown irrespective of Farms and Fields</p>
                  <img src={SimpleView} alt="simple" />
                </CardContent>
              </Card>
            </Grid>
            <Grid>
              <Card
                className={`${classes.card} ${selectedType === 'advanced' ? 'selected' : ''}`}
                onClick={this.selectType('advanced')}
              >
                <CardContent>
                  <h4>Advanced</h4>
                  <p>Product list is grouped by farms and fields</p>
                  <img src={AdvancedView} alt="advanced" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <div className={classes.dialogActions}>
          <Button
            disabled={!selectedType}
            onClick={() => this.createPurchaseOrder()}
            variant="contained"
            color="primary"
          >
            Switch
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(switchDialogStyles)(CreatePurchaseOrderDialog);
