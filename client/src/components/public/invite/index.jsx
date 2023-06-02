import React, { Component } from 'react';
import axios from 'axios';
import { withStyles, InputAdornment } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SweetAlert from 'react-bootstrap-sweetalert';

// icons
import PersonOutline from '@material-ui/icons/PersonOutline';
import MailOutline from '@material-ui/icons/MailOutline';
import LockOutline from '@material-ui/icons/LockOutlined';
// core components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardFooter from '../../../components/material-dashboard/Card/CardFooter';

import loginPageStyle from '../../../assets/jss/material-dashboard-pro-react/views/loginPageStyle';
import sweetAlertStyle from '../../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

import { acceptInvite } from '../../../store/actions';

const styles = Object.assign(
  {},
  {
    errorMessage: {
      color: 'red',
    },
  },
  sweetAlertStyle,
  loginPageStyle,
);

class Invite extends Component {
  state = {
    firstName: '',
    lastName: '',
    email: '',
    inviteToken: '',
    password: '',
    passwordConfirmation: '',
    passwordConfirmationErrorText: '',
    id: -1,
    loaded: false,
    passwordConfirmationError: false,
    showInviteError: false,
  };

  componentWillMount() {
    const { token } = this.props.match.params;
    axios
      .get(`${process.env.REACT_APP_API_BASE}/auth/invite?token=${token}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        const { firstName, lastName, email, id } = response.data.user;
        this.setState({ firstName, lastName, email, id, inviteToken: token, loaded: true });
      });
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  acceptInvite = (e) => {
    e.preventDefault();

    const { firstName, lastName, email, inviteToken, id, password, passwordConfirmation } = this.state;
    const { acceptInvite } = this.props;

    if (password !== passwordConfirmation) {
      return this.setState({
        passwordConfirmationError: true,
        passwordConfirmationErrorText: 'passwords must match',
      });
    }

    if (password.length < 8) {
      return this.setState({
        passwordConfirmationError: true,
        passwordConfirmationErrorText: 'password must be at least 8 characters',
      });
    }

    acceptInvite({ firstName, lastName, email, inviteToken, id, password, passwordConfirmation })
      .then(() => {
        this.props.history.push('/app/home');
      })
      .catch((e) => {
        this.setState({
          showInviteError: true,
        });
      });
  };

  hideInviteError() {
    this.setState({
      showInviteError: false,
    });
  }

  render() {
    const { classes } = this.props;
    const {
      firstName,
      lastName,
      email,
      loaded,
      password,
      passwordConfirmation,
      passwordConfirmationError,
      passwordConfirmationErrorText,
      showInviteError,
    } = this.state;

    return (
      <div className={classes.content}>
        {showInviteError && (
          <SweetAlert
            error
            title="Login Error"
            onConfirm={this.hideInviteError}
            confirmBtnCssClass={classes.button + ' ' + classes.success}
          >
            Error accepting invite
          </SweetAlert>
        )}
        <div className={classes.container}>
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={6} md={4}>
              {loaded && (
                <form onSubmit={this.acceptInvite}>
                  <Card login>
                    <CardHeader className={`${classes.cardHeader} ${classes.textCenter}`} color="gray">
                      <h4 className={classes.cardTitle}>Agri - Dealer</h4>
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
                              <PersonOutline className={classes.inputAdornmentIcon} />
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
                              <PersonOutline className={classes.inputAdornmentIcon} />
                            </InputAdornment>
                          ),
                          value: lastName,
                          onChange: this.handleChange('lastName'),
                        }}
                      />

                      <CustomInput
                        labelText="Email"
                        id="email"
                        formControlProps={{
                          fullWidth: true,
                          required: true,
                        }}
                        inputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <MailOutline className={classes.inputAdornmentIcon} />
                            </InputAdornment>
                          ),
                          value: email,
                          onChange: this.handleChange('email'),
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
                          required: true,
                        }}
                        inputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <LockOutline className={classes.inputAdornmentIcon} />
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
                          required: true,
                        }}
                        inputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <LockOutline className={classes.inputAdornmentIcon} />
                            </InputAdornment>
                          ),
                          value: passwordConfirmation,
                          type: 'password',
                          onChange: this.handleChange('passwordConfirmation'),
                        }}
                      />
                    </CardBody>

                    <CardFooter>
                      <Button type="submit" color="primary" size="lg" block>
                        Accept Invite
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              )}
            </GridItem>
          </GridContainer>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      acceptInvite,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(Invite));
