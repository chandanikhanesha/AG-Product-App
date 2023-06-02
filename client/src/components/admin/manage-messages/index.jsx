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
import Radio from '@material-ui/core/Radio';
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

class ManageMessages extends Component {
  state = {
    messages: [],
    messageAdd: null,
    selectedMessageId: null,
    showSnackbar: false,
    showSnackbarColor: null,
    showSnackbarMessage: null,
  };

  componentDidMount() {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/organizations/message-list`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        response.data.map((c) => {
          if (c.isSelected == true) {
            this.setState({ selectedMessageId: c.id });
          }
        });
        this.setState({ messages: response.data });
      });
  }

  handleChange = (event) => {
    this.setState({ selectedMessageId: event.target.value });
  };
  handleChangeMessage = (event) => {
    this.setState({ messageAdd: event.target.value });
  };

  addMessage = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/organizations/add-message-settings`,
        { message: this.state.messageAdd },
        {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        },
      )
      .then((response) => {
        if (response.data.SuperAdminSetting) {
          this.setState({ showSnackbar: true, showSnackbarMessage: 'message added', showSnackbarColor: 'success' });
        }
        this.setState({ messages: [...this.state.messages, response.data.SuperAdminSetting] });
      })
      .catch(() => {
        this.setState({ showSnackbar: true, showSnackbarMessage: "message didn't add", showSnackbarColor: 'danger' });
      });
  };
  update = () => {
    const { selectedMessageId } = this.state;
    axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/organizations/${selectedMessageId}/update-message-status`,
        { isSelected: true },
        {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        },
      )
      .then((response) => {
        if (response.data.SuperAdminSetting) {
          this.setState({ selectedMessageId: selectedMessageId });
          this.setState({
            showSnackbar: true,
            showSnackbarMessage: 'updated successfully',
            showSnackbarColor: 'success',
          });
        }
      })
      .catch(() => {
        this.setState({ showSnackbar: true, showSnackbarMessage: 'update fails', showSnackbarColor: 'danger' });
      });
  };

  render() {
    const { classes, logo, apiSeedCompanies } = this.props;
    const { messages, selectedMessageId, showSnackbar, showSnackbarMessage, showSnackbarColor, messageAdd } =
      this.state;

    return (
      <div>
        <Snackbars
          place="tr"
          color={showSnackbarColor}
          message={showSnackbarMessage}
          open={showSnackbar}
          closeNotification={() => this.setState({ showSnackbar: false })}
          close
        />

        <GridContainer justifyContent="center">
          <GridItem xs={6}>
            <form action="#" onSubmit={this.handleSubmit}>
              <Card>
                <CardHeader>
                  <CardIcon className={classes.cardIcon} color="gray">
                    <BusinessCenter />
                  </CardIcon>

                  <h4>Manage Messages</h4>
                </CardHeader>

                <CardBody>
                  <Grid container>
                    <Grid item xs={9}>
                      <CustomInput
                        labelText="Add Message"
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
                          value: messageAdd,
                          onChange: this.handleChangeMessage,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button color="primary" onClick={() => this.addMessage()} className={classes.CTABar}>
                        Add Message
                      </Button>
                    </Grid>
                    {messages.map((message) => (
                      <React.Fragment>
                        <Grid item xs={12}>
                          <Radio
                            key={message.id}
                            checked={selectedMessageId == message.id}
                            onChange={this.handleChange}
                            value={message.id}
                          />
                          {message.message}
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                </CardBody>

                <CardFooter>
                  <Button color="primary" onClick={() => this.update()} className={classes.CTABar}>
                    Update
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

// export default ManageMessages
const mapStateToProps = (state) => {
  return {
    name: state.organizationReducer.name,
    address: state.organizationReducer.address,
    email: state.organizationReducer.email,
    phoneNumber: state.organizationReducer.phoneNumber,
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

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ManageMessages));
