import React, { Component } from 'react';
import { withStyles, CardContent } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import moment from 'moment';

// icons
import MoneyOff from '@material-ui/icons/MoneyOff';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

// core components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../../components/material-dashboard/Card/CardFooter';
// import Button from '../../../components/material-dashboard/CustomButtons/Button'
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import CTABar from '../../../components/cta-bar';

import { createInterestChargeStyles } from './create_interest_charge.styles';
class CreateInterestCharge extends Component {
  state = {
    seedCompanyId: '',
    certainDays: 0,
    compoundingDays: 0,
    interestCharge: null,
    productCategories: [],
    companyIds: [],
    name: '',
    fixedDate: null,
    applyToWholeOrder: false,
    applyToFixedDate: false,
    applyToCertainDate: false,
    useByDefault: false,
  };

  createCharge = (e) => {
    const { createInterestCharge, organizationId: organizationId } = this.props;
    const {
      seedCompanyId,
      certainDays,
      compoundingDays,
      interestCharge,
      productCategories,
      companyIds,
      name,
      fixedDate,
      applyToWholeOrder,
      applyToFixedDate,
      applyToCertainDate,
      useByDefault,
    } = this.state;
    e.preventDefault();

    if (!applyToWholeOrder && !productCategories.length && !companyIds.length) return;
    if (!name) return;
    if (!applyToFixedDate && !applyToCertainDate) {
      alert('Please choose apply type!');
    }
    if (compoundingDays === 0) return;
    if (!interestCharge) return;

    let data = {
      compoundingDays,
      interestCharge,
      productCategories,
      companyIds,
      name,
      applyToWholeOrder,
      applyToFixedDate,
      applyToCertainDate,
      useByDefault,
      organizationId,
    };
    if (applyToFixedDate) data.fixedDate = fixedDate;
    if (applyToCertainDate) data.certainDays = certainDays;
    if (seedCompanyId) data.seedCompanyId = seedCompanyId;

    createInterestCharge(data).then(() => this.props.history.push('/app/setting/interest_charge'));
  };

  handleChange = (name) => (event) => {
    let val = event.target.hasOwnProperty('checked') ? event.target.checked : event.target.value;
    this.setState({
      [name]: val,
    });
  };

  handleApplyTypeChange = (type) => (event) => {
    if (type === 'fixed') {
      this.setState({
        applyToFixedDate: event.target.checked,
        applyToCertainDate: false,
      });
    } else if (type === 'certain') {
      this.setState({
        applyToFixedDate: false,
        applyToCertainDate: event.target.checked,
      });
    }
    return;
  };

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleDateChange = (date) => {
    this.setState({
      fixedDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z',
    });
  };

  handleSeedTypeChange = (seedType) => (event) => {
    const { productCategories } = this.state;

    if (event.target.checked) {
      this.setState({
        productCategories: [...productCategories, seedType],
      });
    } else {
      this.setState({
        productCategories: productCategories.filter((pc) => pc !== seedType),
      });
    }
  };

  handleCompanyIdsChange = (companyId) => (event) => {
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
  };

  render() {
    const { classes, companies, seedCompanies } = this.props;
    const {
      seedCompanyId,
      productCategories,
      companyIds,
      name,
      fixedDate,
      applyToWholeOrder,
      useByDefault,
      certainDays,
      compoundingDays,
      interestCharge,
      applyToFixedDate,
      applyToCertainDate,
    } = this.state;
    const seedCompany = seedCompanies.find((sc) => sc.id === seedCompanyId);

    return (
      <div>
        <GridContainer justifyContent="center">
          <GridItem xs={12}>
            <form action="#" onSubmit={this.createCharge}>
              <Card>
                <CardHeader>
                  <CardIcon className={classes.cardIcon} color="gray">
                    <MoneyOff />
                  </CardIcon>

                  <h4>Create Interest Charge</h4>
                </CardHeader>

                <CardBody>
                  <React.Fragment>
                    <CustomInput
                      labelText="Name"
                      id="name"
                      formControlProps={{
                        required: true,
                      }}
                      inputProps={{
                        value: name,
                        onChange: this.handleChange('name'),
                      }}
                    />
                    <div>
                      <div className={classes.seedTypeSelector}>
                        <FormControlLabel
                          //key={}
                          label="After a Fixed Start Date"
                          control={
                            <Checkbox
                              checked={applyToFixedDate}
                              onChange={this.handleApplyTypeChange('fixed')}
                              value={applyToFixedDate.toString()}
                            />
                          }
                        />
                        <br />
                        <FormControlLabel
                          //key={}
                          label="After a certain No. Of days after Order"
                          control={
                            <Checkbox
                              checked={applyToCertainDate}
                              onChange={this.handleApplyTypeChange('certain')}
                              value={applyToCertainDate.toString()}
                            />
                          }
                        />
                      </div>
                      <div className={classes.dateInputField}>
                        {applyToCertainDate && (
                          <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="certain-day">Days after order</InputLabel>

                            <Select
                              value={certainDays}
                              onChange={this.handleSelectChange}
                              inputProps={{
                                required: true,
                                name: 'certainDays',
                                id: 'certain-day',
                              }}
                            >
                              <MenuItem key={certainDays} value={15}>
                                15 days
                              </MenuItem>
                              <MenuItem key={certainDays} value={30}>
                                1 month
                              </MenuItem>
                              <MenuItem key={certainDays} value={90}>
                                3 months
                              </MenuItem>
                            </Select>
                          </FormControl>
                        )}
                        {applyToFixedDate && (
                          <DatePicker
                            className={classes.lastDatePicker}
                            leftArrowIcon={<NavigateBefore />}
                            rightArrowIcon={<NavigateNext />}
                            format="MMMM Do YYYY"
                            disablePast={false}
                            emptyLabel="Fixed Start Date"
                            value={fixedDate}
                            onChange={this.handleDateChange}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={useByDefault}
                            onChange={this.handleChange('useByDefault')}
                            value="useByDefault"
                          />
                        }
                        label="Apply charge by default when adding new products"
                      />
                      <br />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={applyToWholeOrder}
                            onChange={this.handleChange('applyToWholeOrder')}
                            value="applyToWholeOrder"
                          />
                        }
                        label="Apply to whole order"
                      />

                      <br />
                    </div>

                    {applyToWholeOrder === false && (
                      <div>
                        <div className={classes.seedTypeSelector}>
                          <Card>
                            <CardContent>
                              <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="seed-company">Seed Company</InputLabel>

                                <Select
                                  value={seedCompanyId}
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

                              {seedCompanyId !== '' && (
                                <React.Fragment>
                                  <br />

                                  {['Corn', 'Sorghum', 'Soybean']
                                    .filter(
                                      (seedType) => seedCompany[`${seedType.toLowerCase()}BrandName`].trim() !== '',
                                    )
                                    .map((seedType) => {
                                      return (
                                        <FormControlLabel
                                          key={seedType}
                                          label={seedCompany[`${seedType.toLowerCase()}BrandName`]}
                                          control={
                                            <Checkbox
                                              checked={productCategories.includes(seedType.toUpperCase())}
                                              onChange={this.handleSeedTypeChange(seedType.toUpperCase())}
                                              value={seedType.toUpperCase()}
                                            />
                                          }
                                        />
                                      );
                                    })}
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
                                        onChange={this.handleCompanyIdsChange(company.id)}
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
                      </div>
                    )}
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="compounding-days" className={classes.inputLabelStyles}>
                        Compounding Interest Charge
                      </InputLabel>

                      <Select
                        value={compoundingDays}
                        onChange={this.handleSelectChange}
                        inputProps={{
                          required: true,
                          name: 'compoundingDays',
                          id: 'compounding-days',
                        }}
                      >
                        <MenuItem key={compoundingDays} value={15}>
                          15 days
                        </MenuItem>
                        <MenuItem key={compoundingDays} value={30}>
                          1 month
                        </MenuItem>
                        <MenuItem key={compoundingDays} value={90}>
                          3 months
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <CustomInput
                      labelText="Interest Charge"
                      id="interestCharge"
                      formControlProps={{
                        required: true,
                      }}
                      inputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        value: interestCharge,
                        onChange: this.handleChange('interestCharge'),
                        type: 'number',
                      }}
                    />
                  </React.Fragment>
                </CardBody>

                <CardFooter>
                  <CTABar secondaryAction={() => this.props.history.push('/app/setting/interest_charge')} />
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withStyles(createInterestChargeStyles)(CreateInterestCharge);
