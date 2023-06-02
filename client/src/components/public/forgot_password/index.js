import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';

import axios from 'axios';
import Snackbar from '@material-ui/core/Snackbar';

// icons
import Email from '@material-ui/icons/Email';
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

import { logIn } from '../../../store/actions';

const styles = Object.assign(
  {},

  loginPageStyle,
);

class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      cardAnimaton: 'cardHidden',
      showMessage: false,
      Message: '',
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
    const { email } = this.state;

    axios
      .post(`${process.env.REACT_APP_API_BASE}/forgot_pass`, { email })
      .then((response) => {
        localStorage.setItem('resetEmail', email);
        this.setState({
          showMessage: true,
          Message: response.data ? response.data.message : 'Check your email it send successfully',
          email: '',
        });
      })
      .catch((e) => {
        this.setState({ showMessage: true, Message: 'Email not sent, Please try again !!', email: '' });
        localStorage.removeItem('resetEmail');
      });
  }

  hideLoginError() {
    this.setState({
      showMessage: false,
    });
  }

  render() {
    const { classes } = this.props;
    const { email, showMessage, Message } = this.state;

    return (
      <div className={classes.content}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showMessage}
          autoHideDuration={5000}
          message={<span>{Message}</span>}
          onClick={() => this.setState({ showMessage: false })}
          onClose={() => this.setState({ showMessage: false })}
        />
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
                  </CardBody>
                  <CardFooter>
                    <Button
                      type="submit"
                      color="primary"
                      size="lg"
                      block
                      disabled={this.state.email === '' ? true : false}
                    >
                      Submit
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </GridItem>
          </GridContainer>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userId: state.userReducer.id,
  };
};

export default withStyles(styles)(connect(mapStateToProps)(ForgotPassword));
