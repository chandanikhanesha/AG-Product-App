import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles, CardContent, Divider, Typography } from '@material-ui/core';
import { groupBy } from 'lodash';
import { DatePicker } from '@material-ui/pickers';
import Snackbar from '@material-ui/core/Snackbar';
import moment from 'moment';

// icons
// import MoneyOff from "@material-ui/icons/MoneyOff";
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';

// core components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
// import CardIcon from "components/material-dashboard/Card/CardIcon"
import CardBody from '../../components/material-dashboard/Card/CardBody';
// import CardFooter from "components/material-dashboard/Card/CardFooter"
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import Table from '../../components/material-dashboard/Table/Table';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
// custom components
import CTABar from '../cta-bar';
import { styles } from './create.styles';

import { updateDealerDiscount } from '../../store/actions';

const CustomLabel = ({ title, content, subContent, classes }) => {
  return (
    <React.Fragment>
      <Typography className={classes.customLabelTitle} variant="subheading">
        {title}
      </Typography>
      <Typography className={classes.body} variant="body2">
        {content}
      </Typography>
      <Typography className={classes.body} variant="body2">
        {subContent}
      </Typography>
    </React.Fragment>
  );
};

// const styles = theme => (Object.assign({}, checkboxStyles, {
//   cardIcon: {
//     color: 'white'
//   },
//   formControl: {
//     margin: theme.spacing.unit,
//     width: 175,
//     marginLeft: 0
//   },
//   lastDatePicker: {
//     margin: theme.spacing.unit,
//     width: 175
//   },
//   quantityTextField: {
//     width: 100
//   },
//   detailTable: {
//     '& thead': {
//       background: theme.palette.grey['100']
//     }
//   },
//   seedTypeSelector: {
//     display: 'inline-block',
//     paddingRight: 20
//   }
// }))

class EditDealerDiscount extends Component {
  state = {
    seedCompanyIds: [],
    apiSeedCompanyIds: [],
    companyIds: [],
    discountStrategy: '',
    productCategories: {},
    name: '',
    lastDate: moment.utc().format('YYYY-MM-DD') + 'T00:00:00.000Z',
    detail: [],
    applyToWholeOrder: false,
    perProductOrder: false,
    applyAsOverAllTotal: false,
    useByDefault: false,
    applyToParticularProducts: false,
    applyParticularProducts: {},
    showSnackbar: false,
    showSnackbarText: '',
  };

  componentWillMount() {
    this.initDealerDiscount();
  }

  initDealerDiscount() {
    const { dealerDiscounts, match } = this.props;
    const dealerDiscount = dealerDiscounts.find((dealerDiscount) => `${dealerDiscount.id}` === match.params.id);
    if (dealerDiscount) {
      let {
        seedCompanyIds,
        discountStrategy,
        productCategories,
        companyIds,
        name,
        lastDate,
        detail,
        applyToWholeOrder,
        perProductOrder,
        applyAsOverAllTotal,
        applyToSeedType,
        useByDefault,
        applyToParticularProducts,
        applyParticularProducts,
        apiSeedCompanyIds,
      } = dealerDiscount;
      (applyToWholeOrder = perProductOrder === true ? 'perProductOrder' : applyToWholeOrder),
        this.setState({
          seedCompanyIds,
          apiSeedCompanyIds,
          discountStrategy,
          productCategories,
          companyIds,
          name,
          lastDate,
          detail,
          applyToWholeOrder,
          perProductOrder,
          applyAsOverAllTotal,
          applyToSeedType,
          useByDefault,
          applyToParticularProducts,
          applyParticularProducts,
        });
    }
  }
  setShowSnackbar = (showSnackbarText) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
  };
  updateDiscount = (e) => {
    const { updateDealerDiscount, organizationId: organizationId, match } = this.props;
    const {
      discountStrategy,
      productCategories,
      companyIds,
      name,
      lastDate,
      detail,
      applyToWholeOrder,
      perProductOrder,
      applyAsOverAllTotal,
      useByDefault,
      seedCompanyId,
      applyToSeedType,
      applyToParticularProducts,
      applyParticularProducts,
      seedCompanyIds,
      apiSeedCompanyIds,
    } = this.state;

    e.preventDefault();

    if (applyToWholeOrder === false && !Object.keys(productCategories).length && !companyIds.length) return;
    if (!discountStrategy || !name) return;

    updateDealerDiscount(match.params.id, {
      discountStrategy,
      productCategories,
      companyIds,
      name,
      lastDate,
      detail,
      applyToWholeOrder: applyToWholeOrder === true,
      perProductOrder: Boolean(perProductOrder),
      applyAsOverAllTotal,
      useByDefault,
      seedCompanyId,
      organizationId,
      applyToSeedType,
      applyToParticularProducts,
      applyParticularProducts,
      seedCompanyIds,
      apiSeedCompanyIds,
    }).then(() => this.props.history.push('/app/setting/discount_editor'));
  };

  handleChange = (name) => (event) => {
    let val = event.target.hasOwnProperty('checked') ? event.target.checked : event.target.value;
    this.setState({
      [name]: val,
    });
  };

  handleSelectProductsChange = (seedType) => (event) => {
    this.setState({
      applyParticularProducts: {
        ...this.state.applyParticularProducts,
        [seedType]: event.target.value,
      },
    });
  };

  handleCheckboxChange = (name) => (event) => {
    const val = event.target.hasOwnProperty('checked') ? event.target.checked : event.target.value;
    this.setState({
      [name]: val,
    });
    if (name === 'applyToSeedType' && event.target.checked) {
      this.setState({
        applyToParticularProducts: !val,
      });
    }
    if (name === 'applyToParticularProducts' && event.target.checked) {
      this.setState({
        applyToSeedType: !val,
      });
    }
  };

  handleSelectChange = (event) => {
    if (event.target.name === 'applyToWholeOrder') {
      if (event.target.value === 'perProductOrder') {
        this.setState({
          applyToWholeOrder: 'perProductOrder',
          perProductOrder: true,
          discountStrategy: 'Flat Amount Discount',
        });

        return;
      }

      this.setState({
        [event.target.name]: event.target.value === 'true',
        perProductOrder: false,
      });
      return;
    }

    let val = event.target.value;
    if (event.target.name === 'seedCompanyIds') val = [val];

    this.setState({ [event.target.name]: val }, () => {
      if (this.state.discountStrategy === 'Flat Amount Discount' && this.state.detail.length === 0) {
        this.setState({
          detail: [...this.state.detail, { unit: '$' }],
        });
      }
    });
  };

  handleDateChange = (date) => {
    this.setState({
      lastDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z',
    });
  };

  handleSeedTypeChange = (seedCompanyId, seedType) => (event) => {
    let newProductCategories = Object.assign({}, this.state.productCategories);

    if (event.target.checked) {
      if (!newProductCategories[seedCompanyId]) newProductCategories[seedCompanyId] = [];
      newProductCategories[seedCompanyId].push(seedType);
    } else {
      newProductCategories[seedCompanyId] = newProductCategories[seedCompanyId].filter((st) => st !== seedType);
      if (!newProductCategories[seedCompanyId].length) delete newProductCategories[seedCompanyId];
    }

    this.setState({
      productCategories: newProductCategories,
    });
  };

  tableHeaders() {
    const { discountStrategy } = this.state;
    switch (discountStrategy) {
      case 'Quantity Discount':
        return ['Min Qty', 'Max Qty', 'Discount Value', 'Unit', ''];
      case 'Dollar Volume Discount':
        return ['Min $', 'Max $', 'Discount Value', 'Unit', ''];
      case 'Early Pay Discount':
        return ['Date', 'Discount Value', 'Unit', ''];
      case 'Flat Amount Discount':
        return ['Discount Value', 'Unit', ''];
      default:
        throw new Error('Discount strategy not correct');
    }
  }

  handleDetailChange = (name, i) => (event) => {
    let value = event._isAMomentObject
      ? moment.utc(event._d).format('YYYY-MM-DD') + 'T00:00:00.000Z'
      : event.target.value;
    let rows = this.state.detail;

    if (name === 'date') {
      const isExit = this.state.detail.find((d) =>
        d.date ? new Date(d.date).toISOString().slice(0, 10) === new Date(value).toISOString().slice(0, 10) : null,
      );

      if (isExit) {
        this.setShowSnackbar('That date is already exits,Enter a new date');
      } else {
        rows[i][name] = value;
      }
    } else {
      rows[i][name] = value;
    }
    this.setState({
      detail: rows,
    });
  };

  removeDetail = (index) => (event) => {
    let rows = this.state.detail;
    rows.splice(index, 1);
    this.setState({
      detail: rows,
    });
  };

  quantityDiscountFields() {
    const { classes } = this.props;
    const { detail } = this.state;

    return detail.map((d, i) => {
      return [
        <TextField
          className={classes.quantityTextField}
          label="Min Qty"
          type="number"
          width={100}
          onChange={this.handleDetailChange('minQty', i)}
          value={d.minQty}
        />,
        <TextField
          className={classes.quantityTextField}
          label="Max Qty"
          type="number"
          onChange={this.handleDetailChange('maxQty', i)}
          value={d.maxQty}
        />,
        <TextField
          label="Discount Value"
          onChange={this.handleDetailChange('discountValue', i)}
          value={d.discountValue === 0 ? '' : d.discountValue}
          inputProps={{
            required: true,
            type: 'number',
            step: 0.1,
            min: 0,
          }}
        />,
        <Select
          value={d.unit || '$'}
          onChange={this.handleDetailChange('unit', i)}
          inputProps={{
            required: true,
          }}
        >
          <MenuItem value={'$'}>$</MenuItem>
          <MenuItem value={'%'}>%</MenuItem>
        </Select>,
        <Button justIcon round color="primary" onClick={this.removeDetail(i)}>
          <Remove />
        </Button>,
      ];
    });
  }

  dollarVolumeDiscountFields() {
    const { classes } = this.props;
    const { detail } = this.state;

    return detail.map((d, i) => {
      return [
        <TextField
          className={classes.quantityTextField}
          label="Min $"
          type="number"
          width={100}
          onChange={this.handleDetailChange('minDollars', i)}
          value={d.minDollars}
        />,
        <TextField
          className={classes.quantityTextField}
          label="Max $"
          type="number"
          onChange={this.handleDetailChange('maxDollars', i)}
          value={d.maxDollars}
        />,
        <TextField
          label="Discount Value"
          onChange={this.handleDetailChange('discountValue', i)}
          value={d.discountValue === 0 ? '' : d.discountValue}
          inputProps={{
            type: 'number',
            step: 0.1,
            min: 0,
          }}
        />,
        <Select
          value={d.unit || '$'}
          onChange={this.handleDetailChange('unit', i)}
          inputProps={{
            required: true,
          }}
        >
          <MenuItem value={'$'}>$</MenuItem>
          <MenuItem value={'%'}>%</MenuItem>
        </Select>,
        <Button justIcon round color="primary" onClick={this.removeDetail(i)}>
          <Remove />
        </Button>,
      ];
    });
  }

  earlyDiscountFields() {
    const { classes } = this.props;
    const { detail } = this.state;

    return detail.map((d, i) => {
      return [
        <DatePicker
          leftArrowIcon={<NavigateBefore />}
          rightArrowIcon={<NavigateNext />}
          format="MMMM Do YYYY"
          disablePast={false}
          emptyLabel="Date"
          value={moment.utc(d.date) || null}
          onChange={this.handleDetailChange('date', i)}
        />,
        <TextField
          className={classes.discountValue}
          label="Discount Value"
          width={100}
          onChange={this.handleDetailChange('discountValue', i)}
          value={d.discountValue === 0 ? '' : d.discountValue}
          inputProps={{
            type: 'number',
            step: 0.1,
            min: 0,
          }}
        />,
        <Select
          value={d.unit || '$'}
          onChange={this.handleDetailChange('unit', i)}
          inputProps={{
            required: true,
          }}
        >
          <MenuItem value={'$'}>$</MenuItem>
          <MenuItem value={'%'}>%</MenuItem>
        </Select>,
        <Button justIcon round color="primary" onClick={this.removeDetail(i)}>
          <Remove />
        </Button>,
      ];
    });
  }

  amountDiscountFields() {
    const { classes } = this.props;
    const { detail } = this.state;

    return detail.map((d, i) => {
      return [
        <TextField
          className={classes.discountValue}
          label="Discount Value"
          width={100}
          onChange={this.handleDetailChange('discountValue', i)}
          value={d.discountValue === 0 ? '' : d.discountValue}
          inputProps={{
            type: 'number',
            step: 0.1,
            min: 0,
          }}
        />,
        <Select
          value={d.unit || '$'}
          onChange={this.handleDetailChange('unit', i)}
          inputProps={{
            required: true,
          }}
        >
          <MenuItem value={'$'}>$</MenuItem>
          <MenuItem value={'%'}>%</MenuItem>
        </Select>,
        null,
      ];
    });
  }

  addDetail = () => {
    const { detail, discountStrategy } = this.state;
    let newDetail = { unit: '$' };
    if (discountStrategy === 'Quantity Discount' && detail.length) {
      newDetail.minQty = parseFloat(detail[detail.length - 1].maxQty, 0) + 1;
    }
    if (discountStrategy === 'Dollar Volume Discount' && detail.length) {
      newDetail.minDollars = parseFloat(detail[detail.length - 1].maxDollars, 0) + 1;
    }
    this.setState({
      detail: [...this.state.detail, newDetail],
    });
  };

  tableData() {
    const { discountStrategy } = this.state;

    let data = [];

    switch (discountStrategy) {
      case 'Quantity Discount':
        data = this.quantityDiscountFields();
        data.push([
          null,
          null,
          null,
          null,
          <Tooltip title="Add Discount Row">
            <Button justIcon round color="primary" onClick={this.addDetail}>
              <Add />
            </Button>
          </Tooltip>,
        ]);
        break;
      case 'Dollar Volume Discount':
        data = this.dollarVolumeDiscountFields();
        data.push([
          null,
          null,
          null,
          null,
          <Tooltip title="Add Discount Row">
            <Button justIcon round color="primary" onClick={this.addDetail}>
              <Add />
            </Button>
          </Tooltip>,
        ]);
        break;
      case 'Early Pay Discount':
        data = this.earlyDiscountFields();
        data.push([
          null,
          null,
          null,
          null,
          <Tooltip title="Add Discount Row">
            <Button justIcon round color="primary" onClick={this.addDetail}>
              <Add />
            </Button>
          </Tooltip>,
        ]);
        break;
      case 'Flat Amount Discount':
        data = this.amountDiscountFields();
        break;
      default:
        throw new Error('Discount strategy not correct');
    }

    return data;
  }

  checkSeedCompany = (companyId, seedCompanyId, apiSeedCompnayId) => (event) => {
    if (apiSeedCompnayId) {
      const { apiSeedCompanyIds } = this.state;
      if (event.target.checked) {
        this.setState({
          apiSeedCompanyIds: [...apiSeedCompanyIds, apiSeedCompnayId],
        });
      } else {
        this.setState({
          apiSeedCompanyIds: apiSeedCompanyIds.filter((cid) => cid !== apiSeedCompnayId),
        });
      }
    }
    if (seedCompanyId) {
      let seedCompanyIds = Object.assign([], this.state.seedCompanyIds);
      let newProductCategories = Object.assign({}, this.state.productCategories);

      if (seedCompanyIds.includes(seedCompanyId)) {
        seedCompanyIds.splice(seedCompanyIds.indexOf(seedCompanyId), 1);
        if (newProductCategories[seedCompanyId]) delete newProductCategories[seedCompanyId];
      } else {
        seedCompanyIds.push(seedCompanyId);
      }

      this.setState({
        seedCompanyIds: seedCompanyIds,
        productCategories: newProductCategories,
      });
    }
    if (companyId) {
      const { companyIds } = this.state;

      if (event.target.checked) {
        this.setState({
          companyIds: [...companyIds, companyId],
        });
      } else {
        this.setState({
          companyIds: companyIds.filter((cid) => cid !== companyId),
        });
      }
    }
  };

  render() {
    const { classes, companies, seedCompanies, apiSeedCompanies } = this.props;
    const {
      seedCompanyIds,
      discountStrategy,
      productCategories,
      companyIds,
      name,
      lastDate,
      applyToWholeOrder,
      perProductOrder,
      applyToSeedType,
      applyToParticularProducts,
      applyParticularProducts,
      //applyAsOverAllTotal,
      useByDefault,
      showSnackbar,
      showSnackbarText,
      apiSeedCompanyIds,
    } = this.state;

    let availableProducts = {};

    const seedCompany = seedCompanies.filter((sc) => seedCompanyIds.includes(sc.id));

    let metadata = {},
      cropTypes = {};

    if (seedCompany.length > 0) {
      seedCompany.map((s) => {
        if (s) {
          metadata = { ...metadata, [s.id]: JSON.parse(s.metadata) };
          cropTypes = { ...cropTypes, [s.id]: Object.keys(metadata[s.id]) };

          const { Products } = s;
          const groupBySeedType = groupBy(Products, (Product) => Product.seedType);
          Object.keys(groupBySeedType).forEach((_seedType) => {
            availableProducts[_seedType] = [];
            const groupProductsSeedType = groupBy(groupBySeedType[_seedType], (_product) => _product.blend);
            Object.keys(groupProductsSeedType).forEach((product) => {
              groupProductsSeedType[product].forEach((_product) => {
                availableProducts[_seedType].push(`${product} - ${_product.brand}`);
              });
            });
          });
        }
      });
    }

    return (
      <div>
        <h3> Discount Editor</h3>
        <GridContainer justifyContent="center">
          <GridItem xs={12}>
            <form action="#" onSubmit={this.updateDiscount}>
              <Card>
                <CardHeader>
                  {/* <CardIcon className={classes.cardIcon} color="gray">
                    <MoneyOff />
                  </CardIcon> */}
                  <Card>
                    <CardContent className={classes.centerItem}>
                      <CustomInput
                        labelText="Discount Name"
                        id="name"
                        formControlProps={{
                          required: true,
                        }}
                        inputProps={{
                          value: name,
                          onChange: this.handleCheckboxChange('name'),
                        }}
                      />

                      {discountStrategy.toString() !== 'Early Pay Discount' && (
                        <DatePicker
                          className={classes.lastDatePicker}
                          leftArrowIcon={<NavigateBefore />}
                          rightArrowIcon={<NavigateNext />}
                          format="MMMM Do YYYY"
                          disablePast={false}
                          emptyLabel="Discount Expiry Date"
                          value={moment.utc(lastDate)}
                          onChange={this.handleDateChange}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <h4>Strategy</h4>
                  <Card>
                    <CardContent>
                      Please choose from one of these discount strategies which will affect how the discount is
                      calculated. If you would like additional strategies please contact us.
                    </CardContent>
                  </Card>
                </CardHeader>
                <CardBody>
                  <FormControl className={classes.strategySelectorFormControl} fullWidth>
                    <RadioGroup
                      aria-label="discountStrategy"
                      name="discountStrategy"
                      value={discountStrategy.toString()}
                      className={classes.strategySelector}
                      onChange={this.handleSelectChange}
                    >
                      <FormControlLabel
                        className={classes.strategySelectorLabel}
                        value="Flat Amount Discount"
                        control={<Radio color="primary" />}
                        label={
                          <CustomLabel
                            classes={classes}
                            title="Flat Amount Discount"
                            content="When you want to give your customers a flat cash discount you can use this strategy. This strategy doesn't have multiple discount levels based on how much quantity the customer is buying or how much money they are spending. This discount can be assigned per unit/bag or towards the whole order."
                            subContent="Example: $5/bag or $500 for the whole order. "
                          />
                        }
                      />
                      <FormControlLabel
                        className={classes.strategySelectorLabel}
                        value="Quantity Discount"
                        disabled={perProductOrder}
                        control={<Radio color="primary" />}
                        label={
                          <CustomLabel
                            classes={classes}
                            title="Quantity Discount"
                            content="This discount is based on how much the customer orders, so for example how many bags or units of a product. You can set up multiple discount levels."
                            subContent="Example: 1-100 bags gets $4/bag discount, 101-500 gets $8/bag discount,01 - infinity units gets $12/bag discount etc."
                          />
                        }
                      />
                      {/* <FormControlLabel
                        className={classes.strategySelectorLabel}
                        value="Dollar Volume Discount"
                        disabled={perProductOrder}
                        control={<Radio color="primary" />}
                        label={
                          <CustomLabel
                            classes={classes}
                            title="Dollar Volume Discount"
                            content="When you want to give discounts based on how much dollar value the customer has purchased from you, you can use this strategy."
                            subContent="Example: $0-$5,000 gets 2% discount, $5001-$10,000 gets 2.5% discount."
                          />
                        }
                      /> */}
                      <FormControlLabel
                        className={classes.strategySelectorLabel}
                        value="Early Pay Discount"
                        disabled={perProductOrder}
                        control={<Radio color="primary" />}
                        label={
                          <CustomLabel
                            classes={classes}
                            title="Early Pay Discount"
                            content="This discount can be used when you have discounts that are time sensitive and you want to encourage the customer to pay early."
                            subContent="Example: if paid by Nov 1, it's 8% discount; if paid by Nov 15, it's 6% discount, if paid by Dec 1, it's 4% etc."
                          />
                        }
                      />
                    </RadioGroup>
                  </FormControl>

                  <Divider />

                  <h4>Apply to</h4>

                  <FormControl className={classes.strategySelectorFormControl} fullWidth>
                    <RadioGroup
                      aria-label="apply to"
                      name="applyToWholeOrder"
                      value={applyToWholeOrder.toString()}
                      className={classes.strategySelector}
                      onChange={this.handleSelectChange}
                      style={{ marginTop: '-1px', verticalAlign: 'middle' }}
                    >
                      <FormControlLabel
                        value="false"
                        control={<Radio color="primary" />}
                        label={<CustomLabel classes={classes} title="Per Bag" content="" />}
                      />
                      {discountStrategy === 'Flat Amount Discount' && (
                        <FormControlLabel
                          value="true"
                          control={<Radio color="primary" />}
                          label={<CustomLabel classes={classes} title="Whole Order" content="" />}
                        />
                      )}
                      {/* <FormControlLabel
                        value="perProductOrder"
                        control={<Radio color="primary" />}
                        label={<CustomLabel classes={classes} title="Per Product Order" content="" />}
                      /> */}
                    </RadioGroup>
                  </FormControl>

                  <Divider />
                  <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={showSnackbar}
                    autoHideDuration={5000}
                    message={<span>{showSnackbarText}</span>}
                    onClick={() => this.setState({ showSnackbar: false })}
                    onClose={() => this.setState({ showSnackbar: false })}
                  />

                  <div className={classes.strategySelector}>
                    {/* <FormControl className={classes.strategySelectorFormControl}>
                      <FormControlLabel
                        className={classes.strategySelectorLabelLong}
                        control={
                          <Checkbox
                            color="primary"
                            checked={useByDefault}
                            onChange={this.handleCheckboxChange('useByDefault')}
                            value="useByDefault"
                          />
                        }
                        label={
                          <CustomLabel
                            classes={classes}
                            title="Apply discount by default"
                            content="You can choose to apply this discount whenever products from those particular companies are added to a quote or purchase order instead of having to manually select this discount."
                          />
                        }
                      />
                    </FormControl> */}

                    {discountStrategy == 'Quantity Discount' && (
                      <FormControl className={classes.strategySelectorFormControl}>
                        <FormControlLabel
                          className={classes.strategySelectorLabelLong}
                          control={
                            <Checkbox
                              color="primary"
                              checked={applyToSeedType}
                              onChange={this.handleCheckboxChange('applyToSeedType')}
                              value="applyToSeedType"
                            />
                          }
                          label={
                            <CustomLabel
                              classes={classes}
                              title="Apply to all products within a crop type"
                              content="Selecting this will group the ordered quantities across all the products in your quote or purchase order of a specific crop type. So if you added 3 different products but of the same crop say Corn and their respective quantities are 100,150, and 200 units, selecting this will use the discount tier of 450 units."
                            />
                          }
                        />
                      </FormControl>
                    )}
                    {/* <FormControl className={classes.strategySelectorFormControl}>
                      <FormControlLabel
                        className={classes.strategySelectorLabelLong}
                        control={
                          <Checkbox
                            color="primary"
                            checked={applyToParticularProducts}
                            onChange={this.handleCheckboxChange('applyToParticularProducts')}
                            value="applyToParticularProducts"
                          />
                        }
                        label={
                          <CustomLabel
                            classes={classes}
                            title="Apply to particular products within a crop type"
                            content="Selecting this will group the ordered quantities across all the products in your quote or purchase order of a specific crop type. So if you added 3 different products but of the same crop say Corn and their respective quantities are 100,150, and 200 units, selecting this will use the discount tier of 450 units."
                          />
                        }
                      />
                    </FormControl> */}
                  </div>
                </CardBody>
              </Card>

              {!applyToWholeOrder && (
                <Card>
                  <CardHeader>
                    <h4>Apply To</h4>
                  </CardHeader>
                  <CardBody>
                    <Divider />

                    <div className={classes.seedTypeSelector}>
                      <Card>
                        <CardContent>
                          <h4>API Seed Companies</h4>
                          {apiSeedCompanies.length > 0 && (
                            <div>
                              <FormControlLabel
                                label={apiSeedCompanies[0].name}
                                control={
                                  <Checkbox
                                    checked={apiSeedCompanyIds.includes(apiSeedCompanies[0].id)}
                                    value={apiSeedCompanies[0].id}
                                    onChange={this.checkSeedCompany(null, null, apiSeedCompanies[0].id)}
                                  />
                                }
                              />
                              <br />
                              {apiSeedCompanyIds.includes(apiSeedCompanies[0].id) &&
                                ['Corn', 'Sorghum', 'Soybean', 'Canola', 'Alfalfa']
                                  .filter(
                                    (seedType) =>
                                      apiSeedCompanies[0][`${seedType.toLowerCase()}BrandName`].trim() !== '',
                                  )
                                  .map((seedType) => (
                                    <React.Fragment>
                                      <FormControlLabel
                                        key={seedType}
                                        label={apiSeedCompanies[0][`${seedType.toLowerCase()}BrandName`]}
                                        style={{ textTransform: 'capitalize' }}
                                        // disabled={!seedCompanyIds.length}
                                        control={
                                          <Checkbox
                                            checked={
                                              productCategories[apiSeedCompanies[0].id] &&
                                              productCategories[apiSeedCompanies[0].id].includes(seedType.toUpperCase())
                                            }
                                            onChange={this.handleSeedTypeChange(
                                              apiSeedCompanies[0].id,
                                              seedType.toUpperCase(),
                                            )}
                                            value={seedType.toUpperCase()}
                                          />
                                        }
                                      />
                                      {productCategories[apiSeedCompanies[0].id] &&
                                        productCategories[apiSeedCompanies[0].id].includes(seedType.toUpperCase()) &&
                                        applyToParticularProducts && (
                                          <FormControl className={classes.formControl} style={{ width: '100%' }}>
                                            <InputLabel htmlFor="select-multiple-checkbox">Product</InputLabel>
                                            <Select
                                              multiple
                                              value={applyParticularProducts[seedType.toUpperCase()] || []}
                                              onChange={(event) =>
                                                this.handleSelectProductsChange(seedType.toUpperCase())(event)
                                              }
                                              input={<Input id="select-multiple-checkbox" />}
                                              renderValue={(selected) => (
                                                <div className={classes.chips}>
                                                  {selected.map((value) => (
                                                    <Chip key={value} label={value} className={classes.chip} />
                                                  ))}
                                                </div>
                                              )}
                                              // MenuProps={MenuProps}
                                            >
                                              {(availableProducts[seedType.toUpperCase()] || [])
                                                .sort((a, b) => a.localeCompare(b))
                                                .map((product) => (
                                                  <MenuItem key={product} value={product}>
                                                    <Checkbox
                                                      checked={
                                                        (applyParticularProducts[seedType.toUpperCase()] || []).indexOf(
                                                          product,
                                                        ) > -1
                                                      }
                                                    />
                                                    <ListItemText primary={product} />
                                                  </MenuItem>
                                                ))}
                                            </Select>
                                          </FormControl>
                                        )}
                                      {productCategories[seedCompanyIds[0]] &&
                                        productCategories[seedCompanyIds[0]].includes(seedType.toUpperCase()) &&
                                        applyToParticularProducts && <br />}
                                    </React.Fragment>
                                  ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className={classes.seedTypeSelector}>
                      <Card>
                        <CardContent>
                          {!applyToParticularProducts && (
                            <React.Fragment>
                              <h4>Seed Companies</h4>
                              {seedCompanies.map((seedCompany) => (
                                <div>
                                  <FormControlLabel
                                    label={seedCompany.name}
                                    control={
                                      <Checkbox
                                        checked={seedCompanyIds.includes(seedCompany.id)}
                                        value={seedCompany.id}
                                        onChange={this.checkSeedCompany(null, seedCompany.id, null)}
                                      />
                                    }
                                  />

                                  {seedCompanyIds.includes(seedCompany.id) && (
                                    <React.Fragment>
                                      <br />

                                      {cropTypes[seedCompany.id]
                                        .filter(
                                          (seedType) =>
                                            metadata[seedCompany.id][seedType].brandName !== null &&
                                            metadata[seedCompany.id][seedType].brandName.trim() !== '',
                                        )
                                        .map((seedType) => {
                                          return (
                                            <React.Fragment>
                                              <FormControlLabel
                                                key={seedType}
                                                label={metadata[seedCompany.id][seedType].brandName}
                                                control={
                                                  <Checkbox
                                                    checked={
                                                      productCategories[seedCompany.id] &&
                                                      productCategories[seedCompany.id].includes(seedType.toUpperCase())
                                                    }
                                                    onChange={this.handleSeedTypeChange(
                                                      seedCompany.id,
                                                      seedType.toUpperCase(),
                                                    )}
                                                    value={seedType.toUpperCase()}
                                                  />
                                                }
                                              />
                                            </React.Fragment>
                                          );
                                        })}
                                    </React.Fragment>
                                  )}
                                  {/* <hr /> */}
                                </div>
                              ))}
                            </React.Fragment>
                          )}
                          {applyToParticularProducts && (
                            <React.Fragment>
                              <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="seed-company">Seed Company</InputLabel>

                                <Select
                                  value={seedCompanyIds[0] || ''}
                                  onChange={this.handleSelectChange}
                                  inputProps={{
                                    required: true,
                                    name: 'seedCompanyId',
                                    id: 'seed-company',
                                  }}
                                >
                                  {seedCompanies.map((seedCompany) => (
                                    <MenuItem key={seedCompany.id} value={seedCompany.id}>
                                      {seedCompany.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {seedCompanyIds.length > 0 && (
                                <React.Fragment>
                                  <br />

                                  {['Corn', 'Sorghum', 'Soybean', 'Canola', 'Alfalfa']
                                    .filter(
                                      (seedType) => seedCompany[`${seedType.toLowerCase()}BrandName`].trim() !== '',
                                    )
                                    .map((seedType) => {
                                      return (
                                        <React.Fragment>
                                          <FormControlLabel
                                            key={seedType}
                                            label={seedCompany[`${seedType.toLowerCase()}BrandName`]}
                                            control={
                                              <Checkbox
                                                checked={
                                                  productCategories[seedCompanyIds[0]] &&
                                                  productCategories[seedCompanyIds[0]].includes(seedType.toUpperCase())
                                                }
                                                onChange={this.handleSeedTypeChange(
                                                  seedCompanyIds[0],
                                                  seedType.toUpperCase(),
                                                )}
                                                value={seedType.toUpperCase()}
                                              />
                                            }
                                          />
                                          {productCategories[seedCompanyIds[0]] &&
                                            productCategories[seedCompanyIds[0]].includes(seedType.toUpperCase()) &&
                                            applyToParticularProducts && (
                                              <FormControl className={classes.formControl} style={{ width: '100%' }}>
                                                <InputLabel htmlFor="select-multiple-checkbox">Product</InputLabel>
                                                <Select
                                                  multiple
                                                  value={applyParticularProducts[seedType.toUpperCase()] || []}
                                                  onChange={(event) =>
                                                    this.handleSelectProductsChange(seedType.toUpperCase())(event)
                                                  }
                                                  input={<Input id="select-multiple-checkbox" />}
                                                  renderValue={(selected) => (
                                                    <div className={classes.chips}>
                                                      {selected.map((value) => (
                                                        <Chip key={value} label={value} className={classes.chip} />
                                                      ))}
                                                    </div>
                                                  )}
                                                  // MenuProps={MenuProps}
                                                >
                                                  {(availableProducts[seedType.toUpperCase()] || [])
                                                    .sort((a, b) => a.localeCompare(b))
                                                    .map((product) => (
                                                      <MenuItem key={product} value={product}>
                                                        <Checkbox
                                                          checked={
                                                            (
                                                              applyParticularProducts[seedType.toUpperCase()] || []
                                                            ).indexOf(product) > -1
                                                          }
                                                        />
                                                        <ListItemText primary={product} />
                                                      </MenuItem>
                                                    ))}
                                                </Select>
                                              </FormControl>
                                            )}
                                          {productCategories[seedCompanyIds[0]] &&
                                            productCategories[seedCompanyIds[0]].includes(seedType.toUpperCase()) &&
                                            applyToParticularProducts && <br />}
                                        </React.Fragment>
                                      );
                                    })}
                                </React.Fragment>
                              )}
                            </React.Fragment>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className={classes.seedTypeSelector}>
                      <Card>
                        <CardContent>
                          <h4>Business Companies</h4>
                          {companies.map((company) => {
                            return (
                              <FormControlLabel
                                key={company.id}
                                control={
                                  <Checkbox
                                    checked={companyIds.includes(company.id)}
                                    onChange={this.checkSeedCompany(company.id, null, null)}
                                    value={company.id.toString()}
                                  />
                                }
                                label={company.name}
                              />
                            );
                          })}
                        </CardContent>
                      </Card>
                    </div>
                  </CardBody>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <h4>Discounts</h4>
                  {/* <Card>
                    <CardContent>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Architecto eveniet molestias nihil nisi officiis sapiente
                      sed. Ab accusantium dolor dolorem ea earum harum impedit
                      officia, praesentium quo sed, sint, veniam.
                    </CardContent>
                  </Card> */}
                </CardHeader>
                <CardBody>
                  <Divider />
                  <div className={classes.detailTable}>
                    <Table
                      hover={true}
                      tableHead={this.tableHeaders()}
                      tableData={this.tableData()}
                      isCheckBox={false}
                    />
                  </div>
                </CardBody>
              </Card>
              <CTABar text="Save" secondaryAction={() => this.props.history.push('/app/setting/discount_editor')} />
            </form>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  companies: state.companyReducer.companies,
  dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
  organizationId: state.userReducer.organizationId,
  seedCompanies: state.seedCompanyReducer.seedCompanies,
  apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateDealerDiscount,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(EditDealerDiscount));
