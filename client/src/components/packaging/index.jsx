import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';

// icons
import Label from '@material-ui/icons/Label';

// material-ui core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Table from '../../components/material-dashboard/Table/Table';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Tooltip from '@material-ui/core/Tooltip';

import { cardTitle } from '../../assets/jss/material-dashboard-pro-react';

import { listPackagings, updatePackaging } from '../../store/actions';
import PackagingEditModal from './edit';

const styles = {
  cardIconTitle: {
    ...cardTitle,
    marginTop: '15px',
    marginBottom: '0px',
  },
  editButton: {
    backgroundColor: '#999',
  },
};

class Packagings extends Component {
  state = {
    editModalOpen: false,
    selectedPackage: null,
    seedCompanyId: null,
    seedCompany: null,
  };

  componentWillMount() {
    const { listPackagings, seedCompanies } = this.props;

    listPackagings();

    let seedCompanyId = parseInt(this.props.match.params.id, 10);

    this.setState({
      seedCompanyId,
      seedCompany: seedCompanies.find((sc) => sc.id === seedCompanyId),
    });
  }

  closeEditModal = () => {
    this.setState({
      editModalOpen: false,
      selectedPackage: null,
    });
  };

  editPackages = (id) => {
    const { packagings } = this.props;
    this.setState({
      editModalOpen: true,
      selectedPackage: packagings.find((p) => p.id === id),
    });
  };

  seedTypeName = (seedType) => {
    const { seedCompany } = this.state;
    switch (seedType) {
      case 'CORN':
        return seedCompany.cornBrandName || 'Corn';
      case 'SOYBEAN':
        return seedCompany.soybeanBrandName || 'Soybean';
      case 'SORGHUM':
        return seedCompany.sorghumBrandName || 'Sorghum';
      default:
        return '';
    }
  };

  render() {
    const { editModalOpen, selectedPackage, seedCompanyId, seedCompany } = this.state;
    const { packagings, classes, updatePackaging, isAdmin } = this.props;

    if (!seedCompany) return null;

    const tableData = packagings
      .filter((p) => p.seedCompanyId === seedCompanyId)
      .map((p) => [
        p.name,
        this.seedTypeName(p.seedType),
        p.numberOfBags,
        (isAdmin === true || isAdmin === 'true') && (
          <Tooltip title="Edit packaging details">
            <Button className={classes.editButton} onClick={() => this.editPackages(p.id)}>
              Edit
            </Button>
          </Tooltip>
        ),
      ]);

    return (
      <div>
        {(isAdmin === true || isAdmin === 'true') && (
          <Button
            color="primary"
            onClick={() => this.props.history.push(`/app/seed_companies/${seedCompanyId}/packaging/create`)}
          >
            New Packaging
          </Button>
        )}
        <GridContainer>
          <GridItem xs={12}>
            <Card>
              <CardHeader color="gray" icon>
                <CardIcon color="gray">
                  <Label />
                </CardIcon>

                <h4 className={classes.cardIconTitle}>Packaging</h4>
              </CardHeader>

              <CardBody>
                <Table
                  hover={true}
                  tableHeaderColor="primary"
                  tableHead={['Name', 'Seed Type', 'Number of bags', '']}
                  tableData={tableData}
                  customClassesForCells={[2]}
                />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
        {editModalOpen && (
          <PackagingEditModal
            selectedPackage={selectedPackage}
            open={editModalOpen}
            onClose={this.closeEditModal}
            updatePackaging={updatePackaging}
            seedCompany={seedCompany}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    packagings: state.packagingReducer.packagings,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    isAdmin: state.userReducer.isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listPackagings,
      updatePackaging,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Packagings));
