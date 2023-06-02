import React, { Component, Fragment } from 'react';

// material-ui icons
import BusinessCenter from '@material-ui/icons/BusinessCenter';

// core components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Snackbar from '@material-ui/core/Snackbar';
import Add from '@material-ui/icons/Add';

import { eventEmitter } from '../../../event_emitter';

// custom components
import CTABar from '../../cta-bar';
import SupportText from '../support_text';
import CropTypeEditor from '../crop_type_editor';
import defaultMetadata from '../default_metadata.json';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import CircularProgress from '@material-ui/core/CircularProgress';
import SweetAlert from 'react-bootstrap-sweetalert';
import InputLabel from '@material-ui/core/InputLabel';
import LicencesTable from './showLicencesTable';
import { Dialog, DialogActions, Tooltip } from '@material-ui/core';
import { totalPlansGroup } from '../../../utilities/subscriptionPlans';

class CreateCompany extends Component {
  state = {
    name: '',
    companyType: 'seedCompany',
    metadata: {},
    cropTypes: [],
    technologyId: '',
    glnId: '',
    password: '',
    apiSeedCompanyName: 'Bayer',
    apiSeedCompanyType: 'Monsanto',
    isSubmitting: false,
    error: false,
    isGettingLicences: false,
    licences: [{ classification: '', zoneId: '' }],
    showSnackbar: false,
    showSnackbarText: '',
    addNewCropDialogOpen: false,
    newCropName: '',
    removeLicencesIndexList: [],
    fetchedSubscription: false,
    subscriptionPlan: [],
    isOrganisationAddress: false,
  };

  componentDidMount() {
    const { orgAddress, orgBusinessCity, orgBusinessState, orgBusinessZip } = this.props;
    if (orgAddress && orgBusinessCity && orgBusinessState && orgBusinessZip) {
      this.setState({ isOrganisationAddress: true });
    }
    this.props.getSubscriptionPlans().then(() => {
      let selectedItem = [];
      this.props.planList.map(({ id, nickname }) => {
        if (this.props.subscriptionPlan.includes(nickname)) {
          selectedItem.push(nickname);
        }
      });

      // remove this one line when you want to allow this feature
      // selectedItem = selectedItem.filter(
      //   item => item !== "Bayer API Connectivity"
      // );
      this.setState({ subscriptionPlan: [...selectedItem] });
    });
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleChangeBrandName = (type) => (value) => {
    this.setState({
      metadata: {
        ...this.state.metadata,
        [type]: {
          ...this.state.metadata[type],
          brandName: value,
        },
      },
    });
  };

  handleChangeMetadata = (type) => (field) => (value) => {
    this.setState({
      metadata: {
        ...this.state.metadata,
        [type]: {
          ...this.state.metadata[type],
          [field]: value,
        },
      },
    });
  };

  handleAddNewCropType = () => {
    this.setState({
      addNewCropDialogOpen: true,
    });
  };

  handleSaveNewCrop = () => {
    const { newCropName, metadata } = this.state;

    this.setState({
      metadata: {
        ...metadata,
        [newCropName]: {
          brand: true,
          blend: true,
          rm: true,
          treatment: true,
          msrp: true,
          seedCompany: true,
          grower: true,
          longShort: true,
          qtyWarehouse: true,
          brandName: '',
          seedSource: false,
        },
      },
      addNewCropDialogOpen: false,
    });
  };

  getLicences = async () => {
    const { listLicences, userFirstName, userLastName } = this.props;
    const { technologyId, glnId, username, password } = this.state;
    const name = userFirstName + ' ' + userLastName;
    const isGlnId = true;
    try {
      this.setState({ isGettingLicences: true });
      const { data } = await listLicences({
        technologyId: glnId ? glnId : technologyId,
        name,
        username,
        password,
        isGlnId,
      });
      const latestLicenceList = [];
      data.licences[0].statusDetails
        .filter((d) => d.classification !== 'ALFALFA')
        .map((detail) => {
          if (latestLicenceList.length > 0) {
            let flag = true;
            latestLicenceList.map((item) => {
              if (item.classification == detail.classification && item.zoneId == detail.zoneId) {
                flag = false;
              }
            });
            if (flag) {
              latestLicenceList.push({
                classification: detail.classification,
                zoneId: detail.zoneId,
              });
            }
          } else {
            latestLicenceList.push({
              classification: detail.classification,
              zoneId: detail.zoneId,
            });
          }
        }) || [];
      this.setState(
        {
          licences: [...latestLicenceList],
        },
        this.setShowSnackbar('Connect with Bayer done!'),
      );
    } catch (err) {
      this.setShowSnackbar(
        err && err.response.data !== undefined
          ? err.response.data.error['con:reason']
            ? err.response.data.error['con:reason'][0]
            : err.response.data.error['con:details']
            ? err.response.data.error['con:details'][0]['err:WebServiceSecurityFault'][0]['err:faultstring'][0]
            : err.response.data.error
          : 'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
      );
      this.setState({ isGettingLicences: false });
    } finally {
      this.setState({ isGettingLicences: false });
    }
  };

  createCompany = (e) => {
    const { createSeedCompany, createCompany, createApiSeedCompany } = this.props;
    const {
      name,
      companyType,
      technologyId,
      glnId,
      password,
      username,
      apiSeedCompanyName,
      apiSeedCompanyType,
      licences,
      removeLicencesIndexList,
    } = this.state;
    const metadata = JSON.stringify(this.state.metadata);
    let isBrandName;
    Object.keys(this.state.metadata).map((p) => {
      if (this.state.metadata[p].brandName == '') {
        isBrandName = false;
      } else {
        isBrandName = true;
      }
    });

    e.preventDefault();
    if (companyType === 'company') {
      createCompany({ name }).then((response) => {
        eventEmitter.emit('newCompany');
        this.props.history.push(`/app/companies/${response.payload.id}`);
      });
    } else if (companyType === 'seedCompany' && Object.keys(this.state.metadata).length !== 0 && isBrandName) {
      createSeedCompany({
        name,
        metadata,
      }).then((response) => {
        eventEmitter.emit('newSeedCompany');
        this.props.history.push(`/app/seed_companies/${response.payload.id}`);
      });
    } else if (companyType === 'apiSeedCompany') {
      const updatedLicenceList = licences.filter((item, index) => {
        return !removeLicencesIndexList.includes(index.toString());
      });
      const apiSeedCompanyData = {
        name: apiSeedCompanyName,
        technologyId: technologyId ? technologyId.trim() : glnId.trim(),
        glnId: glnId.trim(),
        password: password.trim(),
        username: username.trim(),
        zoneIds: updatedLicenceList,
        metadata,
      };
      if (apiSeedCompanyType === 'Monsanto') {
        apiSeedCompanyData.cornBrandName = 'corn';
        apiSeedCompanyData.soybeanBrandName = 'soybean';
        apiSeedCompanyData.sorghumBrandName = 'sorghum';
        apiSeedCompanyData.alfalfaBrandName = 'alfalfa';
        apiSeedCompanyData.canolaBrandName = 'canola';
      }

      this.setState({ isSubmitting: true });
      createApiSeedCompany(apiSeedCompanyData)
        .then((response) => {
          eventEmitter.emit('newApiSeedCompany');
          this.props.history.push(`/app/d_api_seed_companies/${response.payload.id}`);
        })
        .catch((err) => {
          const message = err.response && err.response.data && err.response.data.message;
          this.setState({ error: { message } });
        })
        .finally(() => this.setState({ isSubmitting: false }));
    }

    if (companyType === 'seedCompany' && Object.keys(this.state.metadata).length == 0) {
      if (!isBrandName) {
        this.setShowSnackbar('CropName and BrandName are required');
      } else {
        this.setShowSnackbar('CropName and BrandName are required');
      }
    }
  };

  // handleLicenseChange = (name, i) => (event) => {
  //   let value = event.target.value;
  //   let rows = this.state.licences.slice();
  //   rows[i][name] = value;
  //   this.setState({
  //     licences: rows,
  //   });
  // };

  // addLicense = () => {
  //   const { licences } = this.state;
  //   let newLicense = { classification: "", zoneId: "" };
  //   this.setState({
  //     licences: [...licences, newLicense],
  //   });
  // };

  // removeLicense = (index) => (_) => {
  //   let rows = this.state.licences;
  //   rows.splice(index, 1);
  //   this.setState({
  //     detail: rows,
  //   });
  // };

  setShowSnackbar = (showSnackbarText) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
  };

  selectedZones = (Linelist) => {
    this.setState({ removeLicencesIndexList: [...Linelist] });
  };

  render() {
    const { classes } = this.props;
    const {
      name,
      companyType,
      metadata,
      technologyId,
      glnId,
      password,
      username,
      apiSeedCompanyName,
      apiSeedCompanyType,
      isSubmitting,
      error,
      licences,
      showSnackbar,
      showSnackbarText,
      isGettingLicences,
      addNewCropDialogOpen,
      newCropName,
      fetchedSubscription,
      subscriptionPlan,
      isOrganisationAddress,
    } = this.state;
    return (
      <GridContainer justifyContent="center">
        {error && (
          <SweetAlert
            error
            title="Error"
            confirmBtnCssClass={`${classes.button} ${classes.success}`}
            onConfirm={() => this.setState({ error: false })}
          >
            {error.message}
          </SweetAlert>
        )}
        <GridItem xs={7}>
          <form action="#" onSubmit={this.createCompany}>
            <Card>
              <CardHeader>
                <CardIcon className={classes.cardIcon} color="gray">
                  <BusinessCenter />
                </CardIcon>

                <h4>Create Seed Company</h4>
              </CardHeader>

              <CardBody>
                <FormLabel component="legend">
                  Company Type
                  {/* {} */}
                </FormLabel>
                <RadioGroup
                  aria-label="company-type"
                  name="company-type"
                  //className={classes.group}
                  value={companyType}
                  onChange={this.handleChange('companyType')}
                  style={{ flexDirection: 'row' }}
                >
                  {/* <FormControlLabel
                    value="seedCompany"
                    control={<Radio color="primary" />}
                    label="Seed Company"
                    style={{ marginRight: 40 }}
                  />
                  <FormControlLabel
                    value="company"
                    control={<Radio color="primary" />}
                    label="Company"
                  />
                  <FormControlLabel
                    value="apiSeedCompany"
                    control={<Radio color="primary" />}
                    label="Seed Company w/connectivity"
                  /> */}

                  <FormControlLabel
                    value="seedCompany"
                    control={
                      <Radio
                        id="seedCompanyBtn"
                        color="primary"
                        disabled={!subscriptionPlan.includes(totalPlansGroup.seed_company.label)}
                      />
                    }
                    label="Seed Company"
                    style={{ marginRight: 40 }}
                  />

                  <FormControlLabel
                    value="company"
                    control={
                      <Radio
                        id="regularCompanyBtn"
                        color="primary"
                        disabled={!subscriptionPlan.includes(totalPlansGroup.regular_company.label)}
                      />
                    }
                    label="Company"
                  />
                  {!subscriptionPlan.includes(totalPlansGroup.bayer_api_connectivity.label) ||
                  !subscriptionPlan.includes(totalPlansGroup.seed_company.label) ||
                  !subscriptionPlan.includes(totalPlansGroup.regular_company.label) ? (
                    <span>You have not purchase this features please purchase this fetaures</span>
                  ) : (
                    ''
                  )}
                  <FormControlLabel
                    value="apiSeedCompany"
                    control={
                      <Radio
                        color="primary"
                        id="bayerConnectivityBtn"
                        disabled={
                          !subscriptionPlan.includes(totalPlansGroup.bayer_api_connectivity.label) ||
                          (subscriptionPlan.includes(totalPlansGroup.bayer_api_connectivity.label) &&
                            this.props.isapiSeedCompanies)
                        }
                      />
                    }
                    label="Bayer Connectivity"
                  />
                </RadioGroup>

                {['seedCompany', 'company'].includes(companyType) && (
                  <Fragment>
                    <FormHelperText>Select company type to create</FormHelperText>
                    <CustomInput
                      labelText="Company Name"
                      id="companyName"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        value: name,
                        onChange: this.handleChange('name'),
                        required: true,
                      }}
                    />
                  </Fragment>
                )}

                {companyType === 'apiSeedCompany' && (
                  <Fragment>
                    {!isOrganisationAddress ? <span>please fill organisation address</span> : ''}
                    <FormControl style={{ width: '100%' }}>
                      <CustomInput
                        labelText="Name"
                        id="name"
                        inputProps={{
                          style: { width: '40%' },
                          value: apiSeedCompanyName,
                          onChange: this.handleChange('apiSeedCompanyName'),
                        }}
                      />
                    </FormControl>
                    {/* <FormControl style={{ width: "40%" }}>
                      <InputLabel shrink htmlFor="age-label-placeholder">
                        Connect To
                      </InputLabel>
                      <Select
                        value={apiSeedCompanyType}
                        onChange={this.handleChange("apiSeedCompanyType")}
                      >
                        <MenuItem value="Monsanto">Corn/Soybean/Canola/Sorghum/Alfalfa</MenuItem>
                      </Select>
                    </FormControl> */}
                    <GridContainer justifyContent="center">
                      {/* <GridItem xs={3}>
                        <FormControl fullWidth>
                          <CustomInput
                            labelText="Bayer Tech Id"
                            id="technologyId"
                            inputProps={{
                              required: true,
                              value: technologyId,
                              onChange: this.handleChange("technologyId")
                            }}
                          />
                        </FormControl>
                      </GridItem> */}
                      <GridItem xs={4}>
                        <FormControl fullWidth>
                          <CustomInput
                            id="bayerUserName"
                            labelText="Bayer Username"
                            inputProps={{
                              required: true,
                              value: username,
                              onChange: this.handleChange('username'),
                            }}
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem xs={4}>
                        <FormControl fullWidth>
                          <CustomInput
                            id="bayerPassword"
                            labelText="Bayer Password"
                            type="password"
                            inputProps={{
                              required: true,
                              value: password,
                              onChange: this.handleChange('password'),
                            }}
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem xs={4}>
                        <FormControl fullWidth>
                          <CustomInput
                            id="bayerGlnID"
                            labelText="Bayer GLN ID"
                            inputProps={{
                              value: glnId,
                              onChange: this.handleChange('glnId'),
                            }}
                          />
                        </FormControl>
                      </GridItem>
                    </GridContainer>

                    <Button
                      color="primary"
                      style={{ width: '180px', marginLeft: 10 }}
                      disabled={glnId === '' || username === '' || password === '' || isGettingLicences}
                      onClick={this.getLicences}
                      id="connectWithBayer"
                    >
                      {isGettingLicences ? 'Connecting with Bayer' : 'Connect with Bayer'}
                    </Button>
                    <LicencesTable licences={licences} selectedZones={this.selectedZones} classes={classes} />
                  </Fragment>
                )}

                {companyType === 'seedCompany' && (
                  <Fragment>
                    <FormLabel component="legend">Crop Types</FormLabel>
                    <CropTypeEditor
                      metadata={metadata}
                      onChangeBrandName={this.handleChangeBrandName}
                      onChangeMetadata={this.handleChangeMetadata}
                    />
                    <Tooltip title="Add New Crop Type">
                      <Button justIcon round color="primary" onClick={this.handleAddNewCropType} id="addcrop">
                        <Add />
                      </Button>
                    </Tooltip>
                  </Fragment>
                )}
              </CardBody>
              <CardFooter className={classes.footer}>
                <SupportText className={classes.supportText} />
                {isSubmitting ? (
                  <CircularProgress />
                ) : (
                  <CTABar
                    secondaryAction={() => this.props.history.push(`/app/customers`)}
                    disabled={companyType === 'apiSeedCompany' && licences.length < 2}
                  />
                )}
              </CardFooter>
            </Card>
          </form>
        </GridItem>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          autoHideDuration={null}
          message={<span>{showSnackbarText}</span>}
          onClick={() => this.setState({ showSnackbar: true })}
        />
        <Dialog open={addNewCropDialogOpen} maxWidth="xl" PaperProps={{ classes: { root: classes.dialog } }}>
          <Card className={classes.cropNameCard}>
            <CustomInput
              labelText="Crop Name"
              id="newCropName"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: newCropName,
                onChange: this.handleChange('newCropName'),
                required: true,
              }}
            />
            <DialogActions style={{ marginBottom: '20px' }}>
              <Button color="primary" className={classes.addButton} onClick={this.handleSaveNewCrop} id="cropSave">
                SAVE
              </Button>
              <Button
                onClick={() => {
                  this.setState({
                    newCropName: '',
                    addNewCropDialogOpen: false,
                  });
                }}
                color="primary"
              >
                Cancel
              </Button>
            </DialogActions>
          </Card>
        </Dialog>
      </GridContainer>
    );
  }
}
export default CreateCompany;
