import React, { Component, Fragment } from 'react';
import FormLabel from '@material-ui/core/FormLabel';
import Table from '../../material-dashboard/Table/Table';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';

class LicencesTable extends Component {
  state = {
    notIncludeList: [],
  };
  tableHeaders() {
    return ['Crop Type', 'Zone ID'];
  }

  tableData() {
    const { licences = [{ classification: '', zoneId: '' }] } = this.props;
    if (licences.length == 1) {
      return [];
    }
    const licencesRows = licences.map((licence, i) => {
      return [
        <Checkbox
          defaultChecked
          color="primary"
          inputProps={{ 'aria-label': 'secondary checkbox', display: 'none' }}
        />,
        <span>{licence.classification}</span>,
        <span>{Array.isArray(licence.zoneId) ? licence.zoneId[0] : licence.zoneId}</span>,
      ];
    });
    return licencesRows;
  }

  getEditTabledata() {
    const { licences = [{ classification: '', zoneId: '' }] } = this.props;
    if (licences.length == 1) {
      return [];
    }
    if (typeof licences == 'string') {
      const licencesRows = JSON.parse(licences).map((licence, i) => {
        return [
          <Checkbox
            defaultChecked
            color="primary"
            inputProps={{ 'aria-label': 'secondary checkbox', display: 'none' }}
          />,
          <span>{licence.classification}</span>,
          <span>{Array.isArray(licence.zoneId) ? licence.zoneId[0] : licence.zoneId}</span>,
        ];
      });
      return licencesRows;
    } else {
      const licencesRows = licences.map((licence, i) => {
        return [
          <Checkbox
            defaultChecked
            color="primary"
            inputProps={{ 'aria-label': 'secondary checkbox', display: 'none' }}
          />,
          <span>{licence.classification}</span>,
          <span>{licence.zoneId}</span>,
        ];
      });
      return licencesRows;
    }
    // const {
    //   licences,
    //   currentApiSeedCompany,
    //   requested,
    //   setLicencelist
    // } = this.props;
    // const zoneIds = JSON.parse(currentApiSeedCompany.zoneIds);
    // if (requested) {
    //   // temp code here
    //   const mapObj = {
    //     C: "CORN",
    //     B: "SOYBEAN",
    //     S: "SORGHUM",
    //     A: "ALFALFA",
    //     L: "CANOLA"
    //   };

    //   const licencesRows = [];
    //   const includedLicences = [];
    //   licences.map((licence, i) => {
    //     zoneIds.map(zone => {
    //       if (mapObj[zone.classification] === licence.classification) {
    //         if (Array.isArray(licence.zoneId)) {
    //           // future scope
    //         } else {
    //           if (
    //             Array.isArray(zone.zoneId) &&
    //             zone.zoneId.includes(licence.zoneId)
    //           ) {
    //             includedLicences.push(licence);
    //             licencesRows.push([
    //               <Checkbox
    //                 defaultChecked
    //                 color="primary"
    //                 inputProps={{
    //                   "aria-label": "secondary checkbox",
    //                   display: "none"
    //                 }}
    //               />,
    //               <span>{licence.classification}</span>,
    //               <span>{licence.zoneId}</span>
    //             ]);
    //           } else if (licence.zoneId === zone.zoneId) {
    //             includedLicences.push(licence);
    //             licencesRows.push([
    //               <Checkbox
    //                 defaultChecked
    //                 color="primary"
    //                 inputProps={{
    //                   "aria-label": "secondary checkbox",
    //                   display: "none"
    //                 }}
    //               />,
    //               <span>{licence.classification}</span>,
    //               <span>{licence.zoneId}</span>
    //             ]);
    //           } else {
    //             licencesRows.push([
    //               <Checkbox
    //                 defaultChecked
    //                 color="primary"
    //                 inputProps={{ "aria-label": "disabled checkbox" }}
    //               />,
    //               <span>{licence.classification}</span>,
    //               <span>{licence.zoneId}</span>
    //             ]);
    //           }
    //         }
    //       }
    //     });
    //   });
    //   const data = [];
    //   licences.map(licence => {
    //     if (!includedLicences.includes(licence)) {
    //       data.push(licence);
    //       licencesRows.push([
    //         <Checkbox
    //           defaultChecked
    //           color="primary"
    //           inputProps={{ "aria-label": "disabled checkbox" }}
    //         />,
    //         <span>{licence.classification}</span>,
    //         <span>{licence.zoneId}</span>
    //       ]);
    //     }
    //   });
    //   if (this.state.notIncludeList.length === 0) {
    //     this.setState({ notIncludeList: [...data] }, () => {
    //       setLicencelist(licences, this.state.notIncludeList);
    //     });
    //   }
    //   return licencesRows;
    // } else {
    //   const licencesRows = [];
    //   const mapObj = {
    //     C: "CORN",
    //     B: "SOYBEAN",
    //     S: "SORGHUM",
    //     A: "ALFALFA",
    //     L: "CANOLA"
    //   };

    //   zoneIds.map(licence => {
    //     licencesRows.push([
    //       <Checkbox
    //         defaultChecked
    //         color="primary"
    //         inputProps={{ "aria-label": "secondary checkbox", display: "none" }}
    //       />,
    //       <span>{mapObj[licence.classification]}</span>,
    //       <span>{licence.zoneId}</span>
    //     ]);
    //   });
    //   return licencesRows;
    // }

    // if (licences.length == 1 && customerLicenceList.length == 0) {
    //   return [];
    // }
    // const licencesRows = customerLicenceList.map((licence, i) => {
    //   if (Array.isArray(licence.zoneId)) {
    //     return [
    //       <Checkbox
    //         defaultChecked
    //         color="primary"
    //         inputProps={{ "aria-label": "secondary checkbox", display: "none" }}
    //       />,
    //       <span>{licence.classification}</span>,
    //       <ul>
    //         {licence.zoneId.map(item => (
    //           <li>{item}</li>
    //         ))}
    //       </ul>
    //     ];
    //   } else {
    //     return [
    //       <Checkbox
    //         defaultChecked
    //         color="primary"
    //         inputProps={{ "aria-label": "secondary checkbox", display: "none" }}
    //       />,
    //       <span>{licence.classification}</span>,
    //       <span>{licence.zoneId}</span>
    //     ];
    //   }
    // });
    // return licencesRows;
  }

  getcustomertabledata() {
    const { licences, currentApiSeedCompany, setLicencelist } = this.props;
    const zoneIds = currentApiSeedCompany ? JSON.parse(currentApiSeedCompany.zoneIds) : [];

    // just for the testing purpose

    // const { classes } = this.props;
    // const licences = [
    //   {
    //     classification: "c",
    //     zoneId: ["A1", "AB"]
    //   },
    //   { classification: "c", zoneId: "S2" },
    //   { classification: "c", zoneId: ["A4", "A3"] }
    // ];

    // temp code here
    const mapObj = {
      C: 'CORN',
      B: 'SOYBEAN',
      S: 'SORGHUM',
      // A: 'ALFALFA',
      L: 'CANOLA',
      P: 'PACKAGING',
    };
    if (licences.length == 1) {
      return [];
    }
    const licencesRows = [];
    const includedLicences = [];
    licences.map((licence, i) => {
      zoneIds.map((zone) => {
        if (mapObj[zone.classification] === licence.classification) {
          if (Array.isArray(licence.zoneId)) {
            // future scope
          } else {
            if (Array.isArray(zone.zoneId) && zone.zoneId.includes(licence.zoneId)) {
              includedLicences.push(licence);
              licencesRows.push([
                <Checkbox
                  defaultChecked
                  color="primary"
                  inputProps={{
                    'aria-label': 'secondary checkbox',
                    display: 'none',
                  }}
                />,
                <span>{licence.classification}</span>,
                <span>{licence.zoneId}</span>,
              ]);
            } else if (licence.zoneId === zone.zoneId) {
              includedLicences.push(licence);
              licencesRows.push([
                <Checkbox
                  defaultChecked
                  color="primary"
                  inputProps={{
                    'aria-label': 'secondary checkbox',
                    display: 'none',
                  }}
                />,
                <span>{licence.classification}</span>,
                <span>{licence.zoneId}</span>,
              ]);
            } else {
              licencesRows.push([
                <Checkbox defaultChecked color="primary" inputProps={{ 'aria-label': 'disabled checkbox' }} />,
                <span>{licence.classification}</span>,
                <span>{licence.zoneId}</span>,
              ]);
            }
          }
        }
      });
      // don't remove this can be helpful in future

      //   if (Array.isArray(licence.zoneId)) {
      //     return [
      //       <Checkbox
      //         defaultChecked
      //         color="primary"
      //         inputProps={{ "aria-label": "secondary checkbox", display: "none" }}
      //       />,
      //       <span>{licence.classification}</span>,
      //       <ul>
      //         {licence.zoneId.map(item => (
      //           <li>{item}</li>
      //         ))}
      //       </ul>
      //     ];
      //   } else {
      //     return [
      //       <Checkbox
      //         defaultChecked
      //         color="primary"
      //         inputProps={{ "aria-label": "secondary checkbox", display: "none" }}
      //       />,
      //       <span>{licence.classification}</span>,
      //       <span>{licence.zoneId}</span>
      //     ];
      //   }
    });
    const data = [];
    licences.map((licence) => {
      if (!includedLicences.includes(licence)) {
        data.push(licence);
        licencesRows.push([
          <Checkbox defaultChecked color="primary" inputProps={{ 'aria-label': 'disabled checkbox' }} />,
          <span>{licence.classification}</span>,
          <span>{licence.zoneId}</span>,
        ]);
      }
    });
    if (this.state.notIncludeList.length === 0) {
      this.setState({ notIncludeList: [...data] }, () => {
        setLicencelist(licences, this.state.notIncludeList);
      });
    }
    return licencesRows;
  }

  render() {
    const { classes, selectedZones, flag, customerZonesAndCrop, edit, licences } = this.props;
    const { notIncludeList } = this.state;

    return (
      <Fragment>
        <FormLabel className={classes.licencesTitle} component="legend">
          Licences{' '}
        </FormLabel>
        <div>
          <Table
            licences={licences}
            hover={true}
            tableHead={this.tableHeaders()}
            tableData={flag ? this.getcustomertabledata() : edit ? this.getEditTabledata() : this.tableData()}
            selectedZones={selectedZones}
            flag={flag}
            edit={edit}
            customerZonesAndCrop={customerZonesAndCrop}
            notIncludeList={notIncludeList}
          />
        </div>
      </Fragment>
    );
  }
}

export default LicencesTable;
