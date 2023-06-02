import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import ReactTable from 'react-table';

// core components
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import axios from 'axios';

import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';

import { convertToAdvancedDialogStyles } from './convert_to_advanced_dialog.styles';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

class convertToAdvancedDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      farmName: '',
      fieldName: '',
      showFarmSetup: false,
      selectedPo: 'default',
      advanceOrderData: [],
    };
    //this.customerID = parseInt(props.match.params.customer_id, 10);
  }
  componentDidMount = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/purchase_orders/orderTemplate`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((res) => {
        const advanceOrderData = [];
        res.data.data.length > 0 &&
          res.data.data
            .filter((c) => this.props.purchaseOrder.customerId == c.customerId)
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
        this.setState({ advanceOrderData: advanceOrderData });
      })
      .catch((e) => {
        console.log(e, 'e');
      });
  };

  onFarmNameInputChange(name) {
    this.setState({
      farmName: name,
    });
  }

  onFieldNameInputChange(name) {
    this.setState({
      fieldName: name,
    });
  }

  close = () => {
    this.setState({
      farmName: '',
      fieldName: '',
    });
    this.props.reload();
    this.props.onClose();
  };

  convertToAdvanced = async () => {
    const {
      updatePurchaseOrder,
      createFarm,
      updateCustomerCustomProduct,
      editCustomerMonsantoProduct,
      editRelatedProduct,
      purchaseOrder,
    } = this.props;
    const { farmName, fieldName, advanceOrderData, selectedPo } = this.state;
    let customerId = purchaseOrder.customerId;

    let name = farmName === '' ? 'Farm1' : farmName;
    let shareholderData = [];

    if (advanceOrderData.length > 0 && selectedPo !== 'default') {
      const list = advanceOrderData.find((f) => f.orderId == selectedPo).List;

      name = list.length > 0 && list[0].farmName;
      shareholderData = list.length > 0 && list[0].shareHolderData;
    }

    await createFarm(customerId, {
      name: name,
      shareholderData: shareholderData,
    }).then((action) => {
      purchaseOrder.farmData.push({
        farmId: action.payload.id,
        shareholderData: shareholderData,
      });
      purchaseOrder.isSimple = false;
      updatePurchaseOrder(customerId, purchaseOrder.id, {
        isSimple: purchaseOrder.isSimple,
        farmData: purchaseOrder.farmData,
      });
      purchaseOrder.CustomerProducts.forEach((CustomerProduct) => {
        const data = {
          CustomerProductId: CustomerProduct.id,
          farmId: action.payload.id,
          fieldName,
          shareholderData: shareholderData,
        };
        editRelatedProduct(customerId, CustomerProduct.id, data);
      });
      purchaseOrder.CustomerCustomProducts.forEach((CustomerCustomProduct) => {
        const data = {
          farmId: action.payload.id,
          fieldName,
          shareholderData: shareholderData,
        };
        updateCustomerCustomProduct(customerId, CustomerCustomProduct.id, data);
      });
      purchaseOrder.CustomerMonsantoProducts.forEach((CustomerMonsantoProduct) => {
        const data = {
          farmId: action.payload.id,
          fieldName,

          shareholderData: shareholderData,
        };
        editCustomerMonsantoProduct(customerId, CustomerMonsantoProduct.id, data);
      });
    });

    if (advanceOrderData.length > 0 && selectedPo !== 'default') {
      const list = advanceOrderData.find((f) => f.orderId == selectedPo).List;

      list.length > 1 &&
        list.slice(1).map(async (l) => {
          await createFarm(customerId, {
            name: l.farmName,
            shareholderData: l.shareHolderData,
          }).then((action) => {
            purchaseOrder.farmData.push({
              farmId: action.payload.id,
              shareholderData: shareholderData,
            });
            purchaseOrder.isSimple = false;
            updatePurchaseOrder(customerId, purchaseOrder.id, {
              isSimple: purchaseOrder.isSimple,
              farmData: purchaseOrder.farmData,
            });
          });
        });
    }
    await this.props.reload();
    await this.close();
  };

  render() {
    const { open, classes, purchaseOrder } = this.props;
    const { fieldName, farmName, showFarmSetup, selectedPo, advanceOrderData } = this.state;

    const subject = purchaseOrder.isQuote ? 'Quote' : 'Purchase Order';
    const name = `PO#${purchaseOrder.id} - ${purchaseOrder.name}`;

    return (
      <Dialog
        open={open}
        onClose={() => this.close()}
        TransitionComponent={Transition}
        maxWidth="md"
        classes={{
          paper: classes.paper,
        }}
      >
        <DialogTitle>Convert {name} from simple to advanced</DialogTitle>
        <DialogContent className={classes.contentContainer}>
          <Typography variant="subheading" color="inherit">
            All the products in current {subject} will be moved into a default field and a default farm.
          </Typography>
          <Typography variant="subheading" color="inherit">
            You can change the names of farm and filed under.
          </Typography>
          {advanceOrderData.length > 0 && (
            <div className={classes.inputRow}>
              <div className={classes.farmcheckbox}>
                <Checkbox
                  checked={showFarmSetup}
                  value={showFarmSetup}
                  onChange={() =>
                    this.setState({ showFarmSetup: !this.state.showFarmSetup, selectedPo: advanceOrderData[0].orderId })
                  }
                />
                Use Farm and shareholder set up from before
              </div>
            </div>
          )}

          {showFarmSetup && (
            <FormControl style={{ width: '100%', marginTop: '20px' }}>
              <InputLabel id="demo-multiple-checkbox-label">Advance Order Templete</InputLabel>
              <Select value={selectedPo} onChange={(e) => this.setState({ selectedPo: e.target.value })}>
                {advanceOrderData.map((p) => {
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
          )}

          {showFarmSetup && (
            <div style={{ width: '100%' }}>
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
          {!showFarmSetup && (
            <div className={classes.inputRow}>
              <FormControl className={classes.purchaseOrderInput}>
                <CustomInput
                  labelText="Farm Name"
                  id="farm-name"
                  inputProps={{
                    className: classes.nameInput,
                    value: farmName,
                    onChange: (e) => this.onFarmNameInputChange(e.target.value),
                  }}
                />
              </FormControl>
              <FormControl className={classes.purchaseOrderInput}>
                <CustomInput
                  labelText="Field Name"
                  id="field-name"
                  inputProps={{
                    className: classes.nameInput,
                    value: fieldName,
                    onChange: (e) => this.onFieldNameInputChange(e.target.value),
                  }}
                />
              </FormControl>
            </div>
          )}
          {!showFarmSetup && (
            <Typography variant="subheading" color="inherit">
              You can add additional farms and fields after this {subject} is converted
            </Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button color="primary" className={classes.cta} onClick={() => this.convertToAdvanced()} id="convertAPO">
            Convert
          </Button>
          <Button onClick={() => this.close()}>Close</Button>
        </DialogActions>
        {showFarmSetup && (
          <a style={{ padding: '0px 0px 20px 20px' }}>
            You will move all products to the first farm but you can move them later if you want to
          </a>
        )}
      </Dialog>
    );
  }
}
export default withStyles(convertToAdvancedDialogStyles)(convertToAdvancedDialog);
