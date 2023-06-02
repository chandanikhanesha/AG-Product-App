import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

// material ui
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import SimpleView from '../../assets/img/Simple-View.png';
import AdvancedView from '../../assets/img/Advanced-View.png';

import { createPurchaseOrderForCustomer } from '../../store/actions';

const styles = {
  dialogPaper: {
    maxWidth: 800,
  },
  dialogTitle: {
    padding: '0 24px',
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
  },
  dialogActions: {
    padding: 24,
    justifyContent: 'flex-end',
    display: 'flex',
  },
  paper: {
    padding: '20px 80px',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  paperTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardContainer: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    width: 250,
    height: 270,
    margin: 10,
    cursor: 'pointer',
    borderColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    '&:hover, &.selected': {
      borderColor: '#38A154',
    },
    transition: 'border-color 0.2s ease',
  },
  note: {
    color: '#6d6d6d',
    fontSize: 12,
  },
};

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
    const kind = selectedType;
    const isSimple = kind === 'simple';
    const customerId = this.props.customerId;
    const routeSubject = subjectName === 'Quote' ? 'quote' : 'purchase_order';

    createPurchaseOrderForCustomer(customerId, { isQuote, isSimple }).then((response) => {
      onClose();
      if (this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id === customerId)) {
        this.props.history.push(`/app/dealers/${customerId}/${routeSubject}/${response.payload.id}`);
      } else {
        this.props.history.push(`/app/customers/${customerId}/${routeSubject}/${response.payload.id}`);
      }
    });
  }

  selectType = (type) => () => {
    this.setState({
      selectedType: type,
    });
  };

  render() {
    const { subjectName, selectedType } = this.state;
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
          <h4>Select View</h4>
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <DialogContent className={classes.paper}>
          <p className={classes.paperTitle}>Which view would you like to use for {subjectName}?</p>
          <Grid container className={classes.cardContainer}>
            <Grid>
              <Card
                className={`${classes.card} ${selectedType === 'simple' ? 'selected' : ''}`}
                onClick={this.selectType('simple')}
              >
                <CardContent>
                  <h4>Simple</h4>
                  <p>Product list is shown irrespective of Farms and Fields</p>
                  <img src={SimpleView} alt="simple"></img>
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
          <p className={classes.note}>
            The view that you select here will be set as your default. <br />
            Next time, you can go to ‘three dots’ icon menu at the top right of the page, and click on Switch Views.
          </p>
        </DialogContent>
        <div className={classes.dialogActions}>
          <Button
            disabled={!selectedType}
            onClick={() => this.createPurchaseOrder()}
            variant="contained"
            color="primary"
          >
            Proceed
          </Button>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createPurchaseOrderForCustomer,
    },
    dispatch,
  );

export default withRouter(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreatePurchaseOrderDialog)));
