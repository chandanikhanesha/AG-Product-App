import React, { Component } from 'react';

// material-ui icons
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';

// core components
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { customerFormStyles } from './customer_form.styles';
import LicencesTable from '../../../components/seed-company/create/showLicencesTable';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import ShareholderForm from './shareholder_form';
import NoteReport from '../../../screens/customernotes';

class CustomerForm extends Component {
  state = {
    isGettingLicences: false,
    licences: [{ classification: '', zoneId: '' }],
    showSnackbar: false,
    showSnackbarText: '',
    requested: false,
  };

  componentDidMount() {
    const { edit } = this.props;
    const { licences } = this.props;
    if (edit) {
      if (this.props.licences.length > 0) {
        this.setState({ licences });
      }
    }
  }

  getLicences = async () => {
    const { listLicences, monsantoTechnologyId, glnId, name, edit, currentApiSeedCompany } = this.props;
    const technologyId = monsantoTechnologyId === '' ? glnId : monsantoTechnologyId;

    try {
      this.setState({ isGettingLicences: true });
      const { data } = await listLicences({
        technologyId: glnId ? glnId : technologyId,
        name,
        username: currentApiSeedCompany.username,
        password: currentApiSeedCompany.password,
      });
      this.setState(
        {
          licences:
            data.licences && data.licences.length > 0
              ? data.licences[0].statusDetails
                  .filter((d) => d.classification !== 'ALFALFA')
                  .map((detail) => {
                    return {
                      classification: detail.classification,
                      zoneId: detail.zoneId,
                    };
                  })
              : [],
        },
        () => {
          if (edit) {
            this.setState({ requested: true });
          }
          this.setShowSnackbar('Connect with Bayer done!');
        },
      );
      this.setState({ isGettingLicences: false });
    } catch (err) {
      console.log(err);
      this.setShowSnackbar(
        (err && err.response.data.error) ||
          'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
      );
      this.setState({ isGettingLicences: false });
    } finally {
      this.setState({ isGettingLicences: false });
    }
  };

  setShowSnackbar = (showSnackbarText, timeout = 3000) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
    setTimeout(() => {
      this.setState({
        showSnackbar: false,
        showSnackbarText: '',
      });
    }, timeout);
  };

  render() {
    const {
      name,
      organizationName,
      email,
      handleChange,
      //officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      // handleLicenseChange,
      // addLicense,
      // removeLicense,
      // licences,
      willUseSeedDealerZones,
      classes,
      glnId,
      notes,
      selectedTab,
      edit,
      shareholders,
      customerId,
      flag,
      currentApiSeedCompany,
      customerZonesAndCrop,
      setLicencelist,
    } = this.props;
    const { licences, showSnackbar, showSnackbarText, isGettingLicences, requested } = this.state;
    return (
      <div>
        <Grid container>
          {(selectedTab === 'basic' || !selectedTab) && (
            <React.Fragment>
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
              <Grid item xs={1} />
              <Grid item xs={6}>
                <CustomInput
                  labelText="Organization Name"
                  id="organizationName"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    value:
                      organizationName ||
                      (typeof currentApiSeedCompany !== 'undefined' && currentApiSeedCompany.organizationName) ||
                      '',
                    onChange: handleChange('organizationName'),
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <CustomInput
                  labelText="Bayer Tech ID"
                  id="monsantoTechnologyId"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    value:
                      monsantoTechnologyId ||
                      (typeof currentApiSeedCompany !== 'undefined' && currentApiSeedCompany.organizationName) ||
                      '',
                    onChange: handleChange('monsantoTechnologyId'),
                  }}
                />
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={6}>
                <CustomInput
                  labelText="GLN ID"
                  id="glnId"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    value: glnId,
                    onChange: handleChange('glnId'),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  color="primary"
                  style={{ width: '180px', marginLeft: 10 }}
                  disabled={(monsantoTechnologyId === '' && glnId === '') || isGettingLicences}
                  onClick={this.getLicences}
                >
                  {isGettingLicences ? 'Connecting with Bayer' : 'Connect with Bayer'}
                </Button>
              </Grid>
              <Grid item xs={11}>
                <FormControlLabel
                  key="willUseSeedDealerZones"
                  label="Use seed dealer zones"
                  control={
                    <Checkbox
                      checked={willUseSeedDealerZones}
                      onChange={handleChange('willUseSeedDealerZones')}
                      value={willUseSeedDealerZones}
                    />
                  }
                />
              </Grid>
              {!willUseSeedDealerZones && (
                <Grid item xs={11}>
                  {/* <LicencesTable
                    licences={licences}
                    classes={classes}
                    customerZonesAndCrop={customerZonesAndCrop}
                    currentApiSeedCompany={currentApiSeedCompany}
                    flag={flag}
                    edit={edit}
                    requested={requested}
                    setLicencelist={setLicencelist}
                  /> */}
                </Grid>
              )}
            </React.Fragment>
          )}
          {(selectedTab === 'note' || !selectedTab) && edit && (
            <Grid item xs={12}>
              <TextField
                label="Note"
                id="notes"
                fullWidth
                style={{ border: '1px solid black' }}
                inputProps={{
                  value: notes,
                  type: 'text',
                  onChange: handleChange('notes'),
                }}
                multiline
                rows={4}
              />
            </Grid>
          )}

          {(selectedTab === 'address' || !selectedTab) && (
            <React.Fragment>
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
              <Grid item xs={1} />
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
                This Business Address section is the one used in the Invoice Preview
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
              <Grid item xs={1} />
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
              <Grid item xs={1} />
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
            </React.Fragment>
          )}

          {shareholders !== undefined && (selectedTab === 'shareholders' || !selectedTab) && (
            <React.Fragment>
              {shareholders
                .filter((sh) => sh.customerId === customerId)
                .map((shareholder) => (
                  <div className={classes.shareholderContainer}>
                    <ShareholderForm
                      customerId={customerId}
                      shareholder={shareholder}
                      updateShareholder={this.props.updateShareholder}
                    />
                  </div>
                ))}
            </React.Fragment>
          )}
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
        {selectedTab === 'noteall' && (
          <React.Fragment>
            <NoteReport customerId={customerId} />
          </React.Fragment>
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span>{showSnackbarText}</span>}
          onClose={() => this.setState({ showSnackbar: false })}
        />
      </div>
    );
  }
}

export default withStyles(customerFormStyles)(CustomerForm);
