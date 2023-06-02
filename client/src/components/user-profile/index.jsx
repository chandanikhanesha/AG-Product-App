import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles, InputAdornment } from '@material-ui/core';
import axios from 'axios';

// material-ui icons
import Face from '@material-ui/icons/Face';
import PersonOutline from '@material-ui/icons/PersonOutline';
import LockOutline from '@material-ui/icons/LockOutlined';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Snackbars from '../../components/material-dashboard/Snackbar/Snackbar';

import { updateUser } from '../../store/actions';

// custom components
import CTABar from '../cta-bar';

const styles = {
  errorMessage: {
    color: 'red',
  },
  cardIcon: {
    color: 'white',
  },
};

class UserProfile extends Component {
  state = {
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirmation: '',
    passwordConfirmationError: false,
    passwordConfirmationErrorText: '',
    loaded: false,
    showSuccessSnackbar: false,
  };

  componentWillMount() {
    const { id } = this.props;

    axios
      .get(`${process.env.REACT_APP_API_BASE}/users/${id}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        this.setState({ ...response.data.user, loaded: true });
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { updateUser, id } = this.props;
    const { firstName, lastName, password, passwordConfirmation } = this.state;

    if (password !== passwordConfirmation) {
      return this.setState({
        passwordConfirmationError: true,
        passwordConfirmationErrorText: 'passwords must match',
      });
    }

    if (password && password.length < 8) {
      return this.setState({
        passwordConfirmationError: true,
        passwordConfirmationErrorText: 'password must be at least 8 characters',
      });
    }

    let updateObj = {
      firstName,
      lastName,
    };

    if (password && passwordConfirmation && password === passwordConfirmation) {
      updateObj.password = password;
      updateObj.passwordConfirmation = passwordConfirmation;
    }

    updateUser(id, updateObj).then(() => {
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

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;
    const {
      firstName,
      lastName,
      password,
      passwordConfirmation,
      passwordConfirmationError,
      passwordConfirmationErrorText,
      loaded,
      showSuccessSnackbar,
    } = this.state;

    return (
      <div>
        <Snackbars
          place="tr"
          color="success"
          message="User updated successfully"
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
                      <Face />
                    </CardIcon>

                    <h4>Update profile</h4>
                  </CardHeader>

                  <CardBody>
                    <CustomInput
                      labelText="First Name"
                      id="firstName"
                      formControlProps={{
                        fullWidth: true,
                        required: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <PersonOutline />
                          </InputAdornment>
                        ),
                        value: firstName,
                        onChange: this.handleChange('firstName'),
                      }}
                    />

                    <CustomInput
                      labelText="Last Name"
                      id="lastName"
                      formControlProps={{
                        fullWidth: true,
                        required: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <PersonOutline />
                          </InputAdornment>
                        ),
                        value: lastName,
                        onChange: this.handleChange('lastName'),
                      }}
                    />

                    {passwordConfirmationError && (
                      <p className={classes.errorMessage}>{passwordConfirmationErrorText}</p>
                    )}

                    <CustomInput
                      labelText="Password"
                      id="password"
                      error={passwordConfirmationError}
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <LockOutline />
                          </InputAdornment>
                        ),
                        value: password,
                        type: 'password',
                        onChange: this.handleChange('password'),
                      }}
                    />

                    <CustomInput
                      labelText="Password confirmation"
                      id="passwordConfirmation"
                      error={passwordConfirmationError}
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <LockOutline />
                          </InputAdornment>
                        ),
                        value: passwordConfirmation,
                        type: 'password',
                        onChange: this.handleChange('passwordConfirmation'),
                      }}
                    />
                  </CardBody>

                  <CardFooter>
                    <CTABar text="Update" secondaryAction={() => this.props.history.push('/app/customers')} />
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

const mapStateToProps = (state) => {
  return {
    id: state.userReducer.id,
  };
};

const mapDispachToProps = (dispatch) =>
  bindActionCreators(
    {
      updateUser,
    },
    dispatch,
  );

// export default UserProfile
export default withStyles(styles)(connect(mapStateToProps, mapDispachToProps)(UserProfile));
