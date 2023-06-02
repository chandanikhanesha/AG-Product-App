import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles, InputAdornment } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';

// material-ui icons
import Face from '@material-ui/icons/Face';
import PersonOutline from '@material-ui/icons/PersonOutline';
import MailOutline from '@material-ui/icons/MailOutline';

// core components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import { inviteUser } from '../../../store/actions';

// custom component
import CTABar from '../../cta-bar';

const styles = (theme) => ({
  cardIcon: {
    color: 'white',
  },
  formControl: {
    margin: theme.spacing.unit,
    width: 175,
    marginLeft: 0,
  },
});

class UsersCreate extends Component {
  state = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    showSnackbar: false,
    showSnackbarMessage: '',
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  inviteUser = (e) => {
    e.preventDefault();

    const { inviteUser } = this.props;

    inviteUser(this.state)
      .then(() => {
        this.props.history.push('/app/admin/users');
      })
      .catch((e) => {
        this.setState({ showSnackbarMessage: `${e} from invite user`, showSnackbar: true });
      });
  };

  render() {
    const { classes } = this.props;
    const { firstName, lastName, email, role, showSnackbar, showSnackbarMessage } = this.state;

    return (
      <div>
        <GridContainer justifyContent="center">
          <GridItem xs={6}>
            <form action="#" onSubmit={this.inviteUser}>
              <Card>
                <CardHeader>
                  <CardIcon className={classes.cardIcon} color="gray">
                    <Face />
                  </CardIcon>

                  <h4>Invite User</h4>
                </CardHeader>

                <CardBody>
                  <CustomInput
                    labelText="First Name"
                    id="firstName"
                    formControlProps={{
                      fullWidth: true,
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
                          <MailOutline />
                        </InputAdornment>
                      ),
                      value: email,
                      type: 'email',
                      onChange: this.handleChange('email'),
                    }}
                  />

                  <FormControl fullWidth required>
                    <InputLabel htmlFor="role">User role</InputLabel>

                    <Select
                      native
                      required
                      value={role}
                      onChange={this.handleSelectChange}
                      inputProps={{
                        required: true,
                        name: 'role',
                        id: 'role',
                      }}
                    >
                      <option key={''} value={''}></option>
                      <option key={'admin'} value={'admin'}>
                        Administrator
                      </option>
                      <option key={'salesman'} value={'salesman'}>
                        Salesman
                      </option>
                    </Select>
                  </FormControl>
                </CardBody>

                <CardFooter>
                  <CTABar text="Invite" secondaryAction={() => this.props.history.push('/app/admin/users')} />
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          message={showSnackbarMessage}
          open={showSnackbar}
          showSnackbarColor="success"
          closeNotification={() => this.setState({ showSnackbar: false })}
          close
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      inviteUser,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(UsersCreate));
