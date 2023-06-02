import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Creatable from 'react-select/creatable';
import SweetAlert from 'react-bootstrap-sweetalert';
import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';
import { flatten } from 'lodash/array';
import { format } from 'date-fns';
import moment from 'moment';

// material-ui icons
import Business from '@material-ui/icons/Business';
import Add from '@material-ui/icons/Add';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Remove from '@material-ui/icons/Remove';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DatePicker } from '@material-ui/pickers';

// material-dashboard
import Table from '../../components/material-dashboard/Table/Table';
import Button from '../../components/material-dashboard/CustomButtons/Button';

// custom components
import CTABar from '../cta-bar';

import { getQtyOrdered, getQtyShipped, getGrowerOrder, getGrowerOrderDelivered } from '../../utilities/product';

const styles = (theme) =>
  Object.assign(
    {
      cardIcon: {
        color: 'white',
      },
      select: {
        width: '100%',
        marginBottom: '16px',
      },
      root: {
        flexGrow: 1,
        height: 250,
      },
      textField: {
        marginBottom: '16px',
      },
      input: {
        display: 'flex',
        padding: 0,
      },
      valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
      },
      singleValue: {
        fontSize: 16,
      },
      placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
      },
      paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
      },
      divider: {
        height: theme.spacing.unit * 2,
      },
      disabledInput: {
        background: '#ececec',
        opacity: 0.7,
      },
      transferIcons: {
        height: '1.5em',
        width: '1.5em',
        cursor: 'pointer',
      },
      transferTitle: {
        margin: '.25em auto',
        fontSize: '1.5em',
        textDecoration: 'underline',
      },
      transferInfoTable: {},
    },
    sweetAlertStyle,
  );

// const upperCase = str =>
//   str.replace(/(^.)/, (matchedString, first) => first.toUpperCase());

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      required={true}
      className={props.selectProps.classes.textField}
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          required: true,
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      value={props.data.value}
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography color="textSecondary" className={props.selectProps.classes.placeholder} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

let duplicateCache, directionCache;

class ProductForm extends Component {
  state = {
    matrix: [],
    hideLotAlert: null,
    showLotSeedDealerDialog: false,

    // lot row seed dealer modal
    seedDealerName: '',
    seedDealerId: '',
    seedDealerAddress: '',
    seedDealerTransferDate: new Date(),
  };

  constructor(props) {
    super(props);
    this.clearSeedDealerForm = this.clearSeedDealerForm.bind(this);
  }

  componentWillMount() {
    const { product } = this.props;

    if (!(product && product.lots)) return;

    let newMatrix = product.lots;

    this.setState({
      matrix: newMatrix,
    });

    this.props.setLotRows(newMatrix);
  }

  handleMatrixChange = (seedSizeId, packagingId, duplicate, name) => (e) => {
    let newMatrix = Object.assign([], this.state.matrix);
    let noDuplicate = duplicate === undefined || duplicate === null;
    let matrixItem = newMatrix.find(
      (matrixItem) =>
        matrixItem.seedSizeId === seedSizeId &&
        matrixItem.packagingId === packagingId &&
        (noDuplicate
          ? matrixItem.duplicate === undefined || matrixItem.duplicate === null
          : matrixItem.duplicate === duplicate),
    );

    if (matrixItem) {
      matrixItem[name] = e.target.value;
      // when changing transfer, need to makre sure quantity and orderAmount are correct
      if (name === 'transfer') {
        if (e.target.value === 'in') {
          matrixItem.quantity = Math.abs(matrixItem.quantity);
          matrixItem.orderAmount = Math.abs(matrixItem.orderAmount);
        } else if (e.target.value === 'out') {
          matrixItem.quantity = -Math.abs(matrixItem.quantity);
          matrixItem.orderAmount = -Math.abs(matrixItem.orderAmount);
        }
      }
    } else {
      let newMatrixItem = {
        seedSizeId,
        packagingId,
        [name]: e.target.value,
      };
      newMatrix.push(newMatrixItem);
    }

    this.setState({ matrix: newMatrix });
    this.props.setLotRows(newMatrix);
  };

  remove(duplicate) {
    duplicate.removeMe = true;
    this.setState({ state: this.state });
  }

  addDuplicate(seedSizeId, packagingId, index) {
    const { matrix } = this.state;

    let newMatrix = Object.assign([], matrix);
    let duplicateNumber = newMatrix
      .filter((m) => m.seedSizeId === seedSizeId && m.packagingId === packagingId)
      .reduce((acc, m) => {
        if (m.duplicate >= acc) return m.duplicate + 1;
        return acc;
      }, 0);

    let duplicate = {
      seedSizeId,
      packagingId,
      duplicate: duplicateNumber,
      lotNumber: '',
      quantity: 0,
      orderAmount: 0,
    };

    newMatrix.splice(index, 0, duplicate);
    this.setState({
      matrix: newMatrix,
    });
  }

  addHiddenLot(seedSizeId, packagingId) {
    const { addHiddenLot } = this.props;

    addHiddenLot(seedSizeId, packagingId);

    this.setState({
      hideLotAlert: null,
    });
  }

  showGlobalHideModal = (seedSizeId, packagingId) => {
    const { classes } = this.props;

    this.setState({
      hideLotAlert: (
        <SweetAlert
          warning
          showCancel
          title="Hide Seed Size / Packaging combo"
          onConfirm={() => this.addHiddenLot(seedSizeId, packagingId)}
          onCancel={() => {
            this.setState({
              hideLotAlert: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Clicking accept will hide this Seed Size / Packaging combination for all products, are you sure you want to do
          this?
        </SweetAlert>
      ),
    });
  };

  setTransfer(duplicate, direction) {
    duplicateCache = duplicate;
    directionCache = direction;
    let state = {
      showLotSeedDealerDialog: true,
    };
    if (duplicateCache.transferInfo) state = { ...state, ...duplicateCache.transferInfo };

    this.setState(state);
  }

  handleSeedDealerDialogClose = () => {
    this.setState({
      showLotSeedDealerDialog: false,
    });
  };

  handleModalChange = (name) => (e) => {
    if (Array.isArray(e) || e == null) {
      this.clearSeedDealerForm();
      return;
    } else if ('value' in e) {
      return this.setState(
        {
          [name]: e.value,
        },
        () => {
          this.prepopulateSeedDealerInfo(this.state.seedDealerName);
          return;
        },
      );
    } else if ('_d' in e) {
      return this.setState({
        [name]: moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      });
    } else {
      return this.setState({
        [name]: e.target.value,
      });
    }
  };

  handleModalSelectChange = (name) => (data) => {
    if (data.value == null) return;
    return this.setState({
      [name]: data.value,
    });
  };

  prepopulateSeedDealerInfo = (name) => {
    const { seedDealers } = this.props;
    const seedDealer = seedDealers.find((sd) => sd.seedDealerName === name);
    if (seedDealer && 'seedDealerId' in seedDealer) {
      const { seedDealerId, seedDealerAddress } = seedDealer;
      this.setState({
        seedDealerId,
        seedDealerAddress,
      });
    }
  };

  saveSeedDealerInfo = () => {
    const { seedDealerName, seedDealerId, seedDealerAddress, seedDealerTransferDate } = this.state;
    this.handleMatrixChange(
      duplicateCache.seedSizeId,
      duplicateCache.packagingId,
      duplicateCache.duplicate,
      'transfer',
    )({ target: { value: directionCache } });
    this.handleMatrixChange(
      duplicateCache.seedSizeId,
      duplicateCache.packagingId,
      duplicateCache.duplicate,
      'transferInfo',
    )({ target: { value: { seedDealerName, seedDealerId, seedDealerAddress, seedDealerTransferDate } } });
    this.clearSeedDealerForm();
    this.setState({ showLotSeedDealerDialog: false });
  };

  cancelSaveSeedDealerInfo = () => {
    this.clearSeedDealerForm();
    this.setState({ showLotSeedDealerDialog: false });
  };

  clearSeedDealerForm() {
    duplicateCache = null;
    directionCache = null;
    this.setState({
      seedDealerName: '',
      seedDealerId: '',
      seedDealerAddress: '',
      seedDealerTransferDate: moment.utc().format('YYYY-MM-DD') + 'T00:00:00.000Z',
    });
  }

  renderSeedDealerDialog() {
    const { showLotSeedDealerDialog, seedDealerName, seedDealerId, seedDealerAddress, seedDealerTransferDate } =
      this.state;
    const { seedDealers, classes } = this.props;
    //const lots = customerProducts
    const seedDealerOptions = Array.from(
      seedDealers.reduce((set, item) => {
        set.add(item.seedDealerName);
        return set;
      }, new Set()),
    ).map((dealerName) => ({
      label: dealerName,
      value: dealerName,
    }));

    const selectStyles = {
      input: (base) => ({
        ...base,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <Dialog
        open={showLotSeedDealerDialog}
        onClose={() => {
          this.clearSeedDealerForm();
          this.setState({ showLotSeedDealerDialog: false });
        }}
      >
        <DialogTitle>Seed Dealer Info</DialogTitle>

        <DialogContent>
          <Creatable
            classes={classes}
            styles={selectStyles}
            components={components}
            onChange={this.handleModalChange('seedDealerName')}
            onInputChange={this.handleModalSelectChange('seedDealerName')}
            placeholder="Name"
            isClearable
            options={seedDealerOptions}
            value={{ label: seedDealerName, value: seedDealerName }}
            textFieldProps={{
              label: 'Name',
              InputLabelProps: {
                shrink: true,
              },
            }}
          />
          <CustomInput
            labelText="Id"
            inputProps={{
              value: seedDealerId,
              onChange: this.handleModalChange('seedDealerId'),
            }}
          />{' '}
          <br />
          <CustomInput
            labelText="Address"
            inputProps={{
              value: seedDealerAddress,
              onChange: this.handleModalChange('seedDealerAddress'),
            }}
          />{' '}
          <br />
          <br />
          <DatePicker
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            disablePast={false}
            emptyLabel="Transfer Date"
            value={seedDealerTransferDate}
            onChange={this.handleModalChange('seedDealerTransferDate')}
          />{' '}
          <br />
        </DialogContent>

        <DialogActions>
          <CTABar
            form={false}
            text={'Submit'}
            primaryAction={this.saveSeedDealerInfo}
            secondaryAction={this.cancelSaveSeedDealerInfo}
          />
        </DialogActions>
      </Dialog>
    );
  }

  renderMatrixItems(seedSize, packaging, deliveryReceiptDetails, duplicate) {
    const { customerProducts, classes } = this.props;
    const { matrix } = this.state;

    let matrixItem = duplicate
      ? duplicate
      : matrix.find(
          (matrixItem) =>
            matrixItem.seedSizeId === seedSize.id &&
            matrixItem.packagingId === packaging.id &&
            typeof matrixItem.duplicate !== 'number',
        );

    let isTransferOut = matrixItem && matrixItem.transfer === 'out';
    let isTransferIn = matrixItem && matrixItem.transfer === 'in';

    let lotNumber = matrixItem ? matrixItem.lotNumber : '';
    let orderAmount = matrixItem ? matrixItem.orderAmount : '';
    if (isTransferOut) orderAmount = -Math.abs(orderAmount);
    if (isTransferIn) orderAmount = Math.abs(orderAmount);
    let shipped = matrixItem ? matrixItem.quantity : 0;
    if (isTransferOut) shipped = -Math.abs(shipped);
    if (isTransferIn) shipped = Math.abs(shipped);
    let yetToShip = orderAmount - shipped;
    let growerOrder = customerProducts
      .filter((cp) => cp.seedSizeId === seedSize.id && cp.packagingId === packaging.id)
      .reduce((acc, customerProduct) => acc + customerProduct.orderQty, 0);
    let growerOrderDelivered = matrixItem
      ? deliveryReceiptDetails
          .filter((detail) => detail.lotId === matrixItem.id)
          .reduce((acc, detail) => acc + detail.amountDelivered, 0)
      : 0;
    let growerOrderYetToDeliver = growerOrder - growerOrderDelivered;
    let longShort = orderAmount - growerOrder;
    let qtyAtWarehouse = shipped - growerOrderDelivered;

    return [
      seedSize.name,
      packaging.name,
      <CustomInput
        labelText="Lot Number"
        inputProps={{
          value: lotNumber || '',
          onChange: this.handleMatrixChange(
            seedSize.id,
            packaging.id,
            duplicate ? matrixItem.duplicate : undefined,
            'lotNumber',
          ),
        }}
      />,
      <CustomInput
        labelText="Ordered"
        inputProps={{
          value: orderAmount || '',
          type: 'number',
          onChange: (e) => {
            const value = {
              target: {
                value: e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value,
              },
            };
            this.handleMatrixChange(
              seedSize.id,
              packaging.id,
              duplicate ? matrixItem.duplicate : undefined,
              'orderAmount',
            )(value);
          },
        }}
      />,
      <CustomInput
        labelText="Shipped"
        inputProps={{
          value: shipped,
          type: 'number',
          onChange: (e) => {
            const value = {
              target: {
                value: e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value,
              },
            };
            this.handleMatrixChange(
              seedSize.id,
              packaging.id,
              duplicate ? matrixItem.duplicate : undefined,
              'quantity',
            )(value);
          },
        }}
      />,
      <CustomInput
        labelText="Yet to ship"
        inputProps={{
          value: yetToShip,
          type: 'number',
          className: classes.disabledInput,
          disabled: true,
        }}
      />,
      <CustomInput
        labelText="Grower order"
        inputProps={{
          value: growerOrder,
          className: classes.disabledInput,
          disabled: true,
        }}
      />,
      <CustomInput
        labelText="Grower order delivered"
        inputProps={{
          className: classes.disabledInput,
          disabled: true,
          value: growerOrderDelivered,
        }}
      />,
      <CustomInput
        labelText="Grower order yet to deliver"
        inputProps={{
          className: classes.disabledInput,
          disabled: true,
          value: growerOrderYetToDeliver,
        }}
      />,
      <CustomInput
        labelText="Long / Short"
        inputProps={{
          className: classes.disabledInput,
          disabled: true,
          value: longShort,
        }}
      />,
      <CustomInput
        labelText="Qty at warehouse"
        inputProps={{
          className: classes.disabledInput,
          disabled: true,
          value: qtyAtWarehouse,
        }}
      />,
    ];
  }

  renderMatrixForm(deliveryReceiptDetails) {
    const { seedSizes, packagings, seedCompany, seedType, classes } = this.props;
    const { matrix } = this.state;

    let tableData = [];
    const availableSeedSizes = seedSizes.filter(
      (ss) => ss.seedCompanyId === seedCompany.id && ss.seedType === seedType,
    );
    const availablePackagings = packagings.filter((p) => p.seedCompanyId === seedCompany.id && p.seedType === seedType);

    availableSeedSizes.forEach((seedSize) => {
      return availablePackagings.forEach((packaging) => {
        // if the customer has hidden this seed size / packaging combo, dont render it
        //if (hiddenLots.filter(hl => hl.seedSizeId === seedSize.id && hl.packagingId === packaging.id).length) return

        tableData.push([
          <span>
            <Button
              justIcon
              round
              size="sm"
              color="primary"
              onClick={() => this.addDuplicate(seedSize.id, packaging.id, tableData.length)}
            >
              <Add />
            </Button>

            <Button
              justIcon
              round
              size="sm"
              color="info"
              onClick={() => this.showGlobalHideModal(seedSize.id, packaging.id)}
            >
              <VisibilityOff />
            </Button>
          </span>,
          ...this.renderMatrixItems(seedSize, packaging, deliveryReceiptDetails, false),
        ]);

        let duplicates = matrix.filter(
          (matrixItem) =>
            matrixItem.seedSizeId === seedSize.id &&
            matrixItem.packagingId === packaging.id &&
            typeof matrixItem.duplicate === 'number' &&
            matrixItem.removeMe !== true,
        );

        duplicates.forEach((duplicate) => {
          if (duplicate.transfer !== undefined && duplicate.transfer !== null) {
            const dealerInfoTable = (
              <table>
                <tbody>
                  <tr>
                    <td>Seed Dealer Name:</td>
                    <td>{duplicate.transferInfo.seedDealerName}</td>
                  </tr>
                  <tr>
                    <td>Seed Dealer ID:</td>
                    <td>{duplicate.transferInfo.seedDealerId}</td>
                  </tr>
                  <tr>
                    <td>Updated At: </td>

                    <td>{moment.utc(duplicate.transferInfo.seedDealerTransferDate).format('MMMM Do YYYY')}</td>
                  </tr>
                </tbody>
              </table>
            );

            tableData.push([
              <div>
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit">Seed Dealer Info</Typography>
                      {dealerInfoTable}
                    </React.Fragment>
                  }
                >
                  {duplicate.transfer === 'in' ? (
                    <ArrowForward className={classes.transferIcons} />
                  ) : (
                    <ArrowBack className={classes.transferIcons} />
                  )}
                </HtmlTooltip>
                {/* <Tooltip
                  title={`Transferred ${duplicate.transfer}`}
                >
                  {
                    duplicate.transfer === 'in'
                      ? <ArrowForward className={classes.transferIcons} />
                      : <ArrowBack className={classes.transferIcons} />
                  }
                </Tooltip> */}
                <Tooltip title="Remove">
                  <Button justIcon round size="sm" color="danger" onClick={() => this.remove(duplicate)}>
                    <Remove />
                  </Button>
                </Tooltip>
              </div>,
              ...this.renderMatrixItems(seedSize, packaging, deliveryReceiptDetails, duplicate),
            ]);
          } else {
            tableData.push([
              <div>
                <Tooltip title="Transfer in">
                  <Button justIcon round size="sm" color="success" onClick={() => this.setTransfer(duplicate, 'in')}>
                    <ArrowForward />
                  </Button>
                </Tooltip>

                <Tooltip title="Transfer out">
                  <Button justIcon round size="sm" color="warning" onClick={() => this.setTransfer(duplicate, 'out')}>
                    <ArrowBack />
                  </Button>
                </Tooltip>

                <Tooltip title="Remove">
                  <Button justIcon round size="sm" color="danger" onClick={() => this.remove(duplicate)}>
                    <Remove />
                  </Button>
                </Tooltip>
              </div>,
              ...this.renderMatrixItems(seedSize, packaging, deliveryReceiptDetails, duplicate),
            ]);
          }
        });
      });
    });

    return (
      <Table
        tableHead={[
          '',
          'Seed Size',
          'Packaging',
          'Lot #',
          'Dealer Order',
          'Qty shipped from seed co',
          'Qty yet to ship from seed co',
          'Grower Order',
          'Grower Order Delivered',
          'Grower order yet to deliver',
          'Long / Short',
          'Quantity at warehouse',
          '',
        ]}
        tableData={tableData}
      />
    );
  }

  render() {
    const {
      handleInputChange,
      handleChange,
      handleSelectChange,
      onSubmit,
      seedType,
      treatment,
      brand,
      blend,
      msrp,
      classes,
      submitText,
      cancel,
      suggestions,
      customerProducts,
      product,
      deliveryReceipts,
      seedCompany,
    } = this.props;

    // TODO: on hard refresh there is no product, this just causes a blank page but prevents errors
    if (!product || !seedCompany) return null;

    const selectStyles = {
      input: (base) => ({
        ...base,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));

    const qtyOrdered = getQtyOrdered(product);
    let shipped = getQtyShipped(product);
    let growerOrderDelivered = getGrowerOrderDelivered(product, deliveryReceiptDetails);

    return (
      <GridContainer justifyContent="center">
        {this.renderSeedDealerDialog()}
        {this.state.hideLotAlert}
        <GridItem xs={10}>
          <form action="#" onSubmit={onSubmit}>
            <Card>
              <CardHeader>
                <CardIcon className={classes.cardIcon} color="gray">
                  <Business />
                </CardIcon>

                <h4>{product ? 'Update' : 'Create'} product</h4>
              </CardHeader>

              <CardBody>
                <FormControl className={classes.select}>
                  <InputLabel htmlFor="seedType">Seed Type</InputLabel>

                  <Select
                    value={seedType}
                    onChange={(e) => handleChange('seedType')(e)}
                    inputProps={{
                      required: true,
                      id: 'seedType',
                      name: 'seedType',
                    }}
                  >
                    {['Corn', 'Sorghum', 'Soybean']
                      .filter((seedType) => seedCompany[`${seedType.toLowerCase()}BrandName`].trim() !== '')
                      .map((seedType) => (
                        <MenuItem key={seedType} value={seedType.toUpperCase()}>
                          {seedCompany[`${seedType.toLowerCase()}BrandName`]}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {seedType !== 'SORGHUM' && (
                  <Creatable
                    classes={classes}
                    styles={selectStyles}
                    components={components}
                    onChange={handleSelectChange('brand')}
                    onInputChange={handleInputChange('brand')}
                    placeholder="Trait Type"
                    options={suggestions.brand}
                    isDisabled={!seedType}
                    value={{ label: brand, value: brand }}
                    textFieldProps={{
                      label: 'Trait',
                      InputLabelProps: {
                        shrink: true,
                      },
                    }}
                  />
                )}

                <Creatable
                  classes={classes}
                  styles={selectStyles}
                  components={components}
                  onChange={handleSelectChange('blend')}
                  onInputChange={handleInputChange('blend')}
                  placeholder="Variety Type"
                  options={suggestions.blend}
                  isDisabled={!seedType}
                  value={{ label: blend, value: blend }}
                  textFieldProps={{
                    label: 'Variety',
                    InputLabelProps: {
                      shrink: true,
                    },
                  }}
                />

                <Creatable
                  classes={classes}
                  styles={selectStyles}
                  components={components}
                  onChange={handleSelectChange('treatment')}
                  onInputChange={handleInputChange('treatment')}
                  placeholder="Treatment Type"
                  options={suggestions.treatment}
                  isDisabled={!seedType}
                  value={{ label: treatment, value: treatment }}
                  textFieldProps={{
                    label: 'Treatment',
                    InputLabelProps: {
                      shrink: true,
                    },
                  }}
                />

                <CustomInput
                  labelText="MSRP"
                  id="msrp"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    value: msrp,
                    type: 'number',
                    onChange: handleChange('msrp'),
                  }}
                />

                <CustomInput
                  labelText="Dealer Order"
                  id="orderAmount"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    className: classes.disabledInput,
                    disabled: true,
                    value: qtyOrdered,
                    type: 'number',
                  }}
                />

                <CustomInput
                  labelText="Qty shipped from seed company"
                  id="deliveredAmount"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    className: classes.disabledInput,
                    disabled: true,
                    value: shipped,
                    type: 'number',
                  }}
                />

                <CustomInput
                  labelText="Qty yet to ship from seed company"
                  id="qty-yet-to-ship"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    className: classes.disabledInput,
                    disabled: true,
                    value: qtyOrdered - shipped,
                    type: 'number',
                  }}
                />

                <CustomInput
                  labelText="Grower Order"
                  id="grower-order"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    className: classes.disabledInput,
                    disabled: true,
                    value: getGrowerOrder(product, customerProducts),
                    type: 'number',
                  }}
                />

                <CustomInput
                  labelText="Grower Order Delivered"
                  id="grower-order-delivered"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    className: classes.disabledInput,
                    disabled: true,
                    value: growerOrderDelivered,
                    type: 'number',
                  }}
                />

                <CustomInput
                  labelText="Long / Short"
                  id="long-short"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    className: classes.disabledInput,
                    disabled: true,
                    value: qtyOrdered - getGrowerOrder(product, customerProducts),
                    type: 'number',
                  }}
                />

                <CustomInput
                  labelText="Qty at Warehouse"
                  id="long-short"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    className: classes.disabledInput,
                    disabled: true,
                    value: shipped - growerOrderDelivered,
                    type: 'number',
                  }}
                />

                <h4>Lots</h4>
                {this.renderMatrixForm(deliveryReceiptDetails)}
              </CardBody>

              <CardFooter>
                <CTABar text={submitText} secondaryAction={() => cancel()} />
              </CardFooter>
            </Card>
          </form>
        </GridItem>
      </GridContainer>
    );
  }
}

export default withStyles(styles)(ProductForm);
