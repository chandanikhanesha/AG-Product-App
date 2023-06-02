import React, { Component } from 'react';

// material-ui icons
import Grid from '@material-ui/core/Grid';

// core components
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

class CustomerForm extends Component {
  render() {
    const {
      name,
      organizationName,
      email,
      handleChange,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
    } = this.props;

    return (
      <div>
        <Grid item xs={5}>
          <CustomInput
            labelText="Name"
            id="name"
            formControlProps={{
              fullWidth: true,
              required: true,
            }}
            inputProps={{
              value: name,
              onChange: handleChange('name'),
            }}
          />
        </Grid>

        <Grid container>
          <Grid item xs={5}>
            <CustomInput
              labelText="Organization Name"
              id="organizationName"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: organizationName,
                onChange: handleChange('organizationName'),
              }}
            />
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={5}>
            <CustomInput
              labelText="Bayer ID"
              id="monsantoTechnologyId"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: monsantoTechnologyId,
                onChange: handleChange('monsantoTechnologyId'),
              }}
            />
          </Grid>

          <Grid item xs={5}>
            <CustomInput
              labelText="Email"
              id="email"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: email,
                type: 'email',
                onChange: handleChange('email'),
              }}
            />
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={5}>
            <CustomInput
              labelText="Phone#"
              id="cellPhoneNumber"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: cellPhoneNumber,
                type: 'phone',
                onChange: handleChange('cellPhoneNumber'),
              }}
            />
          </Grid>

          <Grid item xs={11}>
            <CustomInput
              labelText="Delivery Address"
              id="deliveryAddress"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: deliveryAddress,
                onChange: handleChange('deliveryAddress'),
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <CustomInput
              labelText="Business Street"
              id="businessStreet"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: businessStreet,
                onChange: handleChange('businessStreet'),
              }}
            />
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={5}>
            <CustomInput
              labelText="Business City"
              id="businessCity"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: businessCity,
                onChange: handleChange('businessCity'),
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <CustomInput
              labelText="Business State"
              id="businessState"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: businessState,
                onChange: handleChange('businessState'),
              }}
            />
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={5}>
            <CustomInput
              labelText="Business Zip"
              id="businessZip"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: businessZip,
                onChange: handleChange('businessZip'),
              }}
            />
          </Grid>
        </Grid>
        {/* <CustomInput
            labelText="Office Phone Number"
            id="officePhoneNumber"
            formControlProps={{
              fullWidth: true
            }}
            inputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Phone />
                </InputAdornment>
              ),
              value: officePhoneNumber,
              type: 'phone',
              onChange: handleChange('officePhoneNumber')
            }} /> */}

        {/* <CustomInput
          labelText="Business Street"
          id="businessStreet"
          formControlProps={{
            fullWidth: true
          }}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Home />
              </InputAdornment>
            ),
            value: businessStreet,
            onChange: handleChange('businessStreet')
          }} />
        <CustomInput
          labelText="Business City"
          id="businessCity"
          formControlProps={{
            fullWidth: true
          }}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Home />
              </InputAdornment>
            ),
            value: businessCity,
            onChange: handleChange('businessCity')
          }} />
        <CustomInput
          labelText="Business State"
          id="businessState"
          formControlProps={{
            fullWidth: true
          }}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Home />
              </InputAdornment>
            ),
            value: businessState,
            onChange: handleChange('businessState')
          }} />
        <CustomInput
          labelText="Business Zip"
          id="businessZip"
          formControlProps={{
            fullWidth: true
          }}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Home />
              </InputAdornment>
            ),
            value: businessZip,
            onChange: handleChange('businessZip')
          }} /> */}

        {/* 
        <CustomInput
          labelText="Customer Notes"
          id="notes"
          formControlProps={{
            fullWidth: true
          }}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Notes />
              </InputAdornment>
            ),
            value: notes,
            onChange: handleChange('notes')
          }} /> */}
      </div>
    );
  }
}

export default CustomerForm;
