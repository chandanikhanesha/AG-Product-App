import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';
import SweetAlert from 'react-bootstrap-sweetalert';

// core components
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';

import { showInterestChargeStyles } from './show_interest_charge.styles';

class ShowInterestCharge extends Component {
  state = {
    removeChargeConfirm: null,
    removeTnterestCharge: null,
  };
  removeConfirm = (interestCharge) => {
    const { classes, deleteInterestCharge, listInterestCharges } = this.props;

    interestCharge &&
      this.setState({
        removeChargeConfirm: (
          <SweetAlert
            showCancel
            title={'Remove Interest Charge' + interestCharge.name}
            onConfirm={async () => {
              await deleteInterestCharge(interestCharge.id);
              this.setState({ removeChargeConfirm: null }, () => {
                listInterestCharges(true);
              });
            }}
            onCancel={() => this.setState({ removeChargeConfirm: null })}
            confirmBtnText="Remove"
            confirmBtnCssClass={classes.button + ' ' + classes.success}
            cancelBtnText="Cancel"
            cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
          >
            You are going to remove Interest Charge {interestCharge.name}
          </SweetAlert>
        ),
      });
  };

  getCertainDays = (certainDays) => {
    if (certainDays === 15) return '15 days';
    if (certainDays === 30) return '1 months';
    if (certainDays === 90) return '3 months';
    return;
  };

  render() {
    const { interestCharges, companies, classes, seedCompanies, preview = false, isAdmin } = this.props;
    const { removeChargeConfirm } = this.state;

    if (!seedCompanies || !seedCompanies.length) return null;
    return (
      <GridContainer>
        {interestCharges.map((interestCharge) => {
          let seedCompany = seedCompanies.find((sc) => sc.id === interestCharge.seedCompanyId);
          let compoundingDays = this.getCertainDays(interestCharge.compoundingDays);
          let certainDaysDescription = '';
          if (interestCharge.applyToCertainDate) {
            certainDaysDescription = this.getCertainDays(interestCharge.certainDays);
          }
          return (
            <GridItem xs={4} key={interestCharge.id}>
              <Card style={preview ? { margin: 0 } : null}>
                <CardHeader className={classes.cardHeader}>
                  <h4>{interestCharge.name}</h4>
                  {(isAdmin === true || isAdmin === 'true') && (
                    <div>
                      <Button
                        className={classes.editButton}
                        onClick={() =>
                          this.props.history.push(`/app/setting/interest_charge/${interestCharge.id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        onClick={() => this.removeConfirm(interestCharge)}
                        className={classes.removeButton}
                      >
                        Remove
                      </Button>
                      {removeChargeConfirm}
                    </div>
                  )}
                </CardHeader>

                <CardBody>
                  {interestCharge.applyToWholeOrder === false && interestCharge.productCategories.length > 0 && (
                    <div>
                      Seed brands:&nbsp;
                      {interestCharge.productCategories.map((productCategory) => {
                        return (
                          <span key={productCategory}>
                            {seedCompany[`${productCategory.toLowerCase()}BrandName`]}
                            &nbsp;
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {interestCharge.applyToWholeOrder === false && interestCharge.companyIds.length > 0 && (
                    <div>
                      Business Companies:&nbsp;
                      {interestCharge.companyIds.map((companyId) => {
                        return (
                          <span key={companyId}>
                            {companies.find((co) => co.id === companyId)
                              ? companies.find((co) => co.id === companyId).name
                              : null}
                            &nbsp;
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {interestCharge.applyToFixedDate
                    ? 'Apply to a fixed start date: ' + format(interestCharge.fixedDate, 'MMMM Do YYYY')
                    : null}
                  {interestCharge.applyToCertainDate
                    ? 'Apply to a certain No. Of days after Order: ' + certainDaysDescription
                    : null}
                  <br />
                  Compunding Interest Charge: {compoundingDays}
                  <br />
                  Interest Charge: {interestCharge.interestCharge}%
                  <br />
                  Use by default: {interestCharge.useByDefault ? 'Yes' : 'No'} <br />
                  Apply to whole order: {interestCharge.applyToWholeOrder ? 'Yes' : 'No'}
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
      </GridContainer>
    );
  }
}

export default withStyles(showInterestChargeStyles)(ShowInterestCharge);
