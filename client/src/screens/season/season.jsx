import React, { Component } from 'react';
import { isUnloadedOrLoading } from '../../utilities';
import { format } from 'date-fns';
import SweetAlert from 'react-bootstrap-sweetalert';

// components
import Label from '@material-ui/icons/Label';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import Table from '../../components/material-dashboard/Table/Table';
import SeasonModal from './modal';

class Season extends Component {
  state = {
    showSeasonsModal: false,
    editMode: false,
    selectedSeason: null,
  };

  componentDidMount() {
    this.fetchOrganization().then(() => this.props.listSeasons());
  }

  isDefault(season) {
    const { organization } = this.props;
    return organization.defaultSeason === season.id;
  }

  fetchOrganization() {
    return this.props.loadOrganization(this.props.organizationId);
  }

  closeSeasonModal() {
    this.setState({ showSeasonsModal: false });
  }

  openSeasonModal() {
    this.setState({ showSeasonsModal: true });
  }

  showDeleteConfirmation(season) {
    this.setState({
      deleteConfirmAlert: (
        <SweetAlert
          warning
          showCancel
          title="Delete Season"
          onConfirm={() => this.deleteSeason(season.id)}
          onCancel={() => {
            this.setState({
              deleteConfirmAlert: null,
            });
          }}
        >
          Are you sure you want to remove it
        </SweetAlert>
      ),
    });
  }

  deleteSeason(seasonId) {
    this.props.deleteSeason(seasonId).then(() => {
      this.setState({
        deleteConfirmAlert: null,
      });
    });
  }

  editSeason(season) {
    season.isDefault = this.isDefault(season);
    this.setState(
      {
        selectedSeason: season,
        editMode: true,
      },
      this.openSeasonModal,
    );
  }

  createSeason() {
    this.setState(
      {
        selectedSeason: null,
        editMode: false,
      },
      this.openSeasonModal,
    );
  }

  get isLoading() {
    return [this.props.seasonsStatus].some(isUnloadedOrLoading);
  }

  get tableData() {
    const { seasons, organization } = this.props;
    return seasons.map((season) => [
      season.name,
      format(season.startDate, 'MMM D, YYYY'),
      format(season.endDate, 'MMM D, YYYY'),
      organization.defaultSeason === season.id ? 'YES' : 'NO',
      <React.Fragment>
        <Tooltip title="Edit season details">
          <Button color="primary" onClick={() => this.editSeason(season)}>
            Edit
          </Button>
        </Tooltip>
        <Tooltip title="Remove season">
          <Button color="danger" onClick={() => this.showDeleteConfirmation(season)}>
            Remove
          </Button>
        </Tooltip>
      </React.Fragment>,
    ]);
  }

  render() {
    if (this.isLoading) return <CircularProgress />;
    const { classes } = this.props;
    const { showSeasonsModal, selectedSeason, editMode, deleteConfirmAlert } = this.state;

    return (
      <div>
        {deleteConfirmAlert}
        <Button color="primary" onClick={() => this.createSeason()}>
          Add New Season
        </Button>
        <GridContainer>
          <GridItem xs={12}>
            <Card>
              <CardHeader color="gray" icon>
                <CardIcon color="gray">
                  <Label />
                </CardIcon>
                <h4 className={classes.cardIconTitle}>Seasons</h4>
              </CardHeader>
              <CardBody>
                <Table
                  hover={true}
                  tableHeaderColor="primary"
                  tableHead={['Name', 'Start Date', 'End Date', 'Default (PO, Quotes)', '']}
                  tableData={this.tableData}
                  customClassesForCells={[2]}
                />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
        {showSeasonsModal && (
          <SeasonModal
            open={showSeasonsModal}
            editMode={editMode}
            onClose={() => this.closeSeasonModal()}
            season={selectedSeason}
            afterCreate={() => this.fetchOrganization()}
            afterEdit={() => this.fetchOrganization()}
          />
        )}
      </div>
    );
  }
}

export default Season;
