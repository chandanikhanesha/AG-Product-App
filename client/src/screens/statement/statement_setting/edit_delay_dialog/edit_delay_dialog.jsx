import React, { Component } from 'react';
import { withStyles, CardContent } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import moment from 'moment';

// icons
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import CloseIcon from '@material-ui/icons/Close';

// core components
import Button from '../../../../components/material-dashboard/CustomButtons/Button';
import GridContainer from '../../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../../components/material-dashboard/Card/Card';
import CustomInput from '../../../../components/material-dashboard/CustomInput/CustomInput';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Radio from '@material-ui/core/Radio';

import { styles } from './edit_delay_dialog.styles';
class EditDelayDialog extends Component {
  state = {
    delayId: null,
    seedCompanyId: '',
    certainDays: 0,
    productCategories: [],
    companyIds: [],
    seedCompanyIds: [],
    name: '',
    fixedDate: null,
    isFixed: true,
    nameAlertShow: false,
    nameAlertText: 'Name required!',
    companyAlertShow: false,
    companyAlertText: 'Company required!',
    dateAlertShow: false,
    dateAlertText: 'Date required when choosing fixed date!',
    selectedSeedCompanyIds: [],
    selectedCompanyIds: [],
  };

  componentWillMount() {
    const { delayProduct, delayProducts } = this.props;
    let isFixed = delayProduct.delayMethod === 'fixed';
    let selectedCompanyIds = [];
    let selectedSeedCompanyIds = [];
    delayProducts.forEach((dp) => {
      if (parseInt(dp.id, 10) !== parseInt(delayProduct.id, 10)) {
        selectedCompanyIds = [...selectedCompanyIds, ...dp.companyIds];
        selectedSeedCompanyIds = [...selectedSeedCompanyIds, ...dp.seedCompanyIds];
      }
    });
    this.setState({
      delayId: delayProduct.id,
      name: delayProduct.name,
      isFixed: isFixed,
      seedCompanyIds: delayProduct.seedCompanyIds,
      companyIds: delayProduct.companyIds,
      certainDays: isFixed ? 0 : delayProduct.certainDays,
      fixedDate: isFixed ? delayProduct.fixedDate : null,
      selectedSeedCompanyIds,
      selectedCompanyIds,
    });
  }

  handleNameChange = (event) => {
    this.setState({
      name: event.target.value,
      nameAlertShow: false,
    });
  };

  handleRateChange = (name) => (event) => {
    this.setState({ [name]: event.target.value });
  };

  handleApplyTypeChange = (type) => (event) => {
    this.setState({
      isFixed: type === 'fixed',
    });
  };

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleDateChange = (date) => {
    this.setState({
      fixedDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      dateAlertShow: false,
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

  handleSeedCompanyIdsChange = (seedCompanyId) => (event) => {
    const { seedCompanyIds } = this.state;

    if (event.target.checked) {
      this.setState({
        seedCompanyIds: [...seedCompanyIds, seedCompanyId],
        companyAlertShow: false,
      });
    } else {
      this.setState({
        seedCompanyIds: seedCompanyIds.filter((cid) => cid !== seedCompanyId),
      });
    }
  };

  handleCompanyIdsChange = (companyId) => (event) => {
    const { companyIds } = this.state;

    if (event.target.checked) {
      this.setState({
        companyIds: [...companyIds, companyId],
        companyAlertShow: false,
      });
    } else {
      this.setState({
        companyIds: companyIds.filter((cid) => cid !== companyId),
      });
    }
  };

  update = async () => {
    const { updateDelayProduct, organizationId, loadDatas, onClose } = this.props;
    const { delayId, name, companyIds, seedCompanyIds, isFixed, fixedDate, certainDays } = this.state;
    if (name === '') {
      this.setState({ nameAlertShow: true });
      return;
    }
    if (companyIds.length + seedCompanyIds.length < 1) {
      this.setState({ companyAlertShow: true });
      return;
    }
    if (isFixed && fixedDate === null) {
      this.setState({ dateAlertShow: true });
      return;
    }
    let updateData = {
      name,
      companyIds,
      seedCompanyIds,
      delayMethod: isFixed ? 'fixed' : 'certain',
      fixedDate: isFixed ? fixedDate : '2000-1-1',
      certainDays: parseInt(isFixed ? 0 : certainDays, 10),
      organizationId: organizationId,
    };
    await updateDelayProduct(delayId, updateData);
    loadDatas();
    onClose();
  };

  render() {
    const { classes, companies, seedCompanies, open, onClose } = this.props;
    const {
      // seedCompanyId,
      // productCategories,
      companyIds,
      seedCompanyIds,
      name,
      isFixed,
      fixedDate,
      certainDays,
      nameAlertShow,
      nameAlertText,
      companyAlertShow,
      companyAlertText,
      dateAlertShow,
      dateAlertText,
      selectedSeedCompanyIds,
      selectedCompanyIds,
    } = this.state;
    //const seedCompany = seedCompanies.find(sc => sc.id === seedCompanyId);

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="lg">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h4>Delay adding products</h4>
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <GridContainer justifyContent="center" style={{ padding: '10px 50px' }}>
          <GridItem xs={12}>
            <React.Fragment>
              <h4>
                Name
                <span style={{ color: 'red' }}>{nameAlertShow && nameAlertText}</span>
              </h4>
              <CustomInput
                labelText="Name of delay adding product"
                id="name"
                formControlProps={{
                  required: true,
                  width: 400,
                }}
                inputProps={{
                  value: name,
                  onChange: this.handleNameChange,
                  classes: { root: classes.inputLabelStyles },
                }}
                labelProps={{
                  classes: { root: classes.inputLabelStyles },
                }}
              />
              <h4>
                Company
                <span style={{ color: 'red' }}>{companyAlertShow && companyAlertText}</span>
              </h4>
              <div style={{ display: 'flex' }}>
                {/* <div className={classes.seedTypeSelector}>
                  <Card>
                    <CardContent>
                      <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="seed-company">
                          Seed Company
                        </InputLabel>

                        <Select
                          value={seedCompanyId}
                          onChange={this.handleSelectChange}
                          inputProps={{
                            required: true,
                            name: "seedCompanyId",
                            id: "seed-company"
                          }}
                        >
                          {seedCompanies.map(seedCompany => (
                            <MenuItem
                              key={seedCompany.id}
                              value={seedCompany.id}
                            >
                              {seedCompany.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {seedCompanyId !== "" && (
                        <React.Fragment>
                          <br />

                          {["Corn", "Sorghum", "Soybean", "Canola", "Alfalfa"]
                            .filter(
                              seedType =>
                                seedCompany[
                                  `${seedType.toLowerCase()}BrandName`
                                ].trim() !== ""
                            )
                            .map(seedType => {
                              return (
                                <FormControlLabel
                                  key={seedType}
                                  label={
                                    seedCompany[
                                      `${seedType.toLowerCase()}BrandName`
                                    ]
                                  }
                                  control={
                                    <Checkbox
                                      checked={productCategories.includes(
                                        seedType.toUpperCase()
                                      )}
                                      onChange={this.handleSeedTypeChange(
                                        seedType.toUpperCase()
                                      )}
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
                </div> */}

                <div className={classes.seedTypeSelector}>
                  <Card>
                    <CardContent>
                      <h4>Seed Companies</h4>
                      {seedCompanies.map((seedCompany) => {
                        return (
                          <FormControlLabel
                            key={seedCompany.id}
                            control={
                              <Checkbox
                                checked={seedCompanyIds.includes(seedCompany.id)}
                                onChange={this.handleSeedCompanyIdsChange(seedCompany.id)}
                                value={seedCompany.id.toString()}
                                disabled={selectedSeedCompanyIds.includes(seedCompany.id)}
                              />
                            }
                            label={seedCompany.name}
                          />
                        );
                      })}
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
                                disabled={selectedCompanyIds.includes(company.id)}
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

              <h4>Delay adding until</h4>
              <div>
                <FormControlLabel
                  //value="top"
                  control={
                    <Radio
                      checked={isFixed === true}
                      onChange={this.handleApplyTypeChange('fixed')}
                      value="a"
                      name="radio-button-demo"
                      //inputProps={{ "aria-label": "A" }}
                    />
                  }
                  label="Date"
                />
                <DatePicker
                  className={classes.lastDatePicker}
                  leftArrowIcon={<NavigateBefore />}
                  rightArrowIcon={<NavigateNext />}
                  format="MMMM Do YYYY"
                  disablePast={true}
                  emptyLabel="Fixed Start Date"
                  value={fixedDate}
                  onChange={this.handleDateChange}
                />
                <h4 style={{ color: 'red' }}>{dateAlertShow && dateAlertText}</h4>
              </div>
              <div>
                <FormControlLabel
                  control={
                    <Radio
                      checked={isFixed === false}
                      onChange={this.handleApplyTypeChange('certain')}
                      value="a"
                      name="radio-button-demo"
                    />
                  }
                  label="A certain number of days after order"
                />
                <CustomInput
                  id="certainDays"
                  formControlProps={{
                    required: true,
                  }}
                  inputProps={{
                    value: certainDays,
                    onChange: this.handleRateChange('certainDays'),
                    type: 'number',
                  }}
                />
              </div>
            </React.Fragment>
          </GridItem>
        </GridContainer>
        <Divider />
        <div className={classes.footer}>
          <Button color="primary" className={classes.editButton} onClick={this.update}>
            SAVE
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(styles)(EditDelayDialog);
