import React, { Component } from 'react';
import { withStyles, CardContent } from '@material-ui/core';
// icons
import CloseIcon from '@material-ui/icons/Close';

// core components
import GridContainer from '../../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../../components/material-dashboard/Card/Card';
import CustomInput from '../../../../components/material-dashboard/CustomInput/CustomInput';

import Button from '../../../../components/material-dashboard/CustomButtons/Button';
// import FormControl from "@material-ui/core/FormControl";
// import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from '@material-ui/core/InputAdornment';
// import Select from "@material-ui/core/Select";
// import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Radio from '@material-ui/core/Radio';

import { styles } from './add_finance_method_dialog.styles';
class AddFinaceMethodDialog extends Component {
  state = {
    seedCompanyId: '',
    productCategories: [],
    companyIds: [],
    seedCompanyIds: [],
    name: '',
    isFixed: false,
    compoundRate: 0,
    fixedFees: 0,
    nameAlertShow: false,
    nameAlertText: '   Name required!',
    companyAlertShow: false,
    companyAlertText: '   Company required!',
    selectedSeedCompanyIds: [],
    selectedCompanyIds: [],
  };

  componentWillMount = () => {
    const { financeMethods } = this.props;
    let selectedCompanyIds = [];
    let selectedSeedCompanyIds = [];
    financeMethods.forEach((financeMethod) => {
      selectedCompanyIds = [...selectedCompanyIds, ...financeMethod.companyIds];
      selectedSeedCompanyIds = [...selectedSeedCompanyIds, ...financeMethod.seedCompanyIds];
    });
    this.setState({ selectedSeedCompanyIds, selectedCompanyIds });
  };

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
    if (type === 'fixed') {
      this.setState({
        isFixed: true,
      });
    } else {
      this.setState({
        isFixed: false,
      });
    }
    return;
  };

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
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

  create = async () => {
    const { createFinanceMethod, organizationId, loadDatas, onClose } = this.props;
    const { name, companyIds, seedCompanyIds, isFixed, compoundRate, fixedFees } = this.state;
    if (name === '') {
      this.setState({ nameAlertShow: true });
      return;
    }
    if (companyIds.length + seedCompanyIds.length < 1) {
      this.setState({ companyAlertShow: true });
      return;
    }
    let createData = {
      name,
      companyIds,
      seedCompanyIds,
      interestMethod: isFixed ? 'fixed' : 'compound',
      interestRate: parseInt(isFixed ? fixedFees : compoundRate, 10),
      organizationId: organizationId,
    };
    await createFinanceMethod(createData);
    loadDatas();
    onClose();
  };
  saveAndAdd = async () => {
    const { createFinanceMethod, organizationId } = this.props;
    const { name, companyIds, seedCompanyIds, isFixed, compoundRate, fixedFees } = this.state;
    if (name === '') {
      this.setState({ nameAlertShow: true });
      return;
    }
    if (companyIds.length + seedCompanyIds.length < 1) {
      this.setState({ companyAlertShow: true });
      return;
    }
    let createData = {
      name,
      companyIds,
      seedCompanyIds,
      interestMethod: isFixed ? 'fixed' : 'compound',
      interestRate: parseInt(isFixed ? fixedFees : compoundRate, 10),
      organizationId: organizationId,
    };
    await createFinanceMethod(createData);
    this.setState({
      seedCompanyId: '',
      productCategories: [],
      companyIds: [],
      seedCompanyIds: [],
      name: '',
      isFixed: false,
      compoundRate: 0,
      fixedFees: 0,
      nameAlertShow: false,
      companyAlertShow: false,
    });
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
      compoundRate,
      fixedFees,
      nameAlertShow,
      nameAlertText,
      companyAlertShow,
      companyAlertText,
      selectedSeedCompanyIds,
      selectedCompanyIds,
    } = this.state;
    //const seedCompany = seedCompanies.find(sc => sc.id === seedCompanyId);

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="lg">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h4>Finace Method</h4>
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
                labelText="Name of Finance Charge"
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

              <h4>Interest methods and rate</h4>
              <div>
                <FormControlLabel
                  //value="top"
                  control={
                    <Radio
                      checked={isFixed === false}
                      onChange={this.handleApplyTypeChange('compound')}
                      value="a"
                      name="radio-button-demo"
                      label="Compound Rate"
                      //inputProps={{ "aria-label": "A" }}
                    />
                  }
                  label="Compound Rate"
                />
                <CustomInput
                  id="compoundRate"
                  formControlProps={{
                    required: true,
                  }}
                  inputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    value: compoundRate,
                    onChange: this.handleRateChange('compoundRate'),
                    type: 'number',
                    max: 100,
                    min: 0,
                  }}
                />
              </div>
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
                      label="Fixed fees"
                    />
                  }
                  label="Fixed fees"
                />
                <CustomInput
                  id="fixedFees"
                  formControlProps={{
                    required: true,
                  }}
                  inputProps={{
                    endAdornment: <InputAdornment position="end">$</InputAdornment>,
                    value: fixedFees,
                    onChange: this.handleRateChange('fixedFees'),
                    type: 'number',
                  }}
                />
              </div>
            </React.Fragment>
          </GridItem>
        </GridContainer>
        <Divider />
        <div className={classes.footer}>
          <Button color="primary" className={classes.addAnotherButton} onClick={this.saveAndAdd}>
            SAVE AND ADD ANOTHER
          </Button>
          <Button color="primary" className={classes.editButton} onClick={this.create}>
            SAVE
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(styles)(AddFinaceMethodDialog);
