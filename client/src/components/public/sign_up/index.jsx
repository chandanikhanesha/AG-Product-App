import React, { Component } from 'react';
import { withStyles, Grid } from '@material-ui/core';
import axios from 'axios';

// material-dashboard components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardFooter from '../../../components/material-dashboard/Card/CardFooter';

import loginPageStyle from '../../../assets/jss/material-dashboard-pro-react/views/loginPageStyle';

const styles = (theme) =>
  Object.assign({}, loginPageStyle, {
    error: {
      color: theme.palette.error.main,
    },
  });

class SignUp extends Component {
  state = {
    page: 0,
    formErrors: [],
    organizationName: '',
    organizationAddress: '',
    userFirstName: '',
    userLastName: '',
    userEmail: '',
    userEmailConfirmation: '',
    userPassword: '',
    userPasswordConfirmation: '',
    address: '',
    phoneNumber: '',
    businessStreet: '',
    businessCity: '',
    businessState: '',
    businessZip: '',
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  goToNextStep = () => {
    let formErrors = [];
    let page = 1;

    if (this.formEl.checkValidity() === false) {
      formErrors.push('All fields are required');
      page = 0;
    }

    this.setState({
      page,
      formErrors,
    });
  };

  submit = () => {
    const {
      userEmail,
      userEmailConfirmation,
      userPassword,
      userPasswordConfirmation,
      organizationName,
      organizationAddress,
      userFirstName,
      userLastName,
      address,
      phoneNumber,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
    } = this.state;

    let valid = true;
    let formErrors = [];

    // if (userEmail !== userEmailConfirmation) {
    //   valid = false
    //   formErrors.push('Emails do not match')
    // }

    if (userPassword !== userPasswordConfirmation) {
      valid = false;
      formErrors.push('Passwords do not match');
    }

    if (this.userFormEl.checkValidity() === false) {
      valid = false;
      formErrors.push('All fields are required');
    }

    if (!valid) return this.setState({ formErrors });

    const user = { email: userEmail, password: userPassword, firstName: userFirstName, lastName: userLastName };
    const organization = {
      name: organizationName,
      address,
      email: userEmail,
      phoneNumber,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
    };

    axios
      .post(`${process.env.REACT_APP_API_BASE}/auth/sign_up`, { user, organization })
      .then((response) => {
        this.setState({
          page: 2,
        });
      })
      .catch((e) => {
        console.log(e);
        if (e.response.data) {
          this.setState(
            {
              formErrors: [e.response.data.errors],
            },
            console.log(this.state.formErrors),
          );
        }
      });
  };

  render() {
    const { page, formErrors } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.content}>
        <div className={classes.container}>
          <GridContainer justifyContent="center">
            <GridItem xs={8}>
              {page === 0 && (
                <div>
                  <Card>
                    <CardHeader>
                      <h4>Organization</h4>
                    </CardHeader>

                    <CardBody>
                      {formErrors.length > 0 &&
                        formErrors.map((formError, i) => (
                          <div key={i} className={classes.error}>
                            {formError}
                          </div>
                        ))}
                      <form ref={(form) => (this.formEl = form)} href="#" onSubmit={(e) => e.preventDefault()}>
                        <CustomInput
                          labelText="Organization Name"
                          id="organization-name"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: this.state.organizationName,
                            onChange: this.handleChange('organizationName'),
                          }}
                        />
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
                                value: this.state.address,
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
                                value: this.state.businessStreet,
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
                                value: this.state.businessCity,
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
                                value: this.state.businessState,
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
                                value: this.state.businessZip,
                                onChange: this.handleChange('businessZip'),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </form>
                    </CardBody>

                    <CardFooter>
                      <Button onClick={this.goToNextStep}>Next</Button>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {page === 1 && (
                <div>
                  <Card>
                    <CardHeader>
                      <h4>Admin User</h4>
                    </CardHeader>

                    <CardBody>
                      {formErrors.length > 0 &&
                        formErrors.map((formError, i) => (
                          <div key={i} className={classes.error}>
                            {formError}
                          </div>
                        ))}
                      <form ref={(form) => (this.userFormEl = form)} href="#" onSubmit={(e) => e.preventDefault()}>
                        <CustomInput
                          labelText="First Name"
                          id="userFirstName"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: this.state.userFirstName,
                            onChange: this.handleChange('userFirstName'),
                          }}
                        />

                        <CustomInput
                          labelText="Last Name"
                          id="userLastName"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: this.state.userLastName,
                            onChange: this.handleChange('userLastName'),
                          }}
                        />

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
                            value: this.state.phoneNumber,
                            type: 'phone',
                            onChange: this.handleChange('phoneNumber'),
                          }}
                        />

                        <CustomInput
                          labelText="User Email"
                          id="user-email"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: this.state.userEmail,
                            onChange: this.handleChange('userEmail'),
                            type: 'email',
                          }}
                        />

                        {/* <CustomInput
                        labelText="Email confirmation"
                        id="user-emailConfirmation"
                        formControlProps={{
                          fullWidth: true,
                          required: true
                        }}
                        inputProps={{
                          value: this.state.userEmailConfirmation,
                          onChange: this.handleChange('userEmailConfirmation'),
                          type: 'email'
                        }} /> */}

                        <CustomInput
                          labelText="Password"
                          id="user-password"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: this.state.userPassword,
                            onChange: this.handleChange('userPassword'),
                            type: 'password',
                          }}
                        />

                        <CustomInput
                          labelText="Password confirmation"
                          id="user-passwordConfirmation"
                          formControlProps={{
                            fullWidth: true,
                            required: true,
                          }}
                          inputProps={{
                            value: this.state.userPasswordConfirmation,
                            onChange: this.handleChange('userPasswordConfirmation'),
                            type: 'password',
                          }}
                        />
                      </form>
                    </CardBody>

                    <CardFooter>
                      <Button onClick={() => this.setState({ page: 0 })}>Back</Button>

                      <Button onClick={this.submit} id="createUser">
                        Create
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {page === 2 && (
                <div>
                  <Card>
                    <CardBody>
                      <p>Success! Check your email for a verification link.</p>
                    </CardBody>
                  </Card>
                </div>
              )}
            </GridItem>
          </GridContainer>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SignUp);
