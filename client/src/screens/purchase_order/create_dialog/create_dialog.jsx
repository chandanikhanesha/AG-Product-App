import React, { Component } from 'react';
import { withStyles, FormControl, MenuItem } from '@material-ui/core';
import ReactTable from 'react-table';

// material ui
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';

import SimpleView from '../../../assets/img/Simple-View.png';
import AdvancedView from '../../../assets/img/Advanced-View.png';
import { totalPlansGroup } from '../../../utilities/subscriptionPlans';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

import { createPurchaseOrderDialogStyles } from './create_dialog.styles';

class CreatePurchaseOrderDialog extends Component {
  state = {
    isQuote: false,
    subjectName: 'Purchase Order',
    selectedType: null,
    name: '',
    selectedPo: 'default',
    showFarmSetup: false,
  };

  componentDidMount() {
    const { isQuote } = this.props;
    this.setState({
      isQuote: isQuote,
      subjectName: isQuote ? 'Quote' : 'Purchase Order',
    });
  }

  createPurchaseOrder() {
    const { createPurchaseOrderForCustomer, onClose, customers } = this.props;
    const { isQuote, subjectName, selectedType, name, selectedPo } = this.state;
    const kind = selectedType;
    const isSimple = kind === 'simple';
    const customerId = this.props.customerId;
    const routeSubject = subjectName === 'Quote' ? 'quote' : 'purchase_order';
    const currentCust = customers.find((c) => c.id == customerId);
    const selectedPurchaseOrder =
      currentCust.PurchaseOrders.length > 0 ? currentCust.PurchaseOrders.find((p) => p.id == selectedPo) : undefined;

    const data =
      selectedPurchaseOrder !== undefined
        ? {
            isQuote,
            isSimple,
            name,
            farmData: selectedPurchaseOrder.farmData,
            shareholderData: selectedPurchaseOrder.shareholderData,
          }
        : {
            isQuote,
            isSimple,
            name,
          };

    createPurchaseOrderForCustomer(customerId, data).then((response) => {
      onClose();
      if (this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id === customerId)) {
        this.props.history.push(`/app/dealers/${customerId}/${routeSubject}/${response.payload.id}`);
      } else if (this.props.fromPurchaseOrder) {
        this.props.newCreatedPurchaseOrder({ ...response.payload, CustomerMonsantoProducts: [] });
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

  handleNameChange = () => (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  goToSubscriptionPage = () => {
    this.props.history.push(`/app/admin/subscription`);
  };
  render() {
    const { subjectName, selectedType, name, selectedPo, showFarmSetup } = this.state;
    const { classes, open, onClose, subscriptionPlan, customers, customerId, templateList } = this.props;

    const currentCust = customers.find((c) => c.id == customerId);

    const advanceOrderData = [];
    templateList &&
      templateList
        .filter((c) => customerId == c.customerId)
        .reduce(function (res, value) {
          const pID = value.orderId;
          if (!res[pID]) {
            res[pID] = {
              orderId: value.orderId,
              orderName: value.orderName,
              customerId: value.customerId,
            };
            advanceOrderData.push(res[pID]);
          }

          res[pID].List =
            res[pID].List !== undefined
              ? res[pID].List.concat({
                  farmName: value.farmName,
                  shareHolderData: value.shareHolderData,
                })
              : [
                  {
                    farmName: value.farmName,
                    shareHolderData: value.shareHolderData,
                  },
                ];
          return res;
        }, {});
    return (
      <Dialog
        classes={{
          paper: classes.dialogPaper,
        }}
        open={open}
        onClose={onClose}
      >
        <div className={classes.dialogTitle}>
          <div className={classes.dialogTitleAction}>
            <h4>Select View</h4>
          </div>
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <DialogContent className={classes.paper}>
          <p className={classes.paperTitle}>Which view would you like to use forrr {subjectName}?</p>
          <FormControl className={classes.nameInput}>
            <CustomInput
              labelText={`Name of ${subjectName}`}
              id="POname"
              formControlProps={{}}
              inputProps={{
                value: name,
                type: 'text',
                onChange: this.handleNameChange(),
              }}
            />
          </FormControl>
          <Grid container className={classes.cardContainer}>
            <Grid>
              <Card
                className={`${classes.card} ${selectedType === 'simple' ? 'selected' : ''}`}
                onClick={this.selectType('simple')}
                id="simplePo"
              >
                <CardContent>
                  <h4>Simple</h4>
                  <p>Product list is shown irrespective of Farms and Fields</p>
                  <img src={SimpleView} alt="simple"></img>
                </CardContent>
              </Card>
            </Grid>
            <Grid>
              {subscriptionPlan.includes(totalPlansGroup.advanced_purchase_order.label) ? (
                <Card
                  className={`${classes.card} ${selectedType === 'advanced' ? 'selected' : ''}`}
                  onClick={this.selectType('advanced')}
                  id="advancePO"
                >
                  <CardContent>
                    <h4>Advanced</h4>
                    <p>Product list is grouped by farms and fields</p>
                    <img src={AdvancedView} alt="advanced" />
                  </CardContent>
                </Card>
              ) : (
                <Card className={classes.card} onClick={this.goToSubscriptionPage}>
                  <CardContent>
                    <h5>Click to purchase feature</h5>
                    <p>You don't have purchased this feature</p>
                    <p>Advanced (Product list is grouped by farms and fields)</p>
                    <img src={AdvancedView} alt="advanced" />
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
          {templateList !== undefined &&
            selectedType == 'advanced' &&
            currentCust.PurchaseOrders.filter((p) => p.isSimple == false && p.isQuote == false).length > 0 && (
              <div className={classes.farmcheckbox}>
                <Checkbox
                  checked={showFarmSetup}
                  value={showFarmSetup}
                  onChange={() =>
                    this.setState({
                      showFarmSetup: !this.state.showFarmSetup,
                      selectedPo: advanceOrderData.length > 0 && advanceOrderData[0].orderId,
                    })
                  }
                />
                Use Farm and shareholder set up from before
              </div>
            )}
          {templateList !== undefined && showFarmSetup && currentCust && selectedType == 'advanced' && (
            <div>
              <FormControl style={{ width: '100%', marginBottom: '20px' }}>
                <InputLabel id="demo-multiple-checkbox-label">Advance Order Templete</InputLabel>
                <Select value={selectedPo} onChange={(e) => this.setState({ selectedPo: e.target.value })}>
                  {advanceOrderData.length > 0 &&
                    advanceOrderData.map((p) => {
                      return (
                        <MenuItem value={p.orderId}>
                          <p>
                            {p.orderId}-{p.orderName}
                          </p>
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </div>
          )}
          {showFarmSetup && selectedPo !== 'default' && (
            <div>
              <h5>AdvanceOrder Preview</h5>
              <ReactTable
                data={advanceOrderData.find((p) => p.orderId == selectedPo).List}
                columns={[
                  {
                    Header: 'FarmName',
                    id: 'farmName',
                    accessor: (d) => d,
                    Cell: (props) => {
                      const farmName = props.value.farmName;
                      return farmName ? farmName : '-' || '-';
                    },
                  },

                  {
                    Header: 'ShareHolders',
                    id: 'ShareHolders',
                    headerStyle: {
                      textAlign: 'left',
                    },
                    accessor: (d) => d,
                    Cell: (props) => {
                      return props.value !== undefined && props.value.shareHolderData.length > 0
                        ? props.value.shareHolderData.map((s) => <p>{`( ${s.name}-percentage : ${s.percentage} )`}</p>)
                        : '-';
                    },
                  },
                ]}
                minRows={1}
                showPagination={false}
                // loading={true}
              />
            </div>
          )}
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
            className={classes.submitButton}
            id="ProceedBtn"
          >
            Proceed
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(createPurchaseOrderDialogStyles)(CreatePurchaseOrderDialog);
