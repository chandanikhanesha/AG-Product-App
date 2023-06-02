import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles, InputAdornment, Grid } from '@material-ui/core';

// material-ui icons
import BusinessCenter from '@material-ui/icons/BusinessCenter';
import Home from '@material-ui/icons/Home';
import Email from '@material-ui/icons/Email';
import Phone from '@material-ui/icons/Phone';
import Collections from '@material-ui/icons/Collections';

// core components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Snackbars from '../../../components/material-dashboard/Snackbar/Snackbar';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import axios from 'axios';

import { loadOrganization, updateOrganization, deleteMonsantoInvoices } from '../../../store/actions';

// custom components
import CTABar from '../../cta-bar';

const styles = {
  errorMessage: {
    color: 'red',
  },
  cardIcon: {
    color: 'white',
  },
  logo: {
    maxWidth: '100%',
  },
};

class OrganizationProfile extends Component {
  state = {
    name: '',
    address: '',
    email: '',
    phoneNumber: '',
    logo: '',
    showSuccessSnackbar: false,
    loaded: false,
    businessStreet: '',
    businessCity: '',
    businessState: '',
    businessZip: '',
    message: '',
  };

  componentWillMount() {
    this.load();
  }

  load() {
    const { loadOrganization, organizationId } = this.props;
    loadOrganization(organizationId).then(() => {
      const {
        name,
        address,
        email,
        phoneNumber,
        logo,
        businessStreet,
        businessCity,
        businessState,
        businessZip,
        message,
      } = this.props;
      this.setState({
        name: name || '',
        address: address || '',
        email: email || '',
        phoneNumber: phoneNumber || '',
        loaded: true,
        logo: logo || '',
        businessStreet: businessStreet || '',
        businessCity: businessCity || '',
        businessState: businessState || '',
        businessZip: businessZip || '',
        message: message || '',
      });
    });
  }

  handleChange = (name) => (event) => {
    let val = event.target.files ? event.target.files[0] : event.target.value;

    this.setState({
      [name]: val,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { updateOrganization, organizationId } = this.props;
    const {
      name,
      address,
      email,
      phoneNumber,
      logo,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      message,
    } = this.state;

    let formData = new FormData();

    formData.append('name', name);
    formData.append('address', address);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('logo', logo);
    formData.append('businessStreet', businessStreet);
    formData.append('businessCity', businessCity);
    formData.append('businessState', businessState);
    formData.append('businessZip', businessZip);
    formData.append('message', message);

    updateOrganization(organizationId, formData).then(() => {
      this.load();
      this.setState({
        showSuccessSnackbar: true,
      });
      setTimeout(() => {
        this.setState({
          showSuccessSnackbar: false,
        });
      }, 4000);
    });
  };

  syncSummaryData = (id) => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/retailer_orders/syncSummaryData?seedCompanyId=${id}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        console.log(response.data.response.properties);
        response.data.response.properties.map((order) => {
          this.props
            .deleteMonsantoInvoices(order)
            .then((response) => {
              console.log(response);
            })
            .catch((e) => {
              // console.log(e)
              // this.setState({ isSyncingMonsantoProducts: false });
              if (e.message === 'Request failed with status code 503') {
                // this.setShowSnackbar(
                //   "The bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later."
                // );
              } else {
                // this.setShowSnackbar("Cannot sync with Bayer! Please try later!");
              }
            });
        });

        // if (response.data.status === true) {
        //   this.setShowSnackbar("Sync Summary Data successfully");
        // }
      })
      .catch((e) => console.log('e : ', e));
  };

  render() {
    const { classes, logo, apiSeedCompanies } = this.props;
    const {
      name,
      address,
      email,
      phoneNumber,
      showSuccessSnackbar,
      loaded,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      message,
    } = this.state;

    return (
      <div>
        <Snackbars
          place="tr"
          color="success"
          message="Organization updated successfully"
          open={showSuccessSnackbar}
          closeNotification={() => this.setState({ showSuccessSnackbar: false })}
          close
        />

        {loaded && (
          <GridContainer justifyContent="center">
            <GridItem xs={6}>
              <form action="#" onSubmit={this.handleSubmit}>
                <Card>
                  <CardHeader>
                    <CardIcon className={classes.cardIcon} color="gray">
                      <BusinessCenter />
                    </CardIcon>

                    <h4>Update organization</h4>
                  </CardHeader>

                  <CardBody>
                    <CustomInput
                      labelText="Business Name"
                      id="name"
                      formControlProps={{
                        fullWidth: true,
                        required: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <BusinessCenter />
                          </InputAdornment>
                        ),
                        value: name,
                        onChange: this.handleChange('name'),
                      }}
                    />

                    <Grid container>
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Email"
                          id="email"
                          formControlProps={{
                            fullWidth: true,
                          }}
                          inputProps={{
                            // endAdornment: (
                            //   <InputAdornment position="end">
                            //     <Email />
                            //   </InputAdornment>
                            // ),
                            value: email,
                            type: 'email',
                            onChange: this.handleChange('email'),
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} />
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Phone Number"
                          id="phoneNumber"
                          formControlProps={{
                            fullWidth: true,
                          }}
                          inputProps={{
                            // endAdornment: (
                            //   <InputAdornment position="end">
                            //     <Phone />
                            //   </InputAdornment>
                            // ),
                            value: phoneNumber,
                            type: 'phone',
                            onChange: this.handleChange('phoneNumber'),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Address1"
                          id="address"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            // endAdornment: (
                            //   <InputAdornment position="end">
                            //     <Home />
                            //   </InputAdornment>
                            // ),
                            value: address,
                            onChange: this.handleChange('address'),
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} />
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Address2"
                          id="businessStreet"
                          formControlProps={{
                            fullWidth: true,
                          }}
                          inputProps={{
                            value: businessStreet,
                            onChange: this.handleChange('businessStreet'),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Business City"
                          id="businessCity"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: businessCity,
                            onChange: this.handleChange('businessCity'),
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} />
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Business State"
                          id="businessState"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          placeholder="Example NE"
                          inputProps={{
                            value: businessState,
                            onChange: this.handleChange('businessState'),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Business Zip"
                          id="businessZip"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: businessZip,
                            onChange: this.handleChange('businessZip'),
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} />
                      <Grid item xs={5}>
                        <CustomInput
                          labelText="Message"
                          id="message"
                          formControlProps={{
                            fullWidth: true,
                            // required: true,
                          }}
                          placeholder="message"
                          inputProps={{
                            value: message,
                            onChange: this.handleChange('message'),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <CustomInput
                      labelText="Logo"
                      id="logo"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Collections />
                          </InputAdornment>
                        ),
                        onChange: this.handleChange('logo'),
                        type: 'file',
                        accept: 'image/*',
                      }}
                    />

                    {logo && (
                      <img className={classes.logo} alt={logo} src={`${process.env.REACT_APP_DO_BUCKET}/` + logo} />
                    )}
                  </CardBody>

                  <CardFooter>
                    <CTABar text="Update" secondaryAction={() => this.props.history.push('/app/customers')} />
                    {localStorage.getItem('userEmail') ===
                    ('hc.idea2code@gmail.com' ||
                      'sourabh.chakraborty@gmail.com' ||
                      'rajnavadiya6@gmail.com' ||
                      'nmc.schakraborty@gmail.com' ||
                      'ja.idea2code@gmail.com') ? (
                      <Button
                        color="primary"
                        onClick={() => this.syncSummaryData(apiSeedCompanies[0].id)}
                        className={classes.CTABar}
                      >
                        Sync PO
                      </Button>
                    ) : (
                      ''
                    )}
                  </CardFooter>
                </Card>
              </form>
            </GridItem>
          </GridContainer>
        )}
      </div>
    );
  }
}

// export default OrganizationProfile
const mapStateToProps = (state) => {
  return {
    name: state.organizationReducer.name,
    address: state.organizationReducer.address,
    email: state.organizationReducer.email,
    phoneNumber: state.organizationReducer.phoneNumber,
    message: state.organizationReducer.message,
    businessStreet: state.organizationReducer.businessStreet,
    businessCity: state.organizationReducer.businessCity,
    businessState: state.organizationReducer.businessState,
    businessZip: state.organizationReducer.businessZip,
    logo: state.organizationReducer.logo,
    organizationId: state.userReducer.organizationId,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      loadOrganization,
      updateOrganization,
      deleteMonsantoInvoices,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(OrganizationProfile));
