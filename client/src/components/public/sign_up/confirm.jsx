import React, { Component } from 'react';
import axios from 'axios';
import { withStyles, CardHeader } from '@material-ui/core';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Link } from 'react-router-dom';

// material-dashboard components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';

// material dashboard pro styles
import loginPageStyle from '../../../assets/jss/material-dashboard-pro-react/views/loginPageStyle';
import sweetAlertStyle from '../../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

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

class ConfirmSignUp extends Component {
  state = {
    error: false,
    success: false,
  };

  componentWillMount() {
    const { token } = this.props.match.params;
    axios
      .get(`${process.env.REACT_APP_API_BASE}/auth/confirm?token=${token}`)
      .then((response) => {
        if (response.data.ok) {
          this.setState({
            success: true,
          });
        } else {
          this.setState({
            error: true,
          });
        }
      })
      .catch((e) => {
        this.setState({
          error: true,
        });
      });
  }

  render() {
    const { classes } = this.props;
    const { error, success } = this.state;

    return (
      <div className={classes.content}>
        {error && (
          <SweetAlert error title="Confirmation Error" confirmBtnCssClass={classes.button + ' ' + classes.success}>
            Error confirming email
          </SweetAlert>
        )}
        <div className={classes.container}>
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={6} md={4}>
              {success && (
                <Card>
                  <CardHeader>Success!</CardHeader>

                  <CardBody>
                    Successfully confirmed email.
                    <br />
                    Now <Link to="/log_in">sign in</Link> to get started!
                  </CardBody>
                </Card>
              )}
            </GridItem>
          </GridContainer>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ConfirmSignUp);
