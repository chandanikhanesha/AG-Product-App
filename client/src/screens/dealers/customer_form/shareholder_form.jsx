import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash/function';
import Grid from '@material-ui/core/Grid';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';

import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';

const ShareholderForm = (props) => {
  const firstRun = useRef(true);
  const [name, setName] = useState(props.shareholder.name);
  const [businessStreet, setBusinessStreet] = useState(props.shareholder.businessStreet || '');
  const [businessCity, setBusinessCity] = useState(props.shareholder.businessCity || '');
  const [businessState, setBusinessState] = useState(props.shareholder.businessState || '');
  const [businessZip, setBusinessZip] = useState(props.shareholder.businessZip || '');

  const doUpdateShareholder = (data) => {
    props.updateShareholder(props.customerId, data);
  };

  const updateShareholder = useCallback(debounce(doUpdateShareholder, 1000), []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    updateShareholder({
      id: props.shareholder.id,
      name,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
    });
  }, [name, businessStreet, businessCity, businessState, businessZip]);

  return (
    <Card className={'shareholder-card'}>
      <CardBody>
        <Grid container>
          <Grid item xs={6}>
            <CustomInput
              labelText="Name"
              inputProps={{
                value: name,
                onChange: (e) => setName(e.target.value),
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomInput
              labelText="Address"
              inputProps={{
                value: businessStreet,
                onChange: (e) => setBusinessStreet(e.target.value),
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomInput
              labelText="City"
              inputProps={{
                value: businessCity,
                onChange: (e) => setBusinessCity(e.target.value),
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomInput
              labelText="State"
              inputProps={{
                value: businessState,
                onChange: (e) => setBusinessState(e.target.value),
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomInput
              labelText="Zip"
              inputProps={{
                value: businessZip,
                onChange: (e) => setBusinessZip(e.target.value),
              }}
            />
          </Grid>
        </Grid>
      </CardBody>
    </Card>
  );
};

export default ShareholderForm;
