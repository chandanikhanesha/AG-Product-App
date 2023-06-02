import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

// icons
import Email from '@material-ui/icons/Email';
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

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';

import loginPageStyle from '../../../assets/jss/material-dashboard-pro-react/views/loginPageStyle';
import sweetAlertStyle from '../../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

import { logIn } from '../../../store/actions';

const styles = Object.assign(
  {},

  sweetAlertStyle,
  loginPageStyle,
);

class LogIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      cardAnimaton: 'cardHidden',
      showLoginError: false,
      loginErrorMessage: '',
      organizationsList: [],
      openOrgPopup: false,
      selectedOrg: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.hideLoginError = this.hideLoginError.bind(this);
  }

  componentDidMount() {
    // we add a hidden class to the card and after 700 ms we delete it and the transition appears
    setTimeout(
      function () {
        this.setState({ cardAnimaton: '' });
      }.bind(this),
      700,
    );
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleSubmit(e) {
    e.preventDefault();

    const { logIn, history } = this.props;
    const { email, password } = this.state;

    logIn({ email, password })
      .then((data) => {
        if (data.payload.isMultipleAccess) {
          axios
            .get(`${process.env.REACT_APP_API_BASE}/organizations/listAll`, {
              headers: { 'x-access-token': localStorage.getItem('authToken') },
            })
            .then((response) => {
              if (response.data.data) {
                this.setState({ organizationsList: response.data.data, openOrgPopup: true });
              } else {
                console.log('nope organizations: ', response);
              }
            });
        } else if (data.payload.isSuperAdmin) {
          history.push('/app/super_admin');
        } else {
          history.push('/app/customers');
        }
      })
      .catch((e) => {
        let msg = e.response && e.response.status === 401 ? e.response.data.message : 'Login Error';

        this.setState({
          showLoginError: true,
          loginErrorMessage: msg,
        });
      });
  }

  hideLoginError() {
    this.setState({
      showLoginError: false,
    });
  }

  handleClose = () => {
    const { logIn, history, userId } = this.props;
    const { email, password } = this.state;
    axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/users/update/${userId}`,
        { organizationId: this.state.selectedOrg },
        { headers: { 'x-access-token': localStorage.getItem('authToken') } },
      )
      .then((response) => {
        if (response.status === 200) {
          logIn({ email, password })
            .then((data) => {
              history.push('/app/customers');
            })
            .catch((e) => {
              let msg = e.response.status === 401 ? e.response.data.message : 'Login Error';

              this.setState({
                showLoginError: true,
                loginErrorMessage: msg,
              });
            });
        }
      })
      .catch((e) => console.log('e : ', e));
    this.setState({
      openOrgPopup: false,
    });
  };

  handleChangeOrg = (event) => {
    this.setState({ selectedOrg: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { email, password, showLoginError, loginErrorMessage, organizationsList, openOrgPopup, selectedOrg } =
      this.state;

    return (
      <div className={classes.content}>
        {showLoginError && (
          <SweetAlert
            error
            title="Login Error"
            onConfirm={this.hideLoginError}
            confirmBtnCssClass={classes.button + ' ' + classes.success}
          >
            {loginErrorMessage}
          </SweetAlert>
        )}
        <div className={classes.container}>
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={6} md={4}>
              <form action="#" onSubmit={this.handleSubmit}>
                <Card login className={classes[this.state.cardAnimaton]}>
                  <CardHeader className={`${classes.cardHeader} ${classes.textCenter}`} color="gray">
                    <h4 className={classes.cardTitle}>Agri - Dealer</h4>
                  </CardHeader>

                  <CardBody>
                    <CustomInput
                      labelText="Email..."
                      id="email"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Email className={classes.inputAdornmentIcon} />
                          </InputAdornment>
                        ),
                        value: email,
                        onChange: this.handleChange('email'),
                      }}
                    />
                    <CustomInput
                      labelText="Password"
                      id="password"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <LockOutline className={classes.inputAdornmentIcon} />
                          </InputAdornment>
                        ),
                        value: password,
                        onChange: this.handleChange('password'),
                        type: 'password',
                      }}
                    />
                  </CardBody>
                  <CardFooter>
                    <Button type="submit" color="primary" size="lg" block>
                      Log in
                    </Button>
                  </CardFooter>
                  <a className={classes.forgot_text} href="/forgot_password">
                    Forgot Password..
                  </a>
                </Card>
              </form>
            </GridItem>
          </GridContainer>
        </div>
        <Dialog open={openOrgPopup} onClose={this.handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Choose Organizations</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-select-organizations"
              select
              label="Select"
              value={selectedOrg}
              onChange={this.handleChangeOrg}
              helperText="Please select organizations from list"
            >
              {organizationsList &&
                organizationsList
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((option, index) => (
                    <MenuItem key={index} value={option.id} id={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" id="orgSubmit">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logIn,
    },
    dispatch,
  );

const mapStateToProps = (state) => {
  return {
    userId: state.userReducer.id,
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(LogIn));
