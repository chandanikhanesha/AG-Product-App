import React, { Component, Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '../../material-dashboard/CustomButtons/Button';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import Tooltip from '@material-ui/core/Tooltip';
import FormLabel from '@material-ui/core/FormLabel';
import Table from '../../material-dashboard/Table/Table';

class LicencesTable extends Component {
  tableHeaders() {
    return ['Crop Type', 'Zone Id'];
  }

  tableData() {
    const {
      licences = [{ classification: '', zoneId: '' }],
      handleLicenseChange,
      removeLicense,
      addLicense,
    } = this.props;

    const licencesRows = licences.map((licence, i) => {
      return [
        <TextField
          label="Crop Type"
          onChange={handleLicenseChange('classification', i)}
          value={licence.classification}
        />,
        <TextField label="Zone ID" onChange={handleLicenseChange('zoneId', i)} value={licence.zoneId} />,
        <Button size="sm" justIcon round color="primary" onClick={removeLicense(i)}>
          <Remove />
        </Button>,
      ];
    });

    licencesRows.push([
      null,
      null,
      <Tooltip title="Add License Row">
        <Button size="sm" justIcon round color="primary" onClick={addLicense}>
          <Add />
        </Button>
      </Tooltip>,
    ]);

    return licencesRows;
  }

  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <FormLabel className={classes.licencesTitle} component="legend">
          Licences{' '}
        </FormLabel>
        <div>
          <Table hover={true} tableHead={this.tableHeaders()} tableData={this.tableData()} />
        </div>
      </Fragment>
    );
  }
}

export default LicencesTable;
