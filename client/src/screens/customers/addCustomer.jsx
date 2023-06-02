import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { customersStyles } from '../customers/customers.styles';
import { createCustomer, updateCustomer } from '../../store/actions';
import axios from 'axios';
import ReactTable from 'react-table';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Snackbar from '@material-ui/core/Snackbar';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
class addCustomer extends Component {
  state = {
    Name: '',
    City: '',
    ContactFirstName: '',
    ContactLastName: '',
    Country: '',
    State: 'NE',
    Zip: '',
    Street: '',
    growerData: [],
    showSnackBar: false,
    messageForSnackBar: '',
    isLoading: false,
  };
  handleSubmit = (e) => {
    const { Name, City, ContactFirstName, ContactLastName, Country, State, Zip, Street } = this.state;
    this.setState({ isLoading: true });
    const data = {
      Name: Name || '',
      City: City || '',
      ContactFirstName: ContactFirstName || '',
      ContactLastName: ContactLastName || '',
      Country: Country || '',
      County: '',
      State: State || '',
      Zip: Zip || '',
      Street: Street || '',
    };
    axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/grower_licence/addGrower`, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        this.setState({ growerData: response.data.licences, isLoading: false });
      })
      .catch((e) => {
        this.setState({ isLoading: false });

        console.log(e, 'e');
      });
  };
  handleChange = (name, e) => {
    this.setState({ [name]: e.target.value });
  };
  addCustomer = async (value) => {
    console.log(value, 'value');
    const ZoneId = [];
    value.ZoneInformation.map((d) => {
      ZoneId.push({ classification: d.ProductCropCode, zoneId: d.ZoneId });
    });
    await this.props.createCustomer({
      organizationId: this.props.organizationId,
      notes: '',
      name: value.PartnerName,
      organizationName: '',
      email: '',
      officePhoneNumber: value.PhoneNumber,
      cellPhoneNumber: '',
      deliveryAddress: value.AddressLine,
      businessStreet: '',
      businessCity: value.CityName,
      businessState: value.State,
      businessZip: value.PostalCode,
      monsantoTechnologyId: value.PartnerTechId,
      PurchaseOrders: [],
      Quotes: [],
      Shareholders: [],
      zoneIds: JSON.stringify(ZoneId),
    });

    this.setState({ showSnackBar: true, messageForSnackBar: 'Customer Added Successfully' });
  };

  updateCustomerData = async (bayer, db) => {
    const ZoneId = [];
    bayer.ZoneInformation.map((d) => {
      ZoneId.push({ classification: d.ProductCropCode, zoneId: d.ZoneId });
    });

    await this.props
      .updateCustomer(db.id, {
        name: bayer.PartnerName,
        organizationName: db.organizationName,
        email: db.email,
        officePhoneNumber: db.officePhoneNumber,
        cellPhoneNumber: bayer.PhoneNumber,
        deliveryAddress: bayer.Address,
        businessStreet: db.businessStreet,
        isArchive: db.isArchive,
        businessCity: bayer.City,
        businessState: bayer.State,
        businessZip: bayer['Zip'],
        monsantoTechnologyId: bayer.PartnerTechId,
        isDefferedProduct: db.isDefferedProduct,
        glnId: bayer.glnId,

        zoneIds: JSON.stringify(ZoneId),
      })
      .then((res) => {
        this.setState({ showSnackBar: true, messageForSnackBar: 'Customer Update Successfully' });
      })
      .catch((e) => {
        this.setState({ showSnackBar: true, messageForSnackBar: 'Customer Update Failed' });
      });
  };
  render() {
    const { classes, customers } = this.props;
    const { showSnackBar, messageForSnackBar, growerData } = this.state;

    const tableHeader = [];
    growerData.length > 0 &&
      [...Object.keys(growerData[0]), 'btn'].map((d) => {
        return (
          d !== 'ZoneInformation' &&
          d !== 'ContactFirstName' &&
          d !== 'ContactLastName' &&
          d !== 'uuid' &&
          tableHeader.push({
            Header: d == 'btn' ? '' : d,
            id: d,
            sortable: true,
            accessor: (s) => s,
            Cell: (props) => {
              const isFind = customers.find((c) => c.name.trim() == props.value['PartnerName'].trim());
              let data = {};
              if (isFind !== undefined) {
                data = {
                  PartnerName: isFind.name.trim(),
                  PartnerTechId: isFind.monsantoTechnologyId,
                  ContactFirstName: '',
                  ContactLastName: '',
                  Address: isFind.deliveryAddress,
                  City: isFind.businessCity,
                  State: isFind.businessState,
                  Zip: isFind.businessZip,
                  County: '',
                  PhoneNumber: isFind.cellPhoneNumber,
                  LicenseStatus: '',
                  RenewalStatus: '',
                  LicenseNumber: isFind.monsantoTechnologyId,
                };
              }

              return d == 'btn' ? (
                <Button
                  style={{ background: '#4caf50', width: '100%' }}
                  onClick={() =>
                    isFind !== undefined ? this.updateCustomerData(props.value, isFind) : this.addCustomer(props.value)
                  }
                >
                  {isFind !== undefined ? 'Update' : 'Add'} Grower
                </Button>
              ) : (
                <div>
                  {isFind !== undefined && data[d] !== props.value[d] ? (
                    <p>
                      <span>Current system: {props.value[d]}</span>
                      <br />
                      <span> Bayer’s system : {data[d]}</span>
                    </p>
                  ) : (
                    props.value[d]
                  )}
                </div>
              );
            },
          })
        );
      });

    const vertical = 'top';
    const horizontal = 'right';
    return (
      <div className={classes.flexClass}>
        <Card style={{ width: '50%' }}>
          {' '}
          <h4 className={classes.flexClass}>Fetch Grower</h4>
          <div className={classes.flexClass}>
            <div className={classes.formDiv}>
              <TextField
                id="Name"
                className={classes.quantityTextField}
                label="BusinessName"
                type="text"
                onChange={(e) => this.handleChange('Name', e)}
                inputProps={{
                  type: 'text',

                  required: true,
                }}
              />
              <TextField
                id="ContactFirstName"
                className={classes.quantityTextField}
                label="ContactFirstName"
                type="text"
                onChange={(e) => this.handleChange('ContactFirstName', e)}
                inputProps={{
                  type: 'text',
                }}
              />
              <TextField
                id="ContactLastName"
                className={classes.quantityTextField}
                label="ContactLastName"
                type="text"
                onChange={(e) => this.handleChange('ContactLastName', e)}
                inputProps={{
                  type: 'text',
                }}
              />
            </div>

            <div className={classes.formDiv}>
              <TextField
                id="City"
                className={classes.quantityTextField}
                label="City"
                type="text"
                onChange={(e) => this.handleChange('City', e)}
                inputProps={{
                  type: 'text',
                }}
              />
              <TextField
                id="Country"
                className={classes.quantityTextField}
                label="Country"
                type="text"
                onChange={(e) => this.handleChange('Country', e)}
                inputProps={{
                  type: 'text',
                }}
              />
              <TextField
                id="Street"
                className={classes.quantityTextField}
                label="Street"
                type="text"
                onChange={(e) => this.handleChange('Street', e)}
                inputProps={{
                  type: 'text',
                }}
              />
            </div>

            <div className={classes.formDiv}>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 190 }} style={{ width: '190px' }}>
                <InputLabel id="demo-simple-select-standard-label">State</InputLabel>
                <Select
                  id="State"
                  onChange={(e) => this.handleChange('State', e)}
                  autoWidth
                  inputProps={{
                    className: classes.packagingSelect,
                    required: true,
                    name: 'compaines',
                    id: 'compaines',
                  }}
                >
                  {['NE', 'CO', 'KS', 'MN', 'SD', 'ND'].map((d) => {
                    return (
                      <MenuItem value={d} key={d} id={d}>
                        {d}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                id="Zip"
                className={classes.quantityTextField}
                label="Zip"
                type="text"
                onChange={(e) => this.handleChange('Zip', e)}
                inputProps={{
                  type: 'text',
                }}
              />
              <div style={{ width: '25%' }}></div>
            </div>

            <Button
              type="submit"
              onClick={this.handleSubmit}
              disabled={this.state.isLoading}
              style={{ margin: '10px', background: '#4caf50' }}
            >
              Serch Grower
            </Button>
          </div>
        </Card>
        <Snackbar
          open={showSnackBar}
          autoHideDuration={4000}
          onClose={() => this.setState({ showSnackBar: false })}
          anchorOrigin={{ vertical, horizontal }}
          message={messageForSnackBar}
          key={vertical + horizontal}
          onClick={() => this.setState({ showSnackBar: false })}
        ></Snackbar>
        {growerData.length > 0 && (
          <div style={{ width: '100%' }}>
            {' '}
            <ReactTable data={growerData} columns={tableHeader} minRows={1} resizable={false} showPagination={true} />
          </div>
        )}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
    organizationId: state.userReducer.organizationId,
  };
};
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCustomer,
      updateCustomer,
    },
    dispatch,
  );

export default withStyles(customersStyles)(connect(mapStateToProps, mapDispatchToProps)(addCustomer));
